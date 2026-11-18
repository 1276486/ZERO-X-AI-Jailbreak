/**
 * ZERO-X破甲 · 界面
 *
 * 布局：顶部导航 + 目标卡片网格 + 右侧抽屉，
 * 组件与配色全部来自 Astryx 深色主题。功能仍走 preload 暴露的 window.hs。
 */
import { useCallback, useEffect, useMemo, useState } from "react";

import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "@astryxdesign/theme-neutral/theme.css";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { Button } from "@astryxdesign/core/Button";
import { Badge } from "@astryxdesign/core/Badge";
import { TabList, Tab } from "@astryxdesign/core/TabList";
import { Drawer } from "@astryxdesign/core/Drawer";
import { StatusDot } from "@astryxdesign/core/StatusDot";

import {
  APP_NAME,
  APP_VERSION,
  TARGETS,
  DISCLAIMER_TEXT,
  DISCLAIMER_TITLE,
  TUTORIAL_TEXT,
  TUTORIAL_TITLE,
  QQ_GROUP,
  QQ_LINK,
  RELAY_LINK,
} from "./data/targets";
import {
  hs,
  type InstalledMap,
  type MemoryPrompt,
  type SkillItem,
  type SkillTargetState,
  type McpServer,
  type InjectMode,
} from "./lib/hs";
import "./ui.css";
import logo from "./assets/logo.png";

type Section = "targets" | "memory" | "skills" | "mcp" | "about";
type Tone = "idle" | "busy" | "ok" | "err";

const STATUS_DOT: Record<Tone, "neutral" | "accent" | "success" | "error"> = {
  idle: "neutral",
  busy: "accent",
  ok: "success",
  err: "error",
};

