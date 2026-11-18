/** 破甲目标；本构建已移除全部内置提示词与 V1–V5 版本，页面仅保留清理与还原能力。 */
import variantInfo from "../../variant.json";

export const APP_NAME = variantInfo.appName;
/** 界面展示的版本号，由构建变体写入 variant.json。 */
export const APP_VERSION = variantInfo.version || "1.0";

export type Target = {
  id: string;
  /** 侧栏导航名 */
  nav: string;
  /** 页面小标（英文代号 + 中文） */
  eyebrow: string;
  /** 页面大标题 */
  title: string;
  /** 页面导语 */
  desc: string;
  /** 卸载按钮文案；没有该字段表示不支持卸载 */
  uninstallLabel: string;
  /** 主视觉卡片的图标字 */
  icon: string;
};

/** 所有目标共用的导语。 */
const TARGET_DESC =
  "指令来源是你放进 memory 目录的 .md 文件。" +
  "反复执行不会叠加副作用；撤销时只回收本工具写入的那部分，原有记忆与配置保持原样。";

export const TARGETS: Target[] = [
  {
    id: "codex",
    icon: "Cx",
    nav: "Codex 破甲",
    eyebrow: "CODEX · 旗舰模型",
    title: "Codex 破甲",
    desc: TARGET_DESC,
    uninstallLabel: "撤销 Codex 注入",
  },
  {
    id: "zcode",
    icon: "Zc",
    nav: "ZCode 破甲",
    eyebrow: "ZCODE · 终端",
    title: "ZCode 破甲",
    desc: TARGET_DESC,
    uninstallLabel: "撤销 ZCode 注入",
  },
  {
    id: "cursor",
    icon: "Cu",
    nav: "Cursor 破甲",
    eyebrow: "CURSOR · 编辑器",
    title: "Cursor 破甲",
    desc: TARGET_DESC,
    uninstallLabel: "撤销 Cursor 注入",
  },
  {
    // OpenCode：全局规则 ~/.config/opencode/AGENTS.md，技能 ~/.config/opencode/skills
    id: "opencode",
    icon: "Oc",
    nav: "OpenCode 破甲",
    eyebrow: "OPENCODE · 开源终端",
    title: "OpenCode 破甲",
    desc: TARGET_DESC,
    uninstallLabel: "撤销 OpenCode 注入",
  },
  {
    id: "claude",
    icon: "Cl",
    nav: "Claude 破甲",
    eyebrow: "CLAUDE · 桌面端",
    title: "Claude 破甲",
    desc: TARGET_DESC,
    uninstallLabel: "撤销 Claude 注入",
  },
  {
    id: "workbuddy",
    icon: "Wb",
    nav: "WorkBuddy 破甲",
    eyebrow: "WORKBUDDY · 海外发行",
    title: "WorkBuddy 破甲（国际版）",
    desc: TARGET_DESC,
    uninstallLabel: "撤销 WorkBuddy 注入",
  },
  {
    // WorkBuddy 国内版：同一个程序的两套发行，数据目录不同
    // （国际版 ~/.workbuddy-ai，国内版 ~/.workbuddy），清理时同样要分开处理。
    id: "workbuddy-cn",
    icon: "Wb",
    nav: "WorkBuddy 国内版",
    eyebrow: "WORKBUDDY · 国内发行",
    title: "WorkBuddy 破甲（国内版）",
    desc: TARGET_DESC,
    uninstallLabel: "撤销 WorkBuddy 国内版注入",
  },
  {
    id: "dsh",
    icon: "Ds",
    nav: "DeepSeek Harness 破甲",
    eyebrow: "DEEPSEEK HARNESS · 推理",
    title: "DeepSeek Harness 破甲",
    desc: TARGET_DESC,
    uninstallLabel: "撤销 DeepSeek 注入",
  },
  {
    id: "doubao",
    icon: "Db",
    nav: "豆包破甲",
    eyebrow: "豆包 · DOUBAO",
    title: "豆包破甲",
    desc: TARGET_DESC,
    uninstallLabel: "撤销豆包注入",
  },
];

export const TUTORIAL_TITLE = "使用教程";

export const TUTORIAL_TEXT = [
  "三件事：备指令、装目标、喊一声。",
  "",
  "【1】备指令",
  "    切到「记忆」页，正文直接在里面改，点保存就写回文件。",
  "    默认文件是 指令集.md；想换一份，丢任意 .md 进 memory 目录也行，非空即生效。",
  "",
  "【2】装目标",
  "    切回「破甲目标」，挑要接管的软件，按「安装」。",
  "    写入的是该软件自己的规则文件。装完把软件彻底退出，再启动一次，新指令才会加载。",
  "",
  "【3】喊一声（关键）",
  "    打开它的对话框，先单独发一行大写：",
  "",
  "            ZERO-X",
  "",
  "    回一句握手行就代表接管成功。之后照常说事就行，例如：",
  "",
  "            ZERO-X",
  "            这个 apk 会读哪些权限",
  "",
  "    要确认它还在状态，发「自检」，应回 All systems normal. Continue.",
  "    想让它接着上一轮干，发「继续」「接着做」或 retry 都可以。",
  "",
  "撤掉",
  "    「卸载」：指令、技能、写入记录一起回滚；",
  "    「装回原始记忆」：只把指令文件还原，别的不动。",
  "",
  "                        QQ 群 764635322 · 永久免费",
].join("\n");

/** 交流群号：界面按钮点击时复制到剪贴板，再尝试唤起 QQ。 */
export const QQ_GROUP = "764635322";

/** 加入QQ群 / 不会用点这里：两个入口同一个群邀请链接。 */
export const QQ_LINK = "mqqapi://card/show_pslcard?src_type=internal&version=1&uin=764635322&card_type=group&source=qrcode";

/** 满血中转站：点击后用系统浏览器打开。 */
export const RELAY_LINK = "https://tuomi.club";

/** 不会用点这里：导航栏点击后直接拉起 QQ 群。 */
export const HELP_LINK = "mqqapi://card/show_pslcard?src_type=internal&version=1&uin=764635322&card_type=group&source=qrcode";

export const DISCLAIMER_TITLE = "免责声明";

export const DISCLAIMER_TEXT = [
  "本提示词、文档、代码及其相关资料（以下统称“本内容”）仅可用于合法的学习研究、经授权的安全测试、技术探讨与知识交流。",
  "",
  "一、本内容面向具备完全民事行为能力的成年人提供。获取或使用前，请自行确认行为符合所在地法律法规以及第三方平台的使用协议。",
  "二、不得将本内容用于任何违法或侵权用途，包括但不限于：开发游戏外挂、实施网络入侵或 DDoS 攻击、传播恶意程序、伪造证件、实施诈骗、洗钱、走私、涉及枪械/爆炸物/毒品等危害人身安全的活动、诱导 AI 突破安全限制实施违法，以及侵害他人合法权益的其他行为。",
  "三、使用者将本内容用于非法用途的，属其个人独立行为，与提供方无关；由此引发的法律后果、经济责任及第三方索赔，由使用者自行承担。",
  "四、提供方不对使用者的行为承担任何直接或间接责任，亦不参与、不协助、不鼓励、不放任任何违法行为。",
  "五、使用、复制或传播本内容，即表示已阅读并接受本声明的全部条款；如不接受，请立即停止使用并删除全部副本。",
  "",
  "提供方有权随时修订本声明，修订版本自公布之日起生效。",
].join("\n");
