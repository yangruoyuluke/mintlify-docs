# Mintlify 文档仓库结构说明（v3）

更新时间：2026-05-22

## 1. 本次修正目标

v2 只更新了旧页面内容，没有把 `docs.json` 中的中文管理后台菜单重构为真实操作指南体系。v3 修正这一点：保持站点顶层框架不变，但重建中文“管理后台”下的文档菜单，让用户在文档侧边栏中看到与后台真实导航一致的入口。

## 2. 菜单体系变化

中文 `docs.json` 的“管理后台”从旧 6 页结构调整为以下体系。

| 一级入口 | 子入口 |
| :--- | :--- |
| 管理后台总览 | 管理后台总览、进入账户后台 |
| 数据看板 | 业务表现、数据导出 |
| 助手设置 | 登录上线、响应设定、关系配置、线索清洗、工作时间 |
| 技能库（Beta） | 技能库（Beta） |
| 知识库 | 知识库总览、知识生成、知识录入、知识审核、知识维护、知识分组设定 |
| 网页聊天与引导 | 网页聊天、操作指南入口、账号设置 |

## 3. 新增页面

本次新增以下中文 MDX 页面。

| 文件 | 目的 |
| :--- | :--- |
| `cn/admin-backend/overview.mdx` | 管理后台总览和推荐配置顺序 |
| `cn/admin-backend/data-export.mdx` | 数据导出说明 |
| `cn/admin-backend/response-settings.mdx` | 响应设定说明 |
| `cn/admin-backend/working-hours.mdx` | 工作时间说明 |
| `cn/admin-backend/skills-library.mdx` | 技能库说明 |
| `cn/admin-backend/knowledge-generation.mdx` | 知识生成说明 |
| `cn/admin-backend/knowledge-entry.mdx` | 知识录入说明 |
| `cn/admin-backend/knowledge-review.mdx` | 知识审核说明 |
| `cn/admin-backend/knowledge-maintenance.mdx` | 知识维护说明 |
| `cn/admin-backend/knowledge-group-settings.mdx` | 知识分组设定说明 |
| `cn/admin-backend/web-chat.mdx` | 网页聊天说明 |
| `cn/admin-backend/operation-guide.mdx` | 操作指南和帮助中心说明 |
| `cn/admin-backend/account-settings.mdx` | 账号设置说明 |

## 4. 复用与重写页面

原有 6 个中文后台页面继续保留路径，避免破坏旧链接，但页面定位已调整。

| 原文件 | 新定位 |
| :--- | :--- |
| `login-and-registration.mdx` | 进入账户后台 |
| `run-avatar.mdx` | 登录上线 |
| `qa-management.mdx` | 知识库总览 |
| `identity-setup.mdx` | 关系配置 |
| `inbound-setup.mdx` | 线索清洗 |
| `data-module.mdx` | 业务表现 |

## 5. 语言策略

本次只调整中文导航和中文页面。英文、日文内容没有同步翻译，因此暂不暴露新增英文和日文页面，避免多语言页面内容不完整。

后续如果需要三语一致，应基于 v3 中文页面作为源文档，创建英文和日文对应页面后再同步更新 `docs.json` 的 `en` 和 `jp` 导航。
