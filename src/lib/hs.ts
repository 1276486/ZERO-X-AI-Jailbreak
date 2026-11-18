/** preload 暴露的 IPC 接口的类型包装。 */

export type InstalledMap = Record<string, string | boolean>;

export type InstallResult = {
  ok: boolean;
  code: number;
  out: string;
  timedOut: boolean;
  installed: InstalledMap;
  error?: string;
};

/** 重启 Codex：out 是 PowerShell 的原样输出，失败时 error 里带可读原因。 */
export type RestartResult = { ok: boolean; code?: number; out?: string; error?: string };

/** memory/ 下正在使用的提示词文件；null = 用户还没填内容。 */
export type MemoryPrompt = { path: string; name: string; chars: number } | null;

/** 「记忆」页编辑的指令文件正文。exists=false 表示还没落盘。 */
export type MemoryFile = { name: string; path: string; text: string; exists: boolean };

/** 保存指令正文的结果。 */
export type MemorySaveResult = { ok: boolean; name?: string; chars?: number; error?: string };

export type AppState = {
  installed: InstalledMap;
  version: string;
};

export type LogPayload = { label: string; text: string };
export type StatusPayload = { label: string; state: "running" | "idle" };
export type NotifyPayload = { level: "info" | "warn"; text: string };

export type HsApi = {
  state(): Promise<AppState>;
  memory(): Promise<MemoryPrompt>;
  readMemory(): Promise<MemoryFile>;
  writeMemory(name: string, text: string): Promise<MemorySaveResult>;
  install(targetId: string): Promise<InstallResult>;
  uninstall(targetId: string): Promise<InstallResult>;
  /** 装回原始记忆（仅 WorkBuddy）：还原安装前的记忆档案，保留技能库。 */
  restoreMemory(targetId: string): Promise<InstallResult>;
  restartCodex(): Promise<RestartResult>;
  openQQ(url: string): Promise<{ ok: boolean }>;
  copy(text: string): Promise<{ ok: boolean }>;
  quit(): Promise<{ ok: boolean }>;
  win(action: "minimize" | "maximize" | "close"): Promise<{ ok: boolean }>;
  onLog(cb: (p: LogPayload) => void): () => void;
  onStatus(cb: (p: StatusPayload) => void): () => void;
  onNotify(cb: (p: NotifyPayload) => void): () => void;
};

declare global {
  interface Window {
    hs: HsApi;
  }
}

export const hs: HsApi = window.hs;
