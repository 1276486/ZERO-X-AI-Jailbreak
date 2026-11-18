/** preload 暴露的 IPC 接口的类型包装。 */

export type InstalledMap = Record<string, string | boolean>;

export type InstallResult = {
  ok: boolean;
  code: number;
  out: string;
  timedOut: boolean;
  installed: InstalledMap;
  error?: string;
  /** 回读校验结果：true=在目标文件里找到了注入内容；false=没找到；null=该目标无法校验 */
  verified?: boolean | null;
  verify?: { checked: boolean; found: boolean | null; files?: string[]; note?: string };
  /** 本次注入实际使用的指令文件（全量或针对）。 */
  promptName?: string;
  mode?: "full" | "targeted";
};

export type InjectMode = "full" | "targeted";

/** 重启 Codex：out 是 PowerShell 的原样输出，失败时 error 里带可读原因。 */
export type RestartResult = { ok: boolean; code?: number; out?: string; error?: string };

/** memory/ 下正在使用的提示词文件；null = 用户还没填内容。 */
export type MemoryPrompt = { path: string; name: string; chars: number } | null;

/** 「记忆」页编辑的指令文件正文。exists=false 表示还没落盘。 */
export type MemoryFile = { name: string; path: string; text: string; exists: boolean };

/** 保存指令正文的结果。 */
export type MemorySaveResult = { ok: boolean; name?: string; chars?: number; error?: string };

/** 技能库里的一个 SKILL.md。desc 取头部 description 的前 240 字。 */
export type SkillItem = { id: string; name: string; desc: string; chars: number };

/** 某客户端 skills 目录的同步情况。 */
export type SkillTargetState = { dir: string; count: number };

export type SkillList = {
  root: string;
  items: SkillItem[];
  targets: Record<string, SkillTargetState>;
};

export type SkillFile = { ok: boolean; id?: string; path?: string; text?: string; error?: string };
export type SkillSaveResult = { ok: boolean; id?: string; chars?: number; error?: string };
export type SkillCreateResult = { ok: boolean; id?: string; path?: string; error?: string };

/** MCP 注册表里的一项。args/env 原样写进客户端配置。 */
export type McpServer = {
  id: string;
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  enabled: boolean;
};

export type McpList = {
  file: string;
  servers: McpServer[];
  targets: Record<string, string>;
};

export type McpApplyResult = {
  ok: boolean;
  target?: string;
  path?: string;
  count?: number;
  error?: string;
};

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
  skillsList(): Promise<SkillList>;
  skillsRead(id: string): Promise<SkillFile>;
  skillsWrite(id: string, text: string): Promise<SkillSaveResult>;
  skillsCreate(name: string, description: string): Promise<SkillCreateResult>;
  skillsDelete(id: string): Promise<{ ok: boolean; id?: string; error?: string }>;
  mcpList(): Promise<McpList>;
  mcpSave(server: Partial<McpServer>): Promise<{ ok: boolean; server?: McpServer; error?: string }>;
  mcpRemove(id: string): Promise<{ ok: boolean; id?: string; error?: string }>;
  mcpApply(targetId: string): Promise<McpApplyResult>;
  install(targetId: string, mode?: InjectMode): Promise<InstallResult>;
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
