"use strict";
/*
  深度补丁引擎。

  只做一种补丁：在客户端打包文件（asar / JS）里做**等长文本替换**。
  等长意味着文件大小不变，asar 的偏移表不会被破坏；带 integrity 的 asar
  会同时把头部里的 SHA256 换掉，否则 Electron 启动校验失败直接退出。

  状态：
    applied  —— 替换值都在、原文都不在
    pending  —— 原文还在
    skipped  —— 原文和替换值都找不到（客户端升级改了写法，不乱改）
    missing  —— 文件找不到或读不了
*/

const nodeFs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

// Electron 会给 fs 打 asar 补丁：直接读 .asar 文件本身会 ENOENT。
// original-fs 是未打补丁的版本，专用于这种场景；普通 Node 下回退到 node:fs。
let fs = nodeFs;
try {
  fs = require("original-fs");
} catch {
  fs = nodeFs;
}

const BAK = ".zerox.bak";

/** 补丁表。文件路径按候选列表给，取第一个存在的。 */
function patchTable() {
  return [
    {
      id: "dsh-instructions-budget",
      client: "dsh",
      label: "DSH 指令预算",
      detail: "AGENTS.md 预算 65,536 → 99,999 字节",
      files: [
        "D:\\360\\dsh\\resources\\app.asar",
        path.join(process.env.LOCALAPPDATA || "", "Programs", "DeepSeek Harness", "resources", "app.asar"),
      ],
      processName: "DeepSeek Harness.exe",
      anchors: [{ from: "maxBytes: 65536", to: "maxBytes: 99999" }],
    },
  ];
}

function pickFile(entry) {
  for (const f of entry.files || []) {
    try {
      if (f && fs.existsSync(f)) return f;
    } catch {
      /* 忽略不可访问的候选 */
    }
  }
  return null;
}

function isRunning(processName) {
  if (!processName) return false;
  try {
    const out = require("node:child_process").execFileSync("tasklist", ["/FI", `IMAGENAME eq ${processName}`, "/NH"], { encoding: "utf8", windowsHide: true });
    return out.toLowerCase().includes(processName.toLowerCase());
  } catch {
    return false;
  }
}

function asBuf(s) {
  return Buffer.from(s, "utf8");
}

function countBytes(buf, needle) {
  const b = asBuf(needle);
  let n = 0;
  let i = 0;
  while (true) {
    const idx = buf.indexOf(b, i);
    if (idx < 0) break;
    n++;
    i = idx + b.length;
  }
  return n;
}

function publicInfo(entry) {
  return {
    id: entry.id,
    client: entry.client,
    label: entry.label,
    detail: entry.detail,
    anchors: entry.anchors.map((a) => ({ from: a.from, to: a.to })),
  };
}

function status(entry) {
  const file = pickFile(entry);
  if (!file) return { ...publicInfo(entry), state: "missing", file: null };
  let buf;
  try {
    buf = fs.readFileSync(file);
  } catch (e) {
    return { ...publicInfo(entry), state: "missing", file, error: String((e && e.message) || e) };
  }
  let fromTotal = 0;
  let toTotal = 0;
  for (const a of entry.anchors) {
    fromTotal += countBytes(buf, a.from);
    toTotal += countBytes(buf, a.to);
  }
  const state = entry.unsupported ? "skipped" : toTotal > 0 && fromTotal === 0 ? "applied" : fromTotal > 0 ? "pending" : "skipped";
  return {
    ...publicInfo(entry),
    state,
    file,
    fromTotal,
    toTotal,
    running: isRunning(entry.processName),
    backup: fs.existsSync(file + BAK),
  };
}

/** 读 asar 头部：偏移 12 处 4 字节是 header 长度，头部从 16 开始。 */
function readAsarHeader(buf) {
  const headerSize = buf.readUInt32LE(12);
  const start = 16;
  const json = JSON.parse(buf.slice(start, start + headerSize).toString("utf8"));
  return { headerSize, start, json };
}

function asarEntry(json, relPath) {
  let node = json;
  for (const seg of relPath.split("/")) {
    if (!node.files || !node.files[seg]) return null;
    node = node.files[seg];
  }
  return node;
}

