/**
 * MarsMind docs — interaction-state screenshots (5 locales).
 *
 * Selectors come from action-labels.json (extracted from the product locale
 * files), so every click targets a real localized label rather than a position.
 *
 * Usage: node capture-states.mjs [outDir]
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const BASE = 'http://127.0.0.1:8768/#'
const OUT = process.argv[2] || '/home/paseo/workspace/docs-shots-v2-states'
const ONLY_LOCALES = process.env.ONLY_LOCALES ? process.env.ONLY_LOCALES.split(',') : null
const LABELS = JSON.parse(fs.readFileSync(path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'action-labels.json'), 'utf8'))

const LOCALES = [
  { id: 'zh-CN', label: '中文' },
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' },
  { id: 'fr', label: 'Français' },
  { id: 'es', label: 'Español' },
].filter((l) => !ONLY_LOCALES || ONLY_LOCALES.includes(l.id))

const HIDE = '.prodspec-bar{display:none !important}'

async function settle(page, ms = 1200) {
  await page.waitForTimeout(ms)
}

async function switchLocale(page, label) {
  await page.locator('button[aria-label="账号设置"]').click()
  await settle(page, 500)
  await page.locator('[role="menuitem"]', { hasText: '语言' }).first().hover()
  await settle(page, 500)
  await page.locator('[role="menuitem"]', { hasText: label }).last().click()
  await settle(page, 1500)
  await page.keyboard.press('Escape')
  await settle(page, 300)
}

function buildStates(L) {
  const byName = (name) => (page) => page.getByRole('button', { name }).first()
  return [
    {
      name: 'interface-account-menu',
      route: '/dashboard',
      selector: `button[aria-label="${L.accountTrigger}"]`,
      click: (page) => page.locator(`button[aria-label="${L.accountTrigger}"]`).click(),
    },
    {
      name: 'interface-window-switcher',
      route: '/dashboard',
      click: (page) => page.locator(`button[aria-label="${L.statsWindow}"], button[aria-label="${L.currentWindow}"]`).first().click(),
    },
    {
      name: 'interface-help-center',
      route: '/dashboard',
      click: (page) => page.locator(`header button[aria-label="${L.helpButton}"]`).click(),
    },
    {
      name: 'interface-chat-drawer',
      route: '/dashboard',
      click: (page) => page.locator(`header button[aria-label="${L.chatButton}"]`).click(),
      after: 2000,
    },
    { name: 'dashboard-glossary', route: '/dashboard', click: (page) => byName(L.glossary)(page).click() },
    { name: 'dashboard-heatmap', route: '/dashboard', scrollBottom: true },
    { name: 'ai-usage-month', route: '/ai-usage', click: (page) => page.locator('main tbody button[aria-label], main tbody button').first().click() },
    { name: 'data-export-drilldown', route: '/data-export', click: (page) => page.locator('main tbody button').first().click() },
    { name: 'data-export-agent-tab', route: '/data-export', click: (page) => page.getByRole('tab', { name: L.tabAgent }).first().click().catch(() => page.getByText(L.tabAgent, { exact: true }).first().click()) },
    { name: 'login-online-create', route: '/ai-assistant-login', click: (page) => byName(L.createWindow)(page).click() },
    {
      name: 'login-online-channel',
      route: '/ai-assistant-login',
      click: async (page) => {
        await byName(L.createWindow)(page).click()
        await settle(page, 1200)
        await page.locator('[role="dialog"] button').nth(1).click()
      },
    },
    { name: 'persona-contexts', route: '/persona', click: (page) => page.locator('button', { hasText: L.contexts }).first().click() },
    { name: 'relationship-edit', route: '/relationship-management', click: (page) => page.locator('main tbody button[aria-label]').first().click() },
    { name: 'reply-rules-keyword', route: '/persona-reply', scrollBottom: true },
    { name: 'guardrails-add', route: '/ai-reply-guardrails', click: (page) => byName(L.addRule)(page).click() },
    { name: 'lead-cleaning-add', route: '/lead-cleaning', click: (page) => byName(L.addItem)(page).click() },
    { name: 'service-time-add', route: '/service-time', click: (page) => byName(L.addTimeSlot)(page).click() },
    { name: 'knowledge-upload-web', route: '/knowledge-upload', click: (page) => page.getByText(L.webCard, { exact: true }).first().click() },
    { name: 'knowledge-upload-manual', route: '/knowledge-upload', click: (page) => page.getByText(L.manualCard, { exact: true }).first().click() },
    { name: 'knowledge-upload-history', route: '/knowledge-upload', click: (page) => byName(L.history)(page).click() },
    { name: 'knowledge-review-edit', route: '/knowledge-review', click: (page) => page.locator('main [role="button"]').filter({ hasText: /[\s\S]{40,}/ }).first().click() },
    { name: 'knowledge-management-recycle', route: '/knowledge-category-settings', click: (page) => byName(L.recycleBin)(page).click() },
    { name: 'skills-add', route: '/skills-library', click: (page) => byName(L.addSkill)(page).click() },
  ]
}

const report = []

for (const locale of LOCALES) {
  const dir = path.join(OUT, locale.id)
  fs.mkdirSync(dir, { recursive: true })
  // 每个语言重启一次浏览器：本机内存吃紧时，长跑单个浏览器容易 OOM 被杀
  const browser = await chromium.launch({ args: ['--disable-dev-shm-usage'] })
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    locale: locale.id,
  })
  const page = await ctx.newPage()
  // 关闭「初始化配置向导」的自动弹出，保证截到的是页面本身
  await page.addInitScript(() => {
    try { localStorage.setItem('marsmind.initialSetup.completed.v1', '1') } catch {}
  })
  page.setDefaultTimeout(12000)
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' })
  await settle(page, 2500)
  if (locale.id !== 'zh-CN') await switchLocale(page, locale.label)

  const states = buildStates(LABELS[locale.id])
  let index = 0
  for (const state of states) {
    try {
      index += 1
      // 每次带唯一查询参数 → 强制整页加载，避免上一个状态残留的弹层遮罩挡住后续点击
      await page.goto(`http://127.0.0.1:8768/?s=${index}#${state.route}`, { waitUntil: 'networkidle' })
      await page.addStyleTag({ content: HIDE })
      await settle(page, 2500)
      if (state.scrollBottom) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await settle(page, 1500)
      }
      if (state.click) {
        await state.click(page)
        await settle(page, state.after || 1400)
      }
      const file = path.join(dir, `${state.name}.png`)
      await page.screenshot({ path: file })
      const size = fs.statSync(file).size
      report.push({ locale: locale.id, state: state.name, bytes: size })
      process.stdout.write(`${locale.id} ${state.name} ${Math.round(size / 1024)}KB\n`)
    } catch (error) {
      report.push({ locale: locale.id, state: state.name, error: String(error).slice(0, 200) })
      process.stdout.write(`${locale.id} !! ${state.name}: ${String(error).slice(0, 120)}\n`)
    }
  }
  await ctx.close()
  await browser.close()
}

fs.writeFileSync(path.join(OUT, 'states-report.json'), JSON.stringify(report, null, 2))
console.log('done ->', OUT)
