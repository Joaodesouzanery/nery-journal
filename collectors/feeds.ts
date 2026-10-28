// Descoberta e leitura de feeds RSS/Atom. Guardamos só título, link, data e um trecho curto (≤ 200 caracteres):
// nunca o texto da matéria de terceiros. Funções puras, testadas com XML sintético.
import { XMLParser } from 'fast-xml-parser'

export interface FeedItem { title: string; link: string; published_at: string | null; snippet: string | null }

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '#text', processEntities: true })

const arr = <T>(v: T | T[] | undefined): T[] => (v == null ? [] : Array.isArray(v) ? v : [v])
const text = (v: unknown): string => {
  if (v == null) return ''
  if (typeof v === 'object') return text((v as Record<string, unknown>)['#text'])
  return String(v)
}
const stripHtml = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
const iso = (s: string): string | null => { const t = Date.parse(s); return Number.isNaN(t) ? null : new Date(t).toISOString() }

export function parseFeed(xml: string): FeedItem[] {
  // HTML e outros formatos não são feed: devolve vazio em vez de lançar (o parser estoura em páginas com muitas tags aninhadas).
  if (!/<(rss|feed|rdf:RDF)\b/i.test(xml.slice(0, 2000)) || xml.length > 5_000_000) return []
  let doc: Record<string, any>
  try { doc = parser.parse(xml) as Record<string, any> } catch { return [] }
  const out: FeedItem[] = []
  for (const it of arr(doc?.rss?.channel?.item)) {
    const link = text(it.link).trim()
    const title = stripHtml(text(it.title))
    if (!link || !title) continue
    const snip = stripHtml(text(it.description)).slice(0, 200)
    out.push({ title, link, published_at: iso(text(it.pubDate) || text(it['dc:date'])), snippet: snip || null })
  }
  for (const e of arr(doc?.feed?.entry)) {
    const links = arr(e.link) as any[]
    const l = links.find((x) => !x['@_rel'] || x['@_rel'] === 'alternate') ?? links[0]
    const link = String(l?.['@_href'] ?? '').trim()
    const title = stripHtml(text(e.title))
    if (!link || !title) continue
    const snip = stripHtml(text(e.summary)).slice(0, 200)
    out.push({ title, link, published_at: iso(text(e.published) || text(e.updated)), snippet: snip || null })
  }
  return out
}

/** Endereços de feed anunciados no <head> (rel=alternate rss/atom), absolutizados. */
export function discoverFeeds(html: string, baseUrl: string): string[] {
  const found = new Set<string>()
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    if (!/rel=["']?alternate/i.test(tag) || !/type=["']?application\/(rss|atom)\+xml/i.test(tag)) continue
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1]
    if (!href) continue
    try { found.add(new URL(href, baseUrl).toString()) } catch { /* href inválido */ }
  }
  return [...found]
}

/** robots.txt simplificado: vale o grupo do nosso agente ou, na falta dele, o grupo "*". */
export function robotsAllows(robots: string, path: string, agent = 'nery-journal-collector'): boolean {
  const groups: { agents: string[]; rules: { allow: boolean; p: string }[] }[] = []
  let cur: (typeof groups)[number] | null = null
  let lastWasAgent = false
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim()
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line)
    if (!m) continue
    const k = m[1].toLowerCase(), v = m[2].trim()
    if (k === 'user-agent') {
      if (!cur || !lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur) }
      cur.agents.push(v.toLowerCase()); lastWasAgent = true
    } else if (cur && (k === 'allow' || k === 'disallow')) {
      lastWasAgent = false
      if (v) cur.rules.push({ allow: k === 'allow', p: v })
    } else lastWasAgent = false
  }
  const a = agent.toLowerCase()
  const g = groups.find((x) => x.agents.some((n) => n !== '*' && a.includes(n))) ?? groups.find((x) => x.agents.includes('*'))
  if (!g) return true
  // Casamento por padrão (RFC 9309): "*" = qualquer sequência, "$" no fim = fim do caminho; a regra mais longa vence e, em empate, Allow.
  let best: { allow: boolean; len: number } | null = null
  for (const r of g.rules) {
    const anchored = r.p.endsWith('$')
    const src = (anchored ? r.p.slice(0, -1) : r.p).split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')
    if (!new RegExp('^' + src + (anchored ? '$' : '')).test(path)) continue
    if (!best || r.p.length > best.len || (r.p.length === best.len && r.allow)) best = { allow: r.allow, len: r.p.length }
  }
  return best ? best.allow : true
}
