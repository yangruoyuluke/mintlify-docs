#!/usr/bin/env node
/**
 * 文档站一致性检查。
 *
 * 检查项：
 *  1. docs.json 合法，且引用的每个 mdx 文件都存在；
 *  2. 五种语言（cn/en/jp/fr/es）的页面集合完全一致（同一套 page key）；
 *  3. 每个 mdx 引用的 /images/... 图片都真实存在；
 *  4. 站内链接（/cn/guide/... 形式）都能解析到对应语言的页面；
 *  5. mdx 没有引用已废弃的旧路径（admin-backend / ai-assistant-guide / developer-docs / doc_management）；
 *  6. 每页 frontmatter 有 title 与 description。
 *
 * 用法：node scripts/checks/check-docs.mjs
 * 退出码：0 = 全部通过；1 = 有错误。
 */
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..')
const LANGS = ['cn', 'en', 'jp', 'fr', 'es']
const LEGACY = [/\/admin-backend\//, /\/ai-assistant-guide\//, /\/developer-docs\//, /doc_management/]

const errors = []
const warnings = []

function read(p) {
  return fs.readFileSync(p, 'utf8')
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

// 1) docs.json
const docsJsonPath = path.join(REPO, 'docs.json')
let docs
try {
  docs = JSON.parse(read(docsJsonPath))
} catch (error) {
  errors.push(`docs.json 解析失败：${error.message}`)
  docs = null
}

const navPages = new Map() // lang -> Set(page path without extension)
if (docs) {
  for (const lang of docs.navigation.languages) {
    const set = new Set()
    const collect = (pages) => {
      for (const item of pages) {
        if (typeof item === 'string') set.add(item)
        else if (item && Array.isArray(item.pages)) collect(item.pages)
      }
    }
    collect(lang.pages)
    navPages.set(lang.language, set)
    for (const p of set) {
      const file = path.join(REPO, `${p}.mdx`)
      if (!fs.existsSync(file)) errors.push(`docs.json 引用了不存在的页面：${p}`)
    }
  }
  const langs = [...navPages.keys()]
  const expected = langs.length ? [...navPages.values()][0] : null
  if (expected) {
    for (const lang of langs) {
      const set = navPages.get(lang)
      for (const p of expected) {
        const mirrored = p.replace(/^[a-z]{2}\//, `${lang}/`)
        if (!set.has(mirrored)) errors.push(`语言 ${lang} 缺少页面：${mirrored}`)
      }
    }
  }
}

// 2) 语言目录页面集合一致
const pageSets = new Map()
for (const lang of LANGS) {
  const dir = path.join(REPO, lang)
  const files = walk(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => path.relative(REPO, f).replace(/\.mdx$/, '').replace(new RegExp(`^${lang}/`), ''))
  pageSets.set(lang, new Set(files))
}
const reference = pageSets.get('cn')
for (const lang of LANGS) {
  const set = pageSets.get(lang)
  for (const p of reference) if (!set.has(p)) errors.push(`语言 ${lang} 缺少页面文件：${p}.mdx`)
  for (const p of set) if (!reference.has(p)) errors.push(`语言 ${lang} 多出页面：${p}.mdx`)
}

// 3) 图片与 frontmatter 检查
const allPages = new Map()
for (const lang of LANGS) {
  for (const rel of pageSets.get(lang)) allPages.set(`${lang}/${rel}`, path.join(REPO, lang, `${rel}.mdx`))
}

for (const [key, file] of allPages) {
  if (!fs.existsSync(file)) continue
  const text = read(file)

  for (const match of text.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g)) {
    const imagePath = path.join(REPO, match[1].replace(/^\//, ''))
    if (!fs.existsSync(imagePath)) errors.push(`${key}: 图片不存在 ${match[1]}`)
  }

  for (const match of text.matchAll(/\]\((\/[a-z]{2}\/[^)\s]+)\)/g)) {
    const target = match[1]
    const targetLang = target.split('/')[1]
    const pagePath = target.replace(/^\//, '').split('#')[0].split('?')[0]
    const file2 = path.join(REPO, `${pagePath}.mdx`)
    const anchorOnly = pagePath.split('/').length < 3
    if (anchorOnly) continue
    if (!fs.existsSync(file2)) errors.push(`${key}: 站内链接无法解析 ${target}（对应语言 ${targetLang}）`)
  }

  for (const pattern of LEGACY) {
    if (pattern.test(text)) errors.push(`${key}: 引用了已废弃的旧路径 ${pattern}`)
  }

  if (!/^---\n/.test(text)) errors.push(`${key}: 缺少 frontmatter`)
  else {
    const fm = text.slice(4, text.indexOf('\n---', 4))
    if (!/^title:/m.test(fm)) errors.push(`${key}: frontmatter 缺少 title`)
    if (!/^description:/m.test(fm)) errors.push(`${key}: frontmatter 缺少 description`)
  }

  const words = text.length
  if (words < 500) warnings.push(`${key}: 内容偏短（${words} 字符）`)
}

// 4) 未使用的图片
const usedImages = new Set()
for (const file of allPages.values()) {
  if (!fs.existsSync(file)) continue
  for (const match of read(file).matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g)) usedImages.add(match[1])
}
for (const file of walk(path.join(REPO, 'images'))) {
  const rel = '/' + path.relative(REPO, file)
  if (!usedImages.has(rel)) warnings.push(`图片未被引用：${rel}`)
}

console.log(`页面数：${LANGS.map((l) => `${l}=${pageSets.get(l).size}`).join(' ')}`)
console.log(`图片使用：${usedImages.size} 张`)
if (warnings.length) {
  console.log(`\n警告 ${warnings.length} 条：`)
  for (const w of warnings.slice(0, 40)) console.log('  -', w)
}
if (errors.length) {
  console.log(`\n错误 ${errors.length} 条：`)
  for (const e of errors.slice(0, 60)) console.log('  -', e)
  process.exit(1)
}
console.log('\n全部检查通过 ✅')
