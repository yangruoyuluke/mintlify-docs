# Mintlify 文档仓库结构说明（v4）

更新时间：2026-05-22

## 1. 本次任务目标

本版本记录中文管理后台操作指南重构后的本地预览、浏览器级检查、Mintlify 校验和生产环境检查结果。

## 2. 本地预览结果

本地使用 Mintlify CLI 启动预览：

```bash
npm_config_cache=/tmp/codex-npm-cache npx --yes mint@latest dev --port 3000 --no-open
```

本地预览地址：`http://localhost:3000`。

浏览器检查页面：

| 页面 | 结果 |
| :--- | :--- |
| `/cn/admin-backend/overview` | 正常渲染，中文管理后台新菜单可见 |
| `/cn/admin-backend/knowledge-generation` | 正常渲染，知识生成页面可访问 |
| `/cn/admin-backend/skills-library` | 正常渲染，技能库页面可访问 |
| `/cn/admin-backend/account-settings` | 正常渲染，账号设置页面可访问 |

## 3. 修复项

浏览器预览发现 `docs.json` 中 logo 和 favicon 使用相对路径时，在嵌套路由下会被解析为 `/cn/admin-backend/logo/...`，导致 logo 图片 broken。

已修复为 root-relative 路径：

```json
"logo": {
  "light": "/logo/logo-light.png",
  "dark": "/logo/logo-dark.png"
},
"favicon": {
  "light": "/logo/favicon.svg",
  "dark": "/logo/favicon-dark.svg"
}
```

修复后本地 `/cn/admin-backend/overview` 浏览器检查无 broken image。

## 4. Mintlify 校验结果

执行：

```bash
npm_config_cache=/tmp/codex-npm-cache npx --yes mint@latest validate
```

结果：`success build validation passed`。

## 5. 生产环境检查结果

生产域名：`https://docs.marsmind.co`。

检查页面：`https://docs.marsmind.co/cn/admin-backend/overview`。

当前结果：生产仍返回旧站点结构下的 `Page Not Found`，导航仍显示旧结构“快速开始 / 用户手册 / 开发者”，尚未消费最新 main 分支内容。

HTTP 头中观察到：

| 字段 | 结果 |
| :--- | :--- |
| `x-served-version` | `dpl_9fLWiEk9CzCkzHWampdPAxEGr1he` |
| 首页 `last-modified` | 2026-05-20 |
| GitHub main 最新提交 | `bb71ab4` |

结论：代码已经合并并推送到 `main`，但 Mintlify 生产部署仍未更新到最新 commit。需要等待 Mintlify 后台部署，或进入 Mintlify Dashboard 手动触发/检查部署。

## 6. Git 状态

已将 `codex/admin-backend-guide` 快进合并到 `main` 并推送到远端。

最新关键提交：

| 提交 | 说明 |
| :--- | :--- |
| `3d92589` | 更新管理后台操作指南 |
| `bb71ab4` | 修复 Mintlify asset 路径 |