/**
   带 integrity 的 asar：改内容的同时把头部 SHA256 换掉。
   哈希是 64 位十六进制，等长替换不改变头部大小与偏移。
   目前只处理单块文件（目标文件都小于 4MB）。
*/
function patchAsarIntegrity(out, entry) {
  const { headerSize, start, json } = readAsarHeader(out);
  const node = asarEntry(json, entry.asarPath);
  if (!node || !node.integrity) throw new Error("asar 条目缺少 integrity：" + entry.asarPath);
  const ig = node.integrity;
  if (!Array.isArray(ig.blocks) || ig.blocks.length !== 1) {
    throw new Error("暂不支持多块文件：blocks=" + (ig.blocks || []).length);
  }
  const contentStart = start + headerSize + Number(node.offset);
  const content = out.slice(contentStart, contentStart + Number(node.size));
  const oldHash = crypto.createHash("sha256").update(content).digest("hex");
  if (ig.hash !== oldHash) throw new Error("头部哈希与文件内容不一致，拒绝改动");

  let changed = 0;
  for (const a of entry.anchors) {
    if (a.from.length !== a.to.length) throw new Error("锚点长度不一致：" + a.from);
    const from = asBuf(a.from);
    const to = asBuf(a.to);
    let i = 0;
    while (true) {
      const idx = content.indexOf(from, i);
      if (idx < 0) break;
      to.copy(content, idx);
      changed++;
      i = idx + to.length;
    }
  }
  if (!changed) throw new Error("锚点未命中，本次不做修改");

  const newHash = crypto.createHash("sha256").update(content).digest("hex");
  const oldBuf = Buffer.from(oldHash, "utf8");
  const newBuf = Buffer.from(newHash, "utf8");
  let hdrChanged = 0;
  let i = start;
  while (true) {
    const idx = out.indexOf(oldBuf, i);
    if (idx < 0 || idx >= start + headerSize) break;
    newBuf.copy(out, idx);
    hdrChanged++;
    i = idx + newBuf.length;
  }
  if (!hdrChanged) throw new Error("头部哈希替换失败");
  return { changed, hdrChanged, oldHash, newHash };
}

/** 应用补丁：先备份，再替换，写入临时文件后原子替换。 */
function apply(entry) {
  if (entry.unsupported) throw new Error("该客户端有内嵌完整性校验，字节补丁会导致启动失败，已禁用");
  const file = pickFile(entry);
  if (!file) throw new Error("找不到目标文件：" + (entry.files || []).join(" / "));
  if (isRunning(entry.processName)) {
    throw new Error("客户端正在运行，文件被占用：请先完全退出 " + entry.client + " 再应用");
  }
  const buf = fs.readFileSync(file);
  const out = Buffer.from(buf);
  let changed = 0;
  let hdrChanged = 0;

  if (entry.asarPath) {
    const r = patchAsarIntegrity(out, entry);
    changed = r.changed;
    hdrChanged = r.hdrChanged;
  } else {
    for (const a of entry.anchors) {
      if (a.from.length !== a.to.length) {
        throw new Error("锚点长度不一致，拒绝替换：" + a.from + " -> " + a.to);
      }
      const from = asBuf(a.from);
      const to = asBuf(a.to);
      let i = 0;
      while (true) {
        const idx = out.indexOf(from, i);
        if (idx < 0) break;
        to.copy(out, idx);
        changed++;
        i = idx + to.length;
      }
    }
  }
  if (!changed) throw new Error("锚点未命中：可能客户端已升级，本次不做任何修改");

  const bak = file + BAK;
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
  const tmp = file + ".zerox.tmp";
  fs.writeFileSync(tmp, out);
  try {
    fs.renameSync(tmp, file);
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch {}
    throw new Error("写入失败（文件可能被客户端占用）：" + (e && e.message ? e.message : e));
  }
  return { file, changed, hdrChanged, backup: bak, sizeBefore: buf.length, sizeAfter: fs.statSync(file).size };
}

/** 还原：用备份覆盖回去，保留备份。 */
function revert(entry) {
  const file = pickFile(entry);
  if (!file) throw new Error("找不到目标文件");
  const bak = file + BAK;
  if (!fs.existsSync(bak)) throw new Error("没有备份，无法还原：" + bak);
  fs.copyFileSync(bak, file);
  return { file, restoredFrom: bak, size: fs.statSync(file).size };
}

module.exports = { patchTable, status, apply, revert, pickFile };
