# Mintlify 文档仓库结构说明（v5）

更新时间：2026-05-22

## 1. 问题定位

生产站点 `https://docs.marsmind.co` 没有显示 v3/v4 中新增的 `/cn/admin-backend/overview`，不是单纯部署延迟。

通过生产 `llms.txt` 和 `llms-full.txt` 检查发现，生产当前使用的是另一套管理后台路径体系：

| 生产路径 | 页面 |
| :--- | :--- |
| `cn/admin-backend/platform-login` | 账户后台登录及基础 |
| `cn/admin-backend/data-dashboard/business-performance` | 业务表现 |
| `cn/admin-backend/data-dashboard/data-export` | 数据导出 |
| `cn/admin-backend/data-dashboard/order-usage` | 订单用量 |
| `cn/admin-backend/assistant-settings/login-online` | 登录上线 |
| `cn/admin-backend/assistant-settings/response-settings` | 响应设定 |
| `cn/admin-backend/assistant-settings/relation-config` | 关系配置 |
| `cn/admin-backend/assistant-settings/lead-cleaning` | 线索清洗 |
| `cn/admin-backend/assistant-settings/working-hours` | 工作时间 |
| `cn/admin-backend/knowledge-base/construction` | 知识建设 |
| `cn/admin-backend/knowledge-base/audit` | 知识审核 |
| `cn/admin-backend/knowledge-base/management` | 知识管理 |

## 2. 根因判断

当前本地 repo `yangruoyuluke/mintlify-docs` 推送到 main 后，生产仍展示上述生产路径体系，且这些路径原本并不存在于本地仓库。

这说明至少存在一个问题：

- Mintlify 生产站点绑定的内容源不是当前本地 repo，或
- Mintlify Dashboard 中保存了另一套内容结构，或
- 生产使用了当前 repo 外的历史构建内容。

## 3. 本次修正

为了和生产当前实际路径体系对齐，本次在当前 repo 中新增生产路径对应文件，并更新中文 `docs.json` 管理后台菜单，避免继续使用 `/cn/admin-backend/overview` 这类生产不存在的 flat 路径。

新增目录：

- `cn/admin-backend/assistant-settings/`
- `cn/admin-backend/data-dashboard/`
- `cn/admin-backend/knowledge-base/`

新增/同步页面：

| 文件 | 来源或说明 |
| :--- | :--- |
| `platform-login.mdx` | 同步新版进入账户后台内容 |
| `assistant-settings/login-online.mdx` | 同步登录上线内容 |
| `assistant-settings/response-settings.mdx` | 同步响应设定内容 |
| `assistant-settings/relation-config.mdx` | 同步关系配置内容 |
| `assistant-settings/lead-cleaning.mdx` | 同步线索清洗内容 |
| `assistant-settings/working-hours.mdx` | 同步工作时间内容 |
| `data-dashboard/business-performance.mdx` | 同步业务表现内容 |
| `data-dashboard/data-export.mdx` | 同步数据导出内容 |
| `data-dashboard/order-usage.mdx` | 新增订单用量说明 |
| `knowledge-base/construction.mdx` | 合并知识生成与知识录入为知识建设 |
| `knowledge-base/audit.mdx` | 同步知识审核内容 |
| `knowledge-base/management.mdx` | 合并知识维护与分组管理为知识管理 |

## 4. 下一步

如果生产仍不更新，需要进入 Mintlify Dashboard 检查 `docs.marsmind.co` 绑定的 GitHub repo、branch 和内容源。当前 Vercel/MarsMind 团队下没有直接可部署的 docs 项目，`docs.marsmind.co` 的 Vercel 项目 ID 属于 Mintlify 托管层，不能通过 MarsMind Vercel CLI 直接部署。
