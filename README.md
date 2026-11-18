# ZERO-X破甲

> 把你自己写的指令正文，一键写入本机常用的 AI 编程客户端。
> Windows 桌面工具 · Electron + React · 全部在本机完成，无需登录、无需账号。

---

## 目录

- [界面预览](#界面预览)
- [交流群](#交流群)
- [关键词](#关键词)
- [1. 这是什么](#1-这是什么)
- [2. 功能特性](#2-功能特性)
- [3. 支持的目标与写入位置](#3-支持的目标与写入位置)
- [4. 安装与使用](#4-安装与使用)
- [5. 指令文件（memory）](#5-指令文件memory)
- [6. 工作原理](#6-工作原理)
- [7. 目录结构](#7-目录结构)
- [8. 开发环境](#8-开发环境)
- [9. 构建与打包](#9-构建与打包)
- [10. 命令行直接调用安装脚本](#10-命令行直接调用安装脚本)
- [11. 验收与清理脚本](#11-验收与清理脚本)
- [12. 故障排查](#12-故障排查)
- [13. 安全边界与已知限制](#13-安全边界与已知限制)
- [14. 版本、联系与说明](#14-版本联系与说明)

---

## 1. 这是什么

ZERO-X破甲是一个**指令注入管理器**。它本身不生成、也不内置任何提示词，只做三件事：

1. 读取你放在 `memory/` 目录里的指令正文；
2. 判断每个目标软件的配置目录在哪；
3. 调用对应的 PowerShell 脚本，把正文写进那个软件自己会读取的位置，并记录写入状态。

撤销时按注入标记反向摘除，只回收本工具写入的部分，**你自己的记忆、规则、配置一律不动**。

适用场景：**Codex 破甲、Claude 破甲、Cursor 破甲、OpenCode 破甲、WorkBuddy 破甲、DeepSeek 破甲、豆包破甲**，以及 AI 安全与大模型破甲、提示词注入与指令管理、逆向工程与二进制分析、渗透测试与红队演练、卡密 / 授权校验分析、恶意样本分析。

| 项目 | 说明 |
|---|---|
| 平台 | Windows 10 / 11 x64 |
| 运行时 | Electron 33 + Node.js（内含），最终用户无需安装 Node |
| 界面 | React 19 + Vite 5，Meta Astryx 组件库，深色主题 |
| 窗口 | 无边框 + Windows 11 DWM 圆角，顶栏自绘拖拽区 |
| 常驻 | 托盘图标；关闭窗口 = 收进托盘，真正退出走托盘菜单 |
| 网络 | 安装/卸载全程本地执行，不联网；仅「豆包」目标会连本机调试端口 |
| 状态文件 | `<CodexHome>/fj_desktop_state.json`（记录哪些目标装过） |

---

## 界面预览

<p align="center">
  <img src="docs/screenshots/targets.png" alt="破甲目标" width="900">
</p>

| 记忆页：直接在程序里编辑指令正文 | 使用教程（内置） |
|---|---|
| <img src="docs/screenshots/memory.png" alt="记忆页" width="440"> | <img src="docs/screenshots/tutorial.png" alt="使用教程" width="440"> |

| 目标详情抽屉：安装 / 卸载 / 重启 | 关于与免责声明 |
|---|---|
| <img src="docs/screenshots/drawer.png" alt="目标详情" width="440"> | <img src="docs/screenshots/about.png" alt="关于" width="440"> |

---

## 交流群

<p align="center">
  <img src="docs/qq-group.jpg" alt="Zero-X 交流群" width="300">
</p>

<p align="center">群号 <b>764635322</b> · 扫码或搜索群号加入 · 永久免费</p>

满血中转站：[https://tuomi.club](https://tuomi.club)

---

## 关键词

**Codex 破甲** · **Claude 破甲** · **Cursor 破甲** · **OpenCode 破甲** · **WorkBuddy 破甲** · **DeepSeek 破甲** · **豆包 破甲** · **AI 破甲** · **破甲** · **大模型破甲** · **AI 安全** · **LLM 安全** · **提示词注入** · **系统提示词** · **指令注入** · **越狱** · **Prompt** · **提示词管理** · **记忆管理** · **安全研究** · **授权测试** · **红队** · **红蓝对抗** · **CTF** · **渗透测试** · **Web 安全** · **内网渗透** · **提权** · **横向移动** · **漏洞利用** · **SQL 注入** · **XSS** · **SSRF** · **CVE** · **CVE 复现** · **CVE 监控** · **PoC** · **PoC 编写** · **0day** · **1day** · **RCE** · **XXE** · **反序列化** · **未授权访问** · **越权** · **文件上传** · **弱口令** · **漏洞挖掘** · **漏洞复现** · **漏洞分析** · **WAF 绕过** · **信息收集** · **指纹识别** · **资产测绘** · **威胁情报** · **IOC** · **应急响应** · **代码审计** · **逆向工程** · **软件逆向** · **二进制分析** · **脱壳** · **加壳** · **反编译** · **破解** · **注册机** · **卡密** · **授权校验** · **去授权** · **授权绕过** · **试用重置** · **样本分析** · **恶意样本** · **APK 逆向** · **移动安全** · **免杀** · **远控** · **社工** · **钓鱼演练** · **游戏安全** · **反作弊** · **AI 编程助手** · **Codex** · **Claude** · **Cursor** · **OpenCode** · **WorkBuddy** · **DeepSeek Harness** · **豆包** · **Electron** · **React** · **TypeScript** · **Windows** · **桌面工具** · **一键注入** · **指令管理**

> 以上为项目与随包指令集覆盖的关键词；本工具本身只负责把指令写进目标软件，具体行为由你填写的指令正文决定。

---

## 2. 功能特性

- **九个目标，独立安装 / 独立撤销**，互不影响。
- **不写半成品**：指令正文为空时安装直接失败并提示，不会把空内容写进用户配置。
- **可反复执行**：重复安装不会叠加副作用；脚本内部按标记定位注入块。
- **两种撤销方式**：
  - *卸载*：还原注入内容，并额外做一次**提示词残留清扫**（不依赖卸载脚本是否成功）；
  - *装回原始记忆*：只把指令正文还原成安装前版本，保留技能库与安装状态。
- **程序内编辑**：「记忆」页直接改正文并保存，不用去翻文件夹。
- **实时输出**：PowerShell 的 stdout/stderr 逐行推到界面「运行日志」，中文不乱码。
- **安装前自动探测路径**：Codex 会检查 `CODEX_HOME`、`~/.codex` 以及各盘根目录；WorkBuddy 区分国际版 / 国内版两套数据目录；Cursor 兼容标准安装、便携版和自定义 `--user-data-dir`。
- **耗时保护**：安装 10 分钟、卸载 2 分钟超时，超时强制结束子进程并明确报错。
- **单实例**：重复启动只会把已有窗口叫到前台。

---

## 3. 支持的目标与写入位置

| 目标 | 安装脚本 | 写入位置 | 备注 |
|---|---|---|---|
| Codex | `install.ps1` | `<CodexHome>/config.toml`、`<CodexHome>/AGENTS.md` | CodexHome 依次探测 `CODEX_HOME` → `~/.codex` → C:–Z: 盘根目录下的 `.codex`；改动的文件先整份备份 |
| ZCode | `install-zcode.ps1` | `~/.zcode/AGENTS.md`、`<zcode>/resources/glm/memories/global/memory/`、`zcode.cjs` 系统提示、`setting.json` 的 `memoryEnabled` | 系统提示补丁带备份，卸载可回滚 |
| Cursor | `install-cursor.ps1` | `~/.cursor/rules/ZERO-X注入.mdc`，并兼容 `%APPDATA%\Cursor\User\rules`、`%LOCALAPPDATA%\Cursor\rules`、旧版 `.cursorrules` | 只写没有用户自有规则的位置 |
| Claude | `install-claude.ps1` | `~/.claude/CLAUDE.md`（带 `ZERO-X-INJECT:BEGIN/END` 标记块） | 备份优先取干净的原始文件 |
| OpenCode | `install-opencode.ps1` | `~/.config/opencode/AGENTS.md`（可用 `XDG_CONFIG_HOME` 改） | 注入块标记同上 |
| WorkBuddy（国际版） | `install-workbuddy.ps1` | `~/.workbuddy-ai/memory/<uid>_memory.md`、`MEMORY.md`、`app/app-config.json`、`skills/` | 云记忆档案写入 `Version: 999999` 触发守卫，防云端回写覆盖 |
| WorkBuddy（国内版） | `install-workbuddy.ps1 -ConfigDir ~/.workbuddy` | 同上，数据目录换成 `~/.workbuddy` | 数据目录必须显式指定，否则会探测到国际版 |
| DeepSeek Harness | `install-dsh.ps1` | `~/.dsh/AGENTS.md` | 支持 `-KitRoot` 懒人包模式 |
| 豆包 | `install-doubao.ps1` | **云端全局记忆**（无本地文件） | 通过 CDP 驱动客户端登录态调用云端接口；需要 `--remote-debugging-port=9222` |

> 目标清单、界面文案集中在 `src/data/targets.ts`；脚本与目标 id 的映射在 `electron/main.cjs` 的 `SCRIPTS` 常量里。

---

## 4. 安装与使用

### 4.1 选择版本

| 产物 | 说明 |
|---|---|
| `ZERO-X破甲-安装版-x.y.z.exe` | NSIS 安装器，创建开始菜单与桌面快捷方式，自带卸载器 |
| `ZERO-X破甲-便携版-x.y.z.zip` | 解压即用，不写注册表；附 `卸载-便携版.bat` |

首次运行若被 Windows SmartScreen 拦下，选择「更多信息 → 仍要运行」（安装包未做代码签名）。

### 4.2 三步开始

**第一步：备指令**
进入「记忆」页，正文直接在里面改，点「保存」写回文件。默认文件是 `memory/指令集.md`。

**第二步：装目标**
回到「破甲目标」，点目标卡片的「安装」。安装会把指令写进该目标自己的配置位置。
**装完把目标软件彻底退出再启动一次**，新指令才会被加载。

**第三步：喊一声**
打开目标软件的对话框，先单独发一行大写：

```
ZERO-X
```

回一句握手行即代表接管成功。之后正常提需求即可。
发 `自检` 应回 `All systems normal. Continue.`；想接着上一轮的工作，发 `继续`、`接着做` 或 `retry`。

> 上述激活词来自随包附带的指令正文。如果你在「记忆」页把它整份换成了别的内容，激活方式以你写的那份为准。

### 4.3 撤销

| 操作 | 作用范围 |
|---|---|
| 卸载 | 还原注入内容 + 无条件清扫该目标的提示词残留；不动你自己的配置 |
| 装回原始记忆 | 只把指令正文还原成安装前版本，保留技能库和「已安装」状态 |
| 重启 Codex | 仅 Codex 目标：结束 ChatGPT/codex 进程并按 AppID 重新拉起 |

### 4.4 窗口与托盘

- 顶栏整条可拖动窗口；最小化 / 关闭按钮在右上角。
- 点关闭 = 收进托盘，进程继续驻留；从托盘菜单「退出程序」才真正结束。
- 再次双击快捷方式不会开第二个实例，只会把现有窗口叫到前台。

---

## 5. 指令文件（memory）

规则只有一条：**`memory/` 目录下，除 `README.md` 外，第一个非空的 `.md` 文件就是安装用的指令源**（按文件名排序）。

- 文件为空 → 安装按钮直接报错「记忆文件为空」，不写入任何内容。
- 「记忆」页编辑的就是这一份；保存时会清洗文件名（剔除 `\ / : * ? " < > |` 与换行），并禁止把 `README.md` 当指令文件。
- 保存后在「破甲目标」重新安装一次，或重启目标软件，改动才生效。
- 开发目录里的 `memory/` 会在打包时复制到 `resources/memory/`；**安装包内的这份是快照**，想改已安装的版本，要么在程序的「记忆」页改，要么重新打包。
- 卸载不会修改 `memory/` 里的任何文件。

---

## 6. 工作原理

### 6.1 进程架构

```mermaid
flowchart LR
  UI["渲染层 App.tsx<br/>React 19"] -->|"IPC invoke"| MAIN["主进程 main.cjs<br/>Electron"]
  MAIN -->|"spawn"| PS["PowerShell 安装脚本<br/>install*.ps1"]
  PS -->|"读写"| CFG["目标软件配置目录<br/>AGENTS.md / CLAUDE.md / 记忆档案"]
  PS -->|"stdout/stderr"| MAIN
  MAIN -->|"tool:log / tool:status"| UI
```

- 渲染层只通过 preload 暴露的 `window.hs` 说话，`contextIsolation: true`、`nodeIntegration: false`。
- 主进程负责定位脚本目录、拼参数、起子进程、收集输出、记录状态。
- 所有写盘动作都在 PowerShell 脚本里完成，主进程不直接碰用户配置。

### 6.2 一次安装发生了什么

1. `tool:install` 先调用 `memoryPrompt()`，取 `memory/` 下第一份非空 `.md`；取不到直接返回失败。
2. 按目标拼参数（`installArgs`），例如 Codex 额外带 `-InjectAgents`，WorkBuddy 国内版带 `-ConfigDir ~/.workbuddy`。
3. `runPowerShell()` 以 `powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass` 启动脚本，并补全 `PSModulePath`。
4. 输出按字节累积后整段解码：先试 UTF-8，出现非法字节退回 GBK，因此中文 Windows 的日志不会变成乱码。
5. 退出码为 0 才写入 `fj_desktop_state.json` 的 `installed` 记录；界面据此显示「已安装」。

### 6.3 一次卸载发生了什么

1. `install*.ps1 -Uninstall` 按注入标记摘除内容，能还原备份的还原备份。
2. **无论上一步成功与否**，都会再跑一次 `scripts/clear-injected-prompts.ps1 -Apply -Targets <目标>` 做残留清扫——这是硬要求：卸载脚本失败时更需要兜底。
3. 两步都成功才从状态里删除该目标。

### 6.4 IPC 一览

| 通道 | 方向 | 作用 |
|---|---|---|
| `tool:state` | 渲染 → 主 | 已安装目标、应用版本 |
| `tool:memory` | 渲染 → 主 | 当前指令源（文件名、字数） |
| `tool:memory:read` / `tool:memory:write` | 渲染 → 主 | 「记忆」页读 / 写正文 |
| `tool:install` / `tool:uninstall` | 渲染 → 主 | 安装 / 卸载 |
| `tool:restoreMemory` | 渲染 → 主 | 装回原始记忆 |
| `tool:restartCodex` | 渲染 → 主 | 重启 Codex |
| `tool:copy` / `tool:openQQ` | 渲染 → 主 | 复制群号 / 打开链接（限 `http(s)`、`mqqapi:`、`tencent:`） |
| `tool:win` / `tool:quit` | 渲染 → 主 | 窗口最小化/最大化/关闭、退出 |
| `tool:log` / `tool:status` / `tool:notify` | 主 → 渲染 | 实时日志、状态、提示 |

### 6.5 窗口实现

`frame: false` 去掉系统边框，标题栏与拖拽区由界面顶栏承担（`-webkit-app-region: drag`，按钮显式 `no-drag`）；圆角交给 Windows 11 的 DWM（`roundedCorners: true`），不使用透明窗口，因此窗口仍可正常缩放和贴边。

---

## 7. 目录结构

```
zero-x/
├─ electron/
│  ├─ main.cjs            主进程：窗口、托盘、IPC、PowerShell 调度、状态读写
│  └─ preload.cjs         contextBridge，向渲染层暴露 window.hs
├─ src/
│  ├─ App.tsx             界面：破甲目标 / 记忆 / 关于 三页 + 抽屉 + 日志
│  ├─ data/targets.ts     目标清单、教程、群号、链接、免责声明
│  ├─ lib/hs.ts           IPC 类型包装
│  ├─ ui.css              深色主题与布局
│  ├─ assets/             界面 logo
│  └─ main.tsx            React 入口
├─ memory/
│  ├─ 指令集.md           默认指令正文（打包进 resources/memory/）
│  └─ README.md           本目录的使用说明
├─ install*.ps1           每个目标的安装 / 卸载 / 还原脚本（8 个）
├─ scripts/
│  ├─ build.mjs           变体构建：vite → ico → electron-builder → 便携 zip
│  ├─ after-pack.js       rcedit 写入 exe 图标与版本信息
│  ├─ make-ico.ps1        PNG → 多尺寸 ICO（PowerShell 版）
│  ├─ make-ico.py         同上（Python 兜底）
│  ├─ clear-injected-prompts.ps1  提示词残留清扫
│  ├─ verify-uninstall.ps1        只读：检测卸载残留
│  ├─ test-uninstall.ps1          装 → 跑 → 卸 的残留回归
│  ├─ purge-residue.ps1           历史残留清理（默认 dry-run）
│  └─ scan-secrets.mjs            发布前敏感信息扫描
├─ build/                 图标（png/ico）与 NSIS 钩子 installer.nsh
├─ dist/                  渲染层构建产物（由 vite 生成）
├─ release/               安装包、win-unpacked、便携 zip
├─ variant.json           构建变体与界面版本号
├─ index.html             渲染层入口（含 CSP）
├─ vite.config.ts         base: "./"，端口 5273
└─ package.json           依赖、electron-builder 基础配置
```

---

## 8. 开发环境

**要求**：Windows 10/11、Node.js 18+（实测 Node 24）、npm。构建与运行都依赖 PowerShell 5.1，系统自带。

```bash
# 依赖（国内网络用镜像）
npm install --registry=https://registry.npmmirror.com

# 构建渲染层
npm run build

# 启动桌面应用（加载 dist/）
npm run dev:electron
```

调试渲染层热更新时，启动 Vite 开发服务器并设置环境变量：

```bash
npm run dev          # Vite，端口 5273（strictPort）
# 另开一个终端：
# PowerShell: $env:HS_DEV=1; npm run dev:electron
```

主进程还带三个开发用开关：

| 环境变量 | 作用 |
|---|---|
| `HS_DEV=1` | 加载 `http://localhost:5273` 而不是 `dist/` |
| `HS_DEBUG=1` | 把渲染进程 console、崩溃、加载失败转发到终端 |
| `HS_CAPTURE=<目录>` | 逐页截图后自动退出，用于版式验收 |

---

## 9. 构建与打包

```bash
npm run dist            # 默认变体（来自 variant.json，当前 free）
node scripts/build.mjs free
node scripts/build.mjs pro
```

构建流程（`scripts/build.mjs`）：

1. 按变体写入 `variant.json`（应用名、界面版本号）；free / pro 共用源码，只有 appId、图标、产物名不同；
2. `vite build` 生成 `dist/`；
3. `make-ico.ps1` 把 `build/icon.png` 转成多尺寸 `icon.ico`（失败回退 Python 版）；
4. 派生 `.electron-builder.<variant>.json`，调用 electron-builder 产出 `nsis` 安装器与 `win-unpacked`；
5. `after-pack.js` 用缓存里的 rcedit 写入 exe 图标与版本信息（绕开 electron-builder 在 Windows 上的 winCodeSign 解压问题）；
6. 把 `win-unpacked` 压成便携 zip（比 electron-builder 的 `portable` 目标启动快得多）。

构建期会通过 `ELECTRON_BUILDER_BINARIES_MIRROR`（默认 npmmirror）下载 NSIS 工具链，国内网络无需额外配置。

### 9.1 产物

| 文件 | 位置 |
|---|---|
| 安装器 `ZERO-X破甲-安装版-4.5.0.exe` | `release/` |
| 便携包 `ZERO-X破甲-便携版-4.5.0.zip` | `release/` |
| 免安装目录 `win-unpacked/` | `release/` |
| 安装包内资源（脚本、memory、icon） | `release/win-unpacked/resources/` |

### 9.2 版本号有两个

- **界面显示版本**：`variant.json` 的 `version`（当前 `2.0`），由构建写入；
- **安装包文件名版本**：`package.json` 的 `version`（当前 `4.5.0`）。

### 9.3 卸载清理

`build/installer.nsh` 在卸载时额外处理 electron-builder 默认不管的东西：`%LOCALAPPDATA%\<name>-updater` 缓存、旧构建遗留的别名目录、AUMID / 跳转列表，以及本工具写在 `~/.codex` 下的两个状态文件。

---

## 10. 命令行直接调用安装脚本

不使用界面也能装，适合批量部署或排障。所有脚本都支持 `-SourcePrompt <文件>`、`-Uninstall`、`-RestoreMemory`。

```powershell
# Codex：同时写入 config.toml 与 AGENTS.md
.\install.ps1 -SourcePrompt .\memory\指令集.md -InjectAgents -AgentsKnown .\memory\指令集.md

# WorkBuddy 国内版（必须显式指定数据目录）
.\install-workbuddy.ps1 -SourcePrompt .\memory\指令集.md -ConfigDir "$HOME\.workbuddy"

# 豆包：先让客户端以调试端口启动，再安装
.\install-doubao.ps1 -SourcePrompt .\memory\指令集.md -Port 9222

# 卸载 / 只还原记忆
.\install-claude.ps1 -Uninstall
.\install-claude.ps1 -RestoreMemory
```

常用参数：

| 脚本 | 参数 |
|---|---|
| `install.ps1` | `-CodexHome` `-NoSkills` `-InjectAgents` `-AgentsKnown` |
| `install-zcode.ps1` | `-ZcodeHome` `-MemorySourcePrompt` `-PatchSystemPrompt` `-WorkspacePath` |
| `install-cursor.ps1` | 自动探测规则目录，无额外路径参数 |
| `install-claude.ps1` | `-ClaudeHome` `-KnownPrompts` |
| `install-opencode.ps1` | `-ConfigDir` `-KnownPrompts` |
| `install-workbuddy.ps1` | `-ConfigDir` `-Uid` `-NoSkills` `-KillApp` `-Restart` `-Status` |
| `install-dsh.ps1` | `-DshHome` `-KitRoot` |
| `install-doubao.ps1` | `-Port`（默认 9222） `-Version` `-Status` `-NoLaunch` |

---

## 11. 验收与清理脚本

| 脚本 | 用途 | 是否写盘 |
|---|---|---|
| `node scripts/scan-secrets.mjs [目录]` | 扫描产物中的密钥、凭据、本机路径；发现 HIGH 项退出码 1 | 否 |
| `scripts/verify-uninstall.ps1` | 只读检测卸载残留，逐条列出；`-OutFile` 可与安装前 diff | 否 |
| `scripts/test-uninstall.ps1 -Installer <exe>` | 静默安装 → 启动一次 → 静默卸载 → 与安装前状态对比 | 是（安装/卸载本身） |
| `scripts/purge-residue.ps1` | 清理历史版本残留；默认 dry-run，`-Apply` 才删除 | 仅 `-Apply` |

`purge-residue.ps1` 的名称匹配是精确匹配，不会误删磁盘上碰巧带「破甲」二字的其它目录，也不会碰 `~/.codex` 里 Codex CLI 本体的内容。

---

## 12. 故障排查

| 现象 | 原因 | 处理 |
|---|---|---|
| 点安装提示「记忆文件为空」 | `memory/` 下没有非空 `.md` | 在「记忆」页填内容并保存，或放一份非空 `.md` 进目录 |
| 安装成功但目标软件里没反应 | 目标软件仍持有旧配置 | 彻底退出目标软件再启动；Codex 可用「重启 Codex」按钮 |
| 安装报执行策略错误 | 脚本被策略拦住 | 程序已带 `-ExecutionPolicy Bypass`；若手工运行，加同样的参数 |
| 旧版安装时报 `Get-FileHash 无法识别` | 进程模块路径异常 | 当前版本的脚本已改用 .NET SHA256，不再依赖该 cmdlet；请使用新包 |
| 豆包安装提示端口无响应 | 客户端未以调试模式运行 | 先打开豆包；或允许脚本自动以 `--remote-debugging-port=9222` 重启 |
| 安装卡住 | 目标软件占用文件或脚本等待 | 10 分钟后自动超时并终止，日志会标出「[超时] 已强制终止」 |
| 窗口找不到 | 关闭 = 收进托盘；也可能是单实例把新窗口合并了 | 点托盘图标，或托盘菜单「打开主面板」 |
| 日志中文乱码 | 系统代码页与 UTF-8 不一致 | 程序已做 UTF-8 → GBK 自动回退；仍有乱码请附日志反馈 |
| 界面显示已安装但实际没生效 | 状态记录与实际配置不一致 | 卸载后重装；状态文件位于 `<CodexHome>/fj_desktop_state.json` |
| SmartScreen 拦截 | 安装包未签名 | 「更多信息 → 仍要运行」 |

日志排查建议顺序：界面底部「运行日志」→ `release/win-unpacked/resources/` 下的脚本 → 目标软件自身配置目录里的备份文件（`*.bak`、`*.backup-*`）。

---

## 13. 安全边界与已知限制

**边界**

- 程序不联网（豆包目标只访问本机 `127.0.0.1:9222`）。
- 安装与卸载只处理本工具写入的内容；用户自己的记忆、规则、技能库保持原样，并优先从安装前备份还原。
- 渲染层禁用 Node 集成，入口页带 CSP（`default-src 'self'`）。
- 安装包未做代码签名，Windows 可能提示 SmartScreen。

**限制**

- 仅支持 Windows；托盘行为与窗口圆角依赖 Windows 的桌面子系统（圆角需要 Windows 11 的 DWM）。
- 目标软件版本升级后配置结构可能变化，脚本按实际目录探测，探测不到会明确报错而不是猜路径。
- 豆包目标依赖 CDP 调试端口，客户端升级可能改变接口路径。
- 程序本身不含提示词；效果取决于你在 `memory/` 里填写的内容。
- 「记忆」页保存的是 `memory/` 下的源文件；对已安装的目标需重新安装或重启目标软件才生效。

---

## 14. 版本、联系与说明

| 项 | 值 |
|---|---|
| 界面版本 | 见 `variant.json`（当前 2.0） |
| 安装包版本 | 见 `package.json`（当前 4.5.0） |
| 交流群 | 764635322 |
| 中转站 | https://tuomi.club |

使用前请阅读程序「关于」页内的免责声明。本工具只负责把文本写入本机软件的配置位置，不改变目标软件本身，也不对其输出负责。
