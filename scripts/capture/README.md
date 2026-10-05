# 文档截图采集

文档站所有截图来自**生产前端仓库 mmfrontend 的 prodspec 验收站**：真实生产页面组件 + 真实 Layout/Sidebar，接口由本地 fixture 提供，不访问生产服务、不含真实客户数据。

## 为什么不用生产站截图

- 生产后台需要账号登录，且页面里是真实客户数据（隐私问题，还需要脱敏）。
- 验收站的组件与生产完全一致，只换数据源，因此界面、文案、布局都是真实的。
- 验收站可以在本地切换五种界面语言，才能拍出「法语界面 + 法语数据」的截图。

## 前置：演示站的两个改动

1. **补 SkillListCacheProvider**（`prodspec/source/shell/DemoShell.tsx`）。
   验收站原先缺少生产 `routes.tsx` 里的 `SkillListCacheProvider`，技能库页面会直接抛错；补上后与生产结构一致。

2. **演示数据多语言覆盖**（`prodspec/source/mock/data-i18n.ts` + `data-i18n/*.json`）。
   界面文案由 `src/locales/*` 提供，但 fixture 里的业务数据（门店名、知识条目、客户消息）是中文写死的；`localizeFixtureData()` 会在响应返回前按当前 `locale` 做一次字符串替换，让英文/日文/法文/西文截图里的演示数据也是对应语言。`data-i18n/*.json` 就是从英文界面里逆推出的中文数据清单及其四语译文。

3. **待审核列表补演示数据**（`prodspec/source/mock/fixtures-knowledge.ts` 的 `unauditedQASearch`）。
   该接口原返回 0 条（用于控制新手引导是否弹出），导致「知识优化」页截图是空态；改为返回 5 条演示数据后，采集脚本通过 `localStorage['marsmind.initialSetup.completed.v1'] = '1'` 关闭引导弹窗。

## 采集

```bash
# 1) 在 mmfrontend 仓库（或其副本）起验收站
npm install
npm run prodspec:dev            # http://127.0.0.1:8768

# 2) 采集（需要 playwright 与已缓存的 chromium）
node scripts/capture/capture-pages.mjs  /tmp/docs-shots          # 18 个整页 × 5 语言
node scripts/capture/capture-states.mjs /tmp/docs-shots-states   # 23 个交互状态 × 5 语言

# 3) 压缩并装配进仓库
python3 scripts/capture/assemble-images.py /tmp/docs-shots /tmp/docs-shots-states
```

采集脚本会：
- 通过界面上的账号菜单真实切换语言（不是改 localStorage）；
- 隐藏验收站自己的工具栏（`.prodspec-bar`），只保留产品界面；
- 每次导航带唯一查询参数强制整页加载，避免上一个状态残留的弹层遮罩挡住点击。

## 输出

- `images/<lang>/<page-dir>/NN-name.jpg`，1600px 宽、JPEG q84、渐进式（`assemble-images.py` 负责缩放与压缩）。
- 同一张截图可能被多页引用（例如业务表现整页同时用于「界面导览」和「快速上手」）。
