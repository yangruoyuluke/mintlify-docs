# MarsMind 文档站重构方案（2026-10）

> 本文档是本次重构的单一事实来源：结构、页面清单、写作规范、截图规范、验收标准。
> 重构完成后，本文件保留在仓库根目录，供后续维护者对齐口径。

## 1. 背景

- 产品后台在 2026-09 / 2026-10 做了大版本更新：左侧导航重构为 **数据看板 / 我的助手 / 响应设定 / 知识库 / 技能库** 五大模块，账号菜单独立为 **个人资料 / 登录安全 / AI 身份授权**，并新增 **会话明细复核（美客多）**；废弃了「网页聊天」「初始化配置」等旧入口。
- 后台已支持 **五种界面语言**：中文（zh-CN）、English（en）、日本語（ja）、Français（fr）、Español（es）。
- 现文档站（docs.marsmind.co）只覆盖 cn / en / jp 三语，且 en / jp 仍是**旧后台结构**（login-and-registration、run-avatar、qa-management、identity-setup、inbound-setup、data-module 等），截图也是旧界面；cn 部分页面同样引用了已改版的界面。
- 用户诉求：按**新产品的模块结构**重塑文档逻辑；主体是**用户操作指南**；每一步都从**用户视角**写，去掉空话；**所有截图按语言重拍**；补齐法语、西班牙语。

## 2. 事实基线（来自产品前端仓库 mmfrontend，2026-10-04）

左侧导航（`src/constants/navigation.ts`）：

| 模块 | 页面（路由） |
|---|---|
| 数据看板 | 业务表现 `/dashboard`、AI 用量 `/ai-usage`、明细数据 `/data-export`、会话明细复核 `/mercado-review` |
| 我的助手 | 登录上线 `/ai-assistant-login`、基础人设 `/persona`、关系配置 `/relationship-management` |
| 响应设定 | 回复规则 `/persona-reply`、安全围栏 `/ai-reply-guardrails`、新客户接待 `/lead-cleaning`、工作时间 `/service-time` |
| 知识库 | 知识生成 `/knowledge-upload`、知识优化 `/knowledge-review`、知识管理 `/knowledge-category-settings` |
| 技能库 | `/skills-library` |
| 账号设置（左下角菜单） | 个人资料 `/personal-settings`、登录安全 `/password-settings`、AI 身份授权 `/auth-code-settings` |

辅助入口：顶栏「后台助手」聊天抽屉、顶栏「帮助与引导」、管理窗口切换器、登录页 `/login`。

## 3. 新文档信息架构（五语一致）

```
快速开始
  ├─ 认识 MarsMind            quick-start/introduction
  ├─ 开通与准备               quick-start/preparation
  └─ 30 分钟快速上手          quick-start/quick-start

用户操作指南（主体）
  ├─ 后台界面导览             guide/interface-tour
  ├─ 数据看板
  │   ├─ 业务表现             guide/dashboard/business-performance
  │   ├─ AI 用量              guide/dashboard/ai-usage
  │   ├─ 明细数据             guide/dashboard/data-export
  │   └─ 会话明细复核         guide/dashboard/conversation-review
  ├─ 我的助手
  │   ├─ 登录上线             guide/assistant/login-online
  │   ├─ 基础人设             guide/assistant/persona
  │   └─ 关系配置             guide/assistant/relationship-config
  ├─ 响应设定
  │   ├─ 回复规则             guide/response/reply-rules
  │   ├─ 安全围栏             guide/response/safety-guardrails
  │   ├─ 新客户接待           guide/response/new-customer-reception
  │   └─ 工作时间             guide/response/working-hours
  ├─ 知识库
  │   ├─ 知识生成             guide/knowledge/generation
  │   ├─ 知识优化             guide/knowledge/optimization
  │   └─ 知识管理             guide/knowledge/management
  ├─ 技能库                   guide/skills/library
  └─ 账号设置
      ├─ 个人资料             guide/account/profile
      ├─ 登录安全             guide/account/security
      └─ AI 身份授权          guide/account/ai-authorization

协作指南
  ├─ 与 AI 并肩工作（基础）    collaboration/basics
  ├─ 进阶协作与强制命令        collaboration/advanced
  └─ MarsMind 工作方法         collaboration/marsmind-method

开发者文档
  ├─ API 参考                 developer/api-reference
  ├─ 技能模块详解             developer/skill-modules
  └─ 版本更新                 developer/updates
```

语言目录：`cn/ en/ jp/ fr/ es/`（延续线上已有语言代码，新增 fr、es）。

## 4. 页面写作模板（所有「用户操作指南」页面统一）

1. **一句话价值**：这个页面帮用户解决什么问题（不超过两行）。
2. **什么时候会用到它**：典型场景 2–4 条（bullet）。
3. **进入路径**：`左侧菜单 → 模块 → 页面`，并配一张进入后的整页截图。
4. **操作步骤**：`<Steps>` 分步，每步 = 动作 + 界面上看到什么 + 判断标准；关键步骤各配一张截图（`<Frame>` 包裹）。
5. **检查点**：怎么判断配置生效/做对了（例如状态变绿、出现某条提示）。
6. **注意事项**：`<Warning>` 不可逆操作 / 权限要求；`<Info>` 概念解释；`<Tip>` 提效技巧。
7. **常见问题**：3–5 条（只写真实会遇到的）。

写作红线：

- 不写营销话术、不写「本功能非常重要」这类空话；只写用户看得见、点得着的东西。
- 界面上有的字，文档必须用**完全一致的文案**（按各语言界面的实际文案，见 UI 文案表）。
- 每张截图必须对应到具体的操作步骤，不插图库式的装饰截图。
- 表格只承载一类信息；复杂流程拆成步骤。

## 5. 截图规范

- 来源：生产前端仓库的 prodspec 验收站（真实生产组件 + 真实 Layout/Sidebar + 本地示例数据），脚本见 `scripts/capture/`。
- 规格：1280×720 视口 @2x 采集；隐藏验收站工具栏，只保留产品界面。
- 命名：`images/<lang>/<page>/NN-<step>.png`，`NN` 与文档步骤一一对应。
- 五语各拍一套：`cn/ en/ jp/ fr/ es/`。
- 不出现真实客户数据（演示数据）；不出现密钥、授权码等敏感值。

## 6. 质量门禁

重构完成后必须全部通过（脚本见 `scripts/checks/`）：

1. `docs.json` 合法，五语导航引用到的每个 mdx 都存在。
2. 每页引用的图片文件都存在（无死图）。
3. 所有内部链接（站内 .mdx 引用）可解析。
4. 五语页面集合一致（同一套 page key，不允许某语言缺页）。
5. UI 文案一致性抽查：文档中出现的按钮/菜单名与对应语言界面的实际文案一致。

## 7. 交付与边界

- 交付：本仓库（新独立仓库）中的完整重构；PR 供评审。
- 边界：**不推送原 mintlify-docs 仓库、不部署线上**；线上切换由产品负责人在评审后决定。
