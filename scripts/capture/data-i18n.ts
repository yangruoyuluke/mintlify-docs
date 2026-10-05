/**
 * prodspec demo · 演示数据本地化
 *
 * 目的：文档站截图要按界面语言出图。界面文案由 src/locales/* 提供，
 * 而 fixture 里的**业务演示数据**（门店名、知识条目、客户消息…）是中文写死的，
 * 在英文/日文/法文/西文截图里会残留中文。这里按当前 locale 把 fixture 响应里的
 * 中文数据替换成对应语言的演示数据。
 *
 * 规则：
 *  1) 只处理「含中日韩统一表意文字」的字符串——ASCII 值（id、枚举、URL）原样保留；
 *  2) 先精确匹配，再按 key 长度从长到短做子串替换（覆盖「共 12 条」这类拼接串）；
 *  3) zh-CN 直接原样返回（中文即源语言）；
 *  4) 命中不到的一律原样返回——漏译的字符串只会保持中文，不会变成乱码。
 */
import en from './data-i18n/en.json'
import ja from './data-i18n/ja.json'
import fr from './data-i18n/fr.json'
import es from './data-i18n/es.json'

type Dict = Record<string, string>

const DICTS: Record<string, Dict> = {
  'zh-CN': {},
  en: en as Dict,
  ja: ja as Dict,
  fr: fr as Dict,
  es: es as Dict,
}

const CJK = /[㐀-鿿豈-﫿]/

const sortedKeysCache = new Map<string, string[]>()

function getSortedKeys(dict: Dict): string[] {
  const cacheKey = Object.keys(dict).length + ':' + (Object.keys(dict)[0] ?? '')
  let keys = sortedKeysCache.get(cacheKey)
  if (!keys) {
    keys = Object.keys(dict).sort((a, b) => b.length - a.length)
    sortedKeysCache.set(cacheKey, keys)
  }
  return keys
}

function currentDict(): Dict {
  let locale = 'zh-CN'
  try {
    locale = localStorage.getItem('locale') || 'zh-CN'
  } catch {
    /* 无痕模式等取不到就当中文 */
  }
  return DICTS[locale] ?? {}
}

function localizeString(value: string, dict: Dict, keys: string[]): string {
  if (!CJK.test(value)) return value
  const exact = dict[value]
  if (exact !== undefined) return exact
  let out = value
  for (const key of keys) {
    if (key.length === 0) continue
    if (out.includes(key)) out = out.split(key).join(dict[key])
  }
  return out
}

export function localizeFixtureData<T>(value: T): T {
  const dict = currentDict()
  if (Object.keys(dict).length === 0) return value
  const keys = getSortedKeys(dict)

  const walk = (node: unknown): unknown => {
    if (typeof node === 'string') return localizeString(node, dict, keys)
    if (Array.isArray(node)) return node.map(walk)
    if (node && typeof node === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        out[k] = walk(v)
      }
      return out
    }
    return node
  }

  return walk(value) as T
}
