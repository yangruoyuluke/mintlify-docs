# MarsMind 文档站（重构版）

docs.marsmind.co 的源仓库。Mintlify 站点，五种语言：中文（`cn`）、English（`en`）、日本語（`jp`）、Français（`fr`）、Español（`es`）。

## 目录

```
docs.json            # Mintlify 配置：五语导航、主题、登录入口
cn/ en/ jp/ fr/ es/  # 各语言页面（结构完全一致）
images/<lang>/…      # 各语言截图（由 prodspec 验收站采集）
scripts/capture/     # 截图采集与装配脚本
scripts/checks/      # 提交前一致性检查
REBUILD-PLAN.md      # 本次重构方案（结构 / 模板 / 门禁）
DESIGN.md            # 写作与截图规范
```

## 本地预览

```bash
npm i -g mintlify      # 或 npx mintlify
mintlify dev           # 本地起文档站
```

## 提交前检查

```bash
node scripts/checks/check-docs.mjs
```

## 截图重拍

见 `scripts/capture/README.md`。
