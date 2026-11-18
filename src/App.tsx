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
} from "./lib/hs";
import "./ui.css";
import logo from "./assets/logo.png";

type Section = "targets" | "memory" | "about";
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

  const install = (id: string) => run("正在安装", () => hs.install(id));
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
            <section className="zx-grid">
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