export function App() {
  const [section, setSection] = useState<Section>("targets");
  const [openTarget, setOpenTarget] = useState<string | null>(null);
  const [installed, setInstalled] = useState<InstalledMap>({});
  const [memory, setMemory] = useState<MemoryPrompt>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("就绪");
  const [level, setLevel] = useState<Tone>("idle");
  const [logText, setLogText] = useState("");
  const [logOpen, setLogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  // 「记忆」页：编辑 memory 目录里的指令正文
  const [memName, setMemName] = useState("指令集.md");
  const [memText, setMemText] = useState("");
  const [memSaved, setMemSaved] = useState("");
  const [memBusy, setMemBusy] = useState(false);
  // 注入模式：full = memory 下完整提示词；targeted = memory/针对 下按目标的短提示词
  const [injectMode, setInjectMode] = useState<InjectMode>("full");
  // 「技能」页：浏览与编辑随包技能库
  const [skillItems, setSkillItems] = useState<SkillItem[]>([]);
  const [skillTargets, setSkillTargets] = useState<Record<string, SkillTargetState>>({});
  const [skillId, setSkillId] = useState("");
  const [skillText, setSkillText] = useState("");
  const [skillSaved, setSkillSaved] = useState("");
  const [skillBusy, setSkillBusy] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDesc, setNewSkillDesc] = useState("");
  // 「MCP」页：注册表 + 一键写入客户端
  const [mcpServers, setMcpServers] = useState<McpServer[]>([]);
  const [mcpTargets, setMcpTargets] = useState<Record<string, string>>({});
  const [mcpFile, setMcpFile] = useState("");
  const [mcpId, setMcpId] = useState("");
  const [mcpName, setMcpName] = useState("");
  const [mcpCommand, setMcpCommand] = useState("");
  const [mcpArgs, setMcpArgs] = useState("");
  const [mcpEnv, setMcpEnv] = useState("");
  const [mcpBusy, setMcpBusy] = useState(false);

  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  const refresh = useCallback(() => {
    void hs.state().then((s) => setInstalled(s.installed || {}));
    void hs.memory().then(setMemory);
  }, []);

  useEffect(refresh, [refresh]);

  const loadMemory = useCallback(async () => {
    const f = await hs.readMemory();
    setMemName(f.name);
    setMemText(f.text);
    setMemSaved(f.text);
  }, []);

  // 只在进入记忆页时读盘：安装后的自动刷新不能把正在编辑的内容冲掉
  useEffect(() => {
    if (section === "memory") void loadMemory();
  }, [section, loadMemory]);

  const memDirty = memText !== memSaved;

  // 「技能」页：进页面时读列表，点左侧读一份正文
  const loadSkillList = useCallback(async () => {
    const list = await hs.skillsList();
    setSkillItems(list.items);
    setSkillTargets(list.targets);
    const first = list.items[0];
    if (!first) return;
    const f = await hs.skillsRead(first.id);
    if (f.ok) {
      setSkillId(first.id);
      setSkillText(f.text || "");
      setSkillSaved(f.text || "");
    }
  }, []);

  const openSkill = useCallback(async (id: string) => {
    const f = await hs.skillsRead(id);
    if (!f.ok) {
      setToast("读取失败：" + (f.error || "文件不存在"));
      return;
    }
    setSkillId(id);
    setSkillText(f.text || "");
    setSkillSaved(f.text || "");
  }, []);

  useEffect(() => {
    if (section === "skills") void loadSkillList();
  }, [section, loadSkillList]);

  const skillDirty = skillText !== skillSaved;

  const saveSkill = async () => {
    setSkillBusy(true);
    try {
      const r = await hs.skillsWrite(skillId, skillText);
      if (r.ok) {
        setSkillSaved(skillText);
        setToast(`已保存 ${skillId}（${r.chars} 字）`);
        const list = await hs.skillsList();
        setSkillItems(list.items);
        setSkillTargets(list.targets);
      } else {
        setToast("保存失败：" + (r.error || "无法写入文件"));
      }
    } finally {
      setSkillBusy(false);
    }
  };

  /** 新建技能：只收名称与一句描述，正文用模板打开，随后可直接编辑。 */
  const createSkill = async () => {
    const name = newSkillName.trim();
    if (!name) {
      setToast("先填技能名称");
      return;
    }
    const r = await hs.skillsCreate(name, newSkillDesc.trim());
    if (!r.ok || !r.id) {
      setToast("新建失败：" + (r.error || "未知错误"));
      return;
    }
    setNewSkillName("");
    setNewSkillDesc("");
    await loadSkillList();
    await openSkill(r.id);
    setToast(`已新建技能 ${r.id}`);
  };

  const removeSkill = async () => {
    if (!skillId) return;
    if (!window.confirm(`删除技能 ${skillId}？目录会被整个移除。`)) return;
    const r = await hs.skillsDelete(skillId);
    if (!r.ok) {
      setToast("删除失败：" + (r.error || "未知错误"));
      return;
    }
    setSkillId("");
    setSkillText("");
    setSkillSaved("");
    await loadSkillList();
    setToast(`已删除 ${r.id}`);
  };

  // 「MCP」页
  const loadMcp = useCallback(async () => {
    const j = await hs.mcpList();
    setMcpServers(j.servers);
    setMcpTargets(j.targets);
    setMcpFile(j.file);
  }, []);

  useEffect(() => {
    if (section === "mcp") void loadMcp();
  }, [section, loadMcp]);

  const editMcp = (s: McpServer) => {
    setMcpId(s.id);
    setMcpName(s.name);
    setMcpCommand(s.command);
    setMcpArgs((s.args || []).join(" "));
    setMcpEnv(
      Object.entries(s.env || {})
        .map(([k, v]) => `${k}=${v}`)
        .join("\n"),
    );
  };

  const resetMcpForm = () => {
    setMcpId("");
    setMcpName("");
    setMcpCommand("");
    setMcpArgs("");
    setMcpEnv("");
  };

  /** 环境变量按「一行一个 KEY=VALUE」输入，空行忽略。 */
  const parseEnv = (text: string) => {
    const env: Record<string, string> = {};
    for (const line of text.split(/\r?\n/)) {
      const i = line.indexOf("=");
      if (i <= 0) continue;
      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim();
      if (k) env[k] = v;
    }
    return env;
  };

  const saveMcp = async () => {
    setMcpBusy(true);
    try {
      const r = await hs.mcpSave({
        id: mcpId || undefined,
        name: mcpName,
        command: mcpCommand,
        args: mcpArgs.split(/\s+/).filter(Boolean),
        env: parseEnv(mcpEnv),
        enabled: true,
      });
      if (!r.ok) {
        setToast("保存失败：" + (r.error || "未知错误"));
        return;
      }
      resetMcpForm();
      await loadMcp();
      setToast(`已保存 MCP：${r.server?.name}`);
    } finally {
      setMcpBusy(false);
    }
  };

  const removeMcp = async (id: string) => {
    if (!window.confirm("从注册表移除这条 MCP？已写入客户端配置的不会自动删除。")) return;
    const r = await hs.mcpRemove(id);
    if (!r.ok) {
      setToast("删除失败：" + (r.error || "未知错误"));
      return;
    }
    await loadMcp();
    setToast("已移除");
  };

  const applyMcp = async (targetId: string) => {
    const r = await hs.mcpApply(targetId);
    if (!r.ok) {
      setToast("写入失败：" + (r.error || "未知错误"));
      return;
    }
    setToast(`已写入 ${targetId}（${r.count} 个）`);
  };

  const saveMemory = async () => {
    setMemBusy(true);
    try {
      const r = await hs.writeMemory(memName, memText);
      if (r.ok) {
        setMemSaved(memText);
        setMemName(r.name || memName);
        setToast(`已保存 ${r.name}（${r.chars} 字）`);
        refresh();
      } else {
        setToast("保存失败：" + (r.error || "无法写入文件"));
      }
    } finally {
      setMemBusy(false);
    }
  };

  useEffect(() => {
    const offLog = hs.onLog((p) => setLogText((prev) => (prev + p.text).slice(-20000)));
    const offStatus = hs.onStatus((p) => {
      setBusy(p.state === "running");
      setStatus(p.label);
      setLevel(p.state === "running" ? "busy" : "idle");
    });
    const offNotify = hs.onNotify((p) => setToast(p.text));
    return () => {
      offLog();
      offStatus();
      offNotify();
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(t);
  }, [toast]);

  const run = useCallback(
    async (label: string, fn: () => Promise<{ ok: boolean; code?: number; error?: string; out?: string }>) => {
      setLogText("");
      setLogOpen(true);
      setStatus(label);
      setLevel("busy");
      setBusy(true);
      try {
        const res = await fn();
        setLevel(res.ok ? "ok" : "err");
        setStatus(res.ok ? `${label.replace("正在", "")}完成` : `${label.replace("正在", "")}失败（退出码 ${res.code ?? "?"}）`);
        if (!res.ok) {
          const reason = res.error || res.out || "";
          setToast(reason.includes("记忆文件为空") ? "记忆文件为空：请先把提示词粘进 memory 目录下的 .md 文件" : reason.slice(0, 200) || "操作失败");
        }
      } finally {
        setBusy(false);
        refresh();
      }
    },
    [refresh],
  );

  const install = (id: string) =>
    run(injectMode === "targeted" ? "正在针对注入" : "正在安装", async () => {
      const r = await hs.install(id, injectMode);
      // 退出码 0 但回读没找到注入内容：明确提示，避免「显示已安装、实际没装」
      if (r.ok && r.verified === false) {
        setToast("安装完成，但未在目标文件里找到注入内容，请查看运行日志");
      }
      return r;
    });

  const uninstall = (id: string) => run("正在卸载", () => hs.uninstall(id));
  const restore = (id: string) => run("正在装回原始记忆", () => hs.restoreMemory(id));
  const restartCodex = () => run("正在重启 Codex", async () => {
    const r = await hs.restartCodex();
    return { ok: r.ok, error: r.error ?? undefined };
  });

  const openLink = async (url: string) => {
    const r = await hs.openQQ(url);
    if (!r || !r.ok) setToast("链接打开失败，请手动访问 tuomi.club");
  };

  /**
   * 加群：先把群号复制到剪贴板（这台机器上一定能用），再尝试唤起 QQ 的加群卡片。
   * 没装 QQ 时 mqqapi:// 会静默失败，所以复制这一步必须在前，提示里也要给群号。
   */
  const joinGroup = async () => {
    const c = await hs.copy(QQ_GROUP);
    const r = await hs.openQQ(QQ_LINK);
    if (c && c.ok) {
      setToast(
        r && r.ok
          ? `群号 ${QQ_GROUP} 已复制，已尝试唤起 QQ`
          : `群号 ${QQ_GROUP} 已复制，在 QQ 里粘贴或搜索即可加入`,
      );
    } else {
      setToast(`请在 QQ 中搜索群号 ${QQ_GROUP}`);
    }
  };
  const current = useMemo(() => TARGETS.find((t) => t.id === openTarget), [openTarget]);

  return (
    <Theme theme={neutralTheme} mode="dark">
      <div className="zx">
        <header className="zx-top">
          <div className="zx-brand">
            <img className="zx-brand__mark" src={logo} alt="" draggable={false} />
            <span className="zx-brand__name">{APP_NAME}</span>
            <span className="zx-brand__ver">v{APP_VERSION}</span>
          </div>

          <TabList value={section} onChange={(v) => setSection(v as Section)} size="sm">
            <Tab value="targets" label="破甲目标" />
            <Tab value="memory" label="记忆" />
            <Tab value="skills" label="技能" />
            <Tab value="mcp" label="MCP" />
            <Tab value="about" label="关于" />
          </TabList>

          <div className="zx-top__right">
            <span className="zx-status">
              <StatusDot variant={STATUS_DOT[level]} label={status} />
              {status}
            </span>
            <button type="button" className="zx-win" onClick={() => void hs.win("minimize")} title="最小化">—</button>
            <button type="button" className="zx-win" onClick={() => void hs.win("close")} title="关闭">×</button>
          </div>
        </header>

        <main className="zx-main">
          {section === "targets" && (
            <section className="zx-targets">
              <div className="zx-toolbar">
                <span className="zx-hint">注入模式</span>
                <div className="zx-seg" role="group" aria-label="注入模式">
                  <button
                    type="button"
                    className={injectMode === "full" ? "is-active" : ""}
                    onClick={() => setInjectMode("full")}
                  >
                    全量提示词
                  </button>
                  <button
                    type="button"
                    className={injectMode === "targeted" ? "is-active" : ""}
                    onClick={() => setInjectMode("targeted")}
                  >
                    针对短提示词
                  </button>
                </div>
                <span className="zx-hint">
                  {injectMode === "full"
                    ? "注入 memory 下的完整正文（当前默认）"
                    : "按目标取 memory/针对 下的短提示词，适合 WorkBuddy 等有长度上限的客户端"}
                </span>
              </div>
              <div className="zx-grid">
                {TARGETS.map((t) => {
                  const isOn = Boolean(installed[t.id]);
                  return (
                    <article key={t.id} className={`zx-card${isOn ? " is-on" : ""}`}>
                      <div className="zx-card__head">
                        <h3>{t.title}</h3>
                        <Badge variant={isOn ? "success" : "neutral"} label={isOn ? "已安装" : "未安装"} />
                      </div>
                      <p className="zx-card__desc">{t.desc}</p>
                      <div className="zx-card__foot">
                        <Button
                          label={isOn ? "管理" : "安装"}
                          variant={isOn ? "secondary" : "primary"}
                          isDisabled={busy}
                          onClick={() => setOpenTarget(t.id)}
                        />
                        <button type="button" className="zx-link" onClick={() => setOpenTarget(t.id)}>
                          详情
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {section === "memory" && (
            <section className="zx-memory">
              <article className="zx-panel zx-memory__panel">
                <div className="zx-card__head">
                  <h3>指令正文</h3>
                  <Badge variant={memDirty ? "info" : "neutral"} label={memDirty ? "未保存" : "已同步"} />
                </div>
                <p className="zx-card__desc">
                  {memName} · {memText.trim().length} 字 · 保存后回「破甲目标」重新安装，或重启目标软件即生效。
                </p>
                <textarea
                  className="zx-mem__text"
                  value={memText}
                  spellCheck={false}
                  placeholder="把提示词正文粘到这里，再点保存。"
                  onChange={(e) => setMemText(e.target.value)}
                />
                <div className="zx-row">
                  <Button
                    label="保存"
                    variant="primary"
                    isDisabled={memBusy || !memDirty}
                    onClick={() => void saveMemory()}
                  />
                  <Button
                    label="放弃改动"
                    variant="secondary"
                    isDisabled={memBusy || !memDirty}
                    onClick={() => setMemText(memSaved)}
                  />
                  <Button label="重新载入" variant="ghost" isDisabled={memBusy} onClick={() => void loadMemory()} />
                </div>
              </article>
            </section>
          )}

          {section === "skills" && (
            <section className="zx-resource">
              <aside className="zx-resource__list">
                <div className="zx-card__head">
                  <h3>技能库</h3>
                  <span className="zx-hint">{skillItems.length} 个</span>
                </div>
                <div className="zx-skill-list">
                  {skillItems.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`zx-skill-item${s.id === skillId ? " is-active" : ""}`}
                      onClick={() => void openSkill(s.id)}
                    >
                      <span className="zx-skill-item__name">{s.name || s.id}</span>
                      <span className="zx-skill-item__id">
                        {s.id} · {s.chars} 字
                      </span>
                    </button>
                  ))}
                  {!skillItems.length && <p className="zx-hint">还没有技能，用下面的表单新建。</p>}
                </div>
                <div className="zx-skill-new">
                  <input
                    className="zx-input"
                    placeholder="技能名称（如 web-pentest）"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                  />
                  <input
                    className="zx-input"
                    placeholder="一句描述（什么时候触发）"
                    value={newSkillDesc}
                    onChange={(e) => setNewSkillDesc(e.target.value)}
                  />
                  <Button label="新建技能" variant="secondary" onClick={() => void createSkill()} />
                </div>
              </aside>

              <article className="zx-panel zx-resource__edit">
                <div className="zx-card__head">
                  <h3>{skillId || "选择技能"}</h3>
                  <Badge variant={skillDirty ? "info" : "neutral"} label={skillDirty ? "未保存" : "已同步"} />
                </div>
                <p className="zx-card__desc">
                  {skillId
                    ? `${skillId}/SKILL.md · ${skillText.trim().length} 字 · 保存后重新安装目标，才会同步到客户端`
                    : "从左侧选择一份技能，或在左下新建"}
                </p>
                <textarea
                  className="zx-mem__text zx-skill-text"
                  value={skillText}
                  spellCheck={false}
                  placeholder="选择左侧技能后在这里编辑 SKILL.md"
                  onChange={(e) => setSkillText(e.target.value)}
                />
                <div className="zx-row">
                  <Button
                    label="保存"
                    variant="primary"
                    isDisabled={skillBusy || !skillDirty || !skillId}
                    onClick={() => void saveSkill()}
                  />
                  <Button
                    label="放弃改动"
                    variant="secondary"
                    isDisabled={skillBusy || !skillDirty}
                    onClick={() => setSkillText(skillSaved)}
                  />
                  <Button label="重新载入" variant="ghost" isDisabled={skillBusy || !skillId} onClick={() => void openSkill(skillId)} />
                  <Button label="删除技能" variant="ghost" isDisabled={skillBusy || !skillId} onClick={() => void removeSkill()} />
                </div>
                <div className="zx-skill-targets">
                  {Object.entries(skillTargets).map(([id, t]) => (
                    <span key={id} className="zx-skill-target" title={t.dir}>
                      {id} · {t.count}
                    </span>
                  ))}
                </div>
              </article>
            </section>
          )}

          {section === "mcp" && (
            <section className="zx-resource">
              <aside className="zx-resource__list">
                <div className="zx-card__head">
                  <h3>MCP 服务器</h3>
                  <span className="zx-hint">{mcpServers.length} 个</span>
                </div>
                <div className="zx-skill-list">
                  {mcpServers.map((s) => (
                    <div key={s.id} className={`zx-skill-item${s.id === mcpId ? " is-active" : ""}`}>
                      <button type="button" className="zx-skill-item__pick" onClick={() => editMcp(s)}>
                        <span className="zx-skill-item__name">{s.name}</span>
                        <span className="zx-skill-item__id">
                          {s.command} {(s.args || []).join(" ")}
                        </span>
                      </button>
                      <button type="button" className="zx-link" onClick={() => void removeMcp(s.id)}>
                        移除
                      </button>
                    </div>
                  ))}
                  {!mcpServers.length && <p className="zx-hint">还没有 MCP，右侧新建一条。</p>}
                </div>
                <p className="zx-hint">注册表：{mcpFile || "—"}</p>
              </aside>

              <article className="zx-panel zx-resource__edit">
                <div className="zx-card__head">
                  <h3>{mcpId ? "编辑 MCP" : "新增 MCP"}</h3>
                  <Badge variant="neutral" label={mcpId ? "编辑中" : "新建"} />
                </div>
                <div className="zx-form">
                  <label>
                    名称
                    <input className="zx-input" value={mcpName} onChange={(e) => setMcpName(e.target.value)} placeholder="如 filesystem" />
                  </label>
                  <label>
                    命令
                    <input className="zx-input" value={mcpCommand} onChange={(e) => setMcpCommand(e.target.value)} placeholder="如 npx" />
                  </label>
                  <label>
                    参数
                    <input
                      className="zx-input"
                      value={mcpArgs}
                      onChange={(e) => setMcpArgs(e.target.value)}
                      placeholder="-y @modelcontextprotocol/server-filesystem D:\\data"
                    />
                  </label>
                  <label>
                    环境变量（一行一个 KEY=VALUE）
                    <textarea
                      className="zx-input zx-input--area"
                      value={mcpEnv}
                      onChange={(e) => setMcpEnv(e.target.value)}
                      placeholder="API_KEY=xxx"
                    />
                  </label>
                </div>
                <div className="zx-row">
                  <Button
                    label="保存"
                    variant="primary"
                    isDisabled={mcpBusy || !mcpName.trim() || !mcpCommand.trim()}
                    onClick={() => void saveMcp()}
                  />
                  <Button label="清空" variant="ghost" isDisabled={mcpBusy} onClick={resetMcpForm} />
                </div>
                <p className="zx-card__desc">写入客户端时会覆盖 mcpServers，原文件自动备份为 .zerox.bak：</p>
                <div className="zx-row">
                  {Object.keys(mcpTargets).map((t) => (
                    <Button
                      key={t}
                      label={t}
                      variant="secondary"
                      isDisabled={mcpBusy || !mcpServers.length}
                      onClick={() => void applyMcp(t)}
                    />
                  ))}
                </div>
              </article>
            </section>
          )}

          {section === "about" && (
            <section className="zx-about">
              <article className="zx-panel">
                <h3>{APP_NAME} v{APP_VERSION}</h3>
                <p className="zx-card__desc">
                  本地工具 · 无需登录 · 全部注入都在本机完成。指令正文在「记忆」页直接改，保存即写回 memory 目录。
                </p>
                <div className="zx-row">
                  <Button label="加入 QQ 群" variant="secondary" onClick={() => void joinGroup()} />
                  <Button label="满血中转站" variant="secondary" onClick={() => void openLink(RELAY_LINK)} />
                  <Button label="使用教程" variant="secondary" onClick={() => setTutorialOpen(true)} />
                  <Button label="退出工具" variant="ghost" onClick={() => void hs.quit()} />
                </div>
                <p className="zx-hint">QQ 群号 764635322 · 中转站 tuomi.club</p>
              </article>
              <article className="zx-panel">
                <h3>{DISCLAIMER_TITLE}</h3>
                <p className="zx-card__desc">{DISCLAIMER_TEXT}</p>
              </article>
            </section>
          )}
        </main>

        <footer className={`zx-log${logOpen ? " is-open" : ""}`}>
          <button type="button" className="zx-log__bar" onClick={() => setLogOpen((v) => !v)}>
            <span>运行日志</span>
            <span className="zx-log__hint">{logOpen ? "收起" : logText ? `${logText.length} 字符` : "展开"}</span>
          </button>
          {logOpen && <pre className="zx-log__body">{logText || "暂无输出。执行安装或卸载后会显示。"}</pre>}
        </footer>

        <Drawer
          isOpen={Boolean(current)}
          onOpenChange={(open) => !open && setOpenTarget(null)}
          side="end"
          label={current ? `${current.title} 详情` : "目标详情"}
        >
          {current && (
            <div className="zx-drawer">
              <div className="zx-card__head">
                <h3>{current.title}</h3>
                <Badge variant={installed[current.id] ? "success" : "neutral"} label={installed[current.id] ? "已安装" : "未安装"} />
              </div>
              <p className="zx-card__desc">{current.desc}</p>

              <div className="zx-row">
                <Button label="安装" variant="primary" isDisabled={busy} onClick={() => void install(current.id)} />
                <Button label="卸载" variant="secondary" isDisabled={busy} onClick={() => void uninstall(current.id)} />
                {current.id === "workbuddy" && (
                  <Button label="装回原始记忆" variant="ghost" isDisabled={busy} onClick={() => void restore(current.id)} />
                )}
                {current.id === "codex" && (
                  <Button label="重启 Codex" variant="ghost" isDisabled={busy} onClick={() => void restartCodex()} />
                )}
              </div>

              <p className="zx-hint">
                提示词来源：{memory ? `${memory.name}（${memory.chars} 字）` : "未找到 · 请先填写 memory 下的 .md"}
              </p>

              <pre className="zx-log__body zx-log__body--inline">{logText || "操作输出会显示在这里。"}</pre>
            </div>
          )}
        </Drawer>

        <Drawer
          isOpen={tutorialOpen}
          onOpenChange={(open) => !open && setTutorialOpen(false)}
          side="end"
          label={TUTORIAL_TITLE}
        >
          <div className="zx-drawer">
            <div className="zx-card__head">
              <h3>{TUTORIAL_TITLE}</h3>
            </div>
            <pre className="zx-tutorial">{TUTORIAL_TEXT}</pre>
          </div>
        </Drawer>

        {toast && (
          <div className="zx-toast" role="status" onClick={() => setToast(null)}>
            {toast}
          </div>
        )}
      </div>
    </Theme>
  );
}
