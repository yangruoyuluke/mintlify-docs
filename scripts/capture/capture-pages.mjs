/**
 * MarsMind docs screenshot capture — prodspec demo rig.
 *
 * Runs against the local prodspec demo server (real production page components,
 * local fixtures, no production network). For each locale it switches the UI
 * language through the real account menu, then captures every admin page.
 *
 * Usage: node capture.mjs [outDir]
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'http://127.0.0.1:8768/#'
const OUT = process.argv[2] || '/home/paseo/workspace/docs-shots'
const ONLY_LOCALES = process.env.ONLY_LOCALES ? process.env.ONLY_LOCALES.split(',') : null

const LOCALES = [
  { id: 'zh-CN', label: '中文' },
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' },
  { id: 'fr', label: 'Français' },
  { id: 'es', label: 'Español' },
].filter((l) => !ONLY_LOCALES || ONLY_LOCALES.includes(l.id))

// The account-menu submenu trigger label in each locale's UI.
const LANG_MENU_LABEL = {
  'zh-CN': '语言',
  en: 'Language',
  ja: '言語',
  fr: 'Langue',
  es: 'Idioma',
}

const PAGES = [
  { id: 'dashboard', route: '/dashboard' },
  { id: 'ai-usage', route: '/ai-usage' },
  { id: 'data-export', route: '/data-export' },
  { id: 'mercado-review', route: '/mercado-review' },
  { id: 'ai-assistant-login', route: '/ai-assistant-login' },
  { id: 'persona', route: '/persona' },
  { id: 'relationship-management', route: '/relationship-management' },
  { id: 'persona-reply', route: '/persona-reply' },
  { id: 'ai-reply-guardrails', route: '/ai-reply-guardrails' },
  { id: 'lead-cleaning', route: '/lead-cleaning' },
  { id: 'service-time', route: '/service-time' },
  { id: 'knowledge-upload', route: '/knowledge-upload' },
  { id: 'knowledge-review', route: '/knowledge-review' },
  { id: 'knowledge-category-settings', route: '/knowledge-category-settings' },
  { id: 'skills-library', route: '/skills-library' },
  { id: 'personal-settings', route: '/personal-settings' },
  { id: 'password-settings', route: '/password-settings' },
  { id: 'auth-code-settings', route: '/auth-code-settings' },
]

const HIDE_DEMO_CHROME = `
  .prodspec-bar { display: none !important; }
`

async function switchLocale(page, localeId) {
  // Each context starts in zh-CN, so the account trigger aria-label is '账号设置'.
  await page.locator('button[aria-label="账号设置"]').click()
  await page.waitForTimeout(500)
  await page.locator('[role="menuitem"]', { hasText: LANG_MENU_LABEL['zh-CN'] }).first().hover()
  await page.waitForTimeout(500)
  const label = LOCALES.find((l) => l.id === localeId).label
  await page.locator('[role="menuitem"]', { hasText: label }).last().click()
  await page.waitForTimeout(1500)
}

const browser = await chromium.launch()
const report = []

for (const locale of LOCALES) {
  const dir = path.join(OUT, locale.id)
  fs.mkdirSync(dir, { recursive: true })
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
    locale: locale.id,
  })
  const page = await ctx.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') report.push({ locale: locale.id, consoleError: msg.text().slice(0, 200) })
  })

  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  if (locale.id !== 'zh-CN') {
    await switchLocale(page, locale.id)
  }

  for (const p of PAGES) {
    const url = BASE + p.route
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: HIDE_DEMO_CHROME })
    await page.waitForTimeout(2000)
    const file = path.join(dir, `${p.id}.png`)
    await page.screenshot({ path: file })
    const size = fs.statSync(file).size
    report.push({ locale: locale.id, page: p.id, bytes: size })
    process.stdout.write(`${locale.id} ${p.id} ${Math.round(size / 1024)}KB\n`)
  }

  // login page is standalone (no sidebar) — still capture it
  await ctx.close()
}

await browser.close()
fs.writeFileSync(path.join(OUT, 'capture-report.json'), JSON.stringify(report, null, 2))
console.log('done ->', OUT)
