// Baixa o texto das páginas do radar para a tabela PRIVADA nj_source_texts (conferência interna de fatos/originalidade).
// Respeita robots.txt, 1 req/s por host, UA identificado; não contorna paywall, login nem bloqueio (403/429 = pula).
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { robotsAllows } from '../collectors/feeds.ts'
import { extractArticleText } from '../collectors/texts.ts'

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const db = createClient(url, key, { auth: { persistSession: false } })
const UA = 'nery-journal-collector/0.1 (+https://github.com/Joaodesouzanery/nery-journal)'
const LIMIT = Number(process.env.TEXTS_LIMIT || 60)

const { data: items } = await db.from('nj_pauta_items').select('id,url,title,source_id,published_at').eq('kind', 'noticia').not('url', 'is', null)
  .gte('published_at', new Date(Date.now() - 4 * 86400000).toISOString()).order('published_at', { ascending: false }).limit(400)
const { data: srcs } = await db.from('nj_sources').select('id,topic')
const topic = new Map((srcs ?? []).map((s) => [s.id, s.topic]))
const { data: done } = await db.from('nj_source_texts').select('url')
const have = new Set((done ?? []).map((d) => d.url))
// saneamento e fontes em português primeiro
const pt = (u) => /\.br\b|\.br\//.test(u)
const fila = (items ?? []).filter((i) => !have.has(i.url))
  .sort((a, b) => (topic.get(b.source_id) === 'saneamento') - (topic.get(a.source_id) === 'saneamento') || pt(b.url) - pt(a.url)).slice(0, LIMIT)

const robots = new Map()
const last = new Map()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let ok = 0
for (const it of fila) {
  const u = new URL(it.url)
  const row = { pauta_item_id: it.id, url: it.url }
  try {
    if (!robots.has(u.host)) {
      const rb = await fetch(new URL('/robots.txt', u), { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(10000) }).catch(() => null)
      robots.set(u.host, rb?.ok ? await rb.text() : '')
    }
    if (!robotsAllows(robots.get(u.host), u.pathname + u.search)) { await db.from('nj_source_texts').upsert({ ...row, status: 'bloqueado' }, { onConflict: 'url' }); console.log(`[ROBOTS] ${it.url}`); continue }
    const wait = 1100 - (Date.now() - (last.get(u.host) ?? 0)); if (wait > 0) await sleep(wait)
    last.set(u.host, Date.now())
    const res = await fetch(u, { headers: { 'user-agent': UA, accept: 'text/html' }, signal: AbortSignal.timeout(20000) })
    if (!res.ok) { await db.from('nj_source_texts').upsert({ ...row, status: 'erro', http_status: res.status }, { onConflict: 'url' }); console.log(`[HTTP ${res.status}] ${it.url}`); continue }
    const text = extractArticleText(await res.text())
    const status = text.length < 200 ? 'vazio' : 'ok'
    await db.from('nj_source_texts').upsert({ ...row, status, http_status: res.status, text, text_hash: createHash('sha1').update(text).digest('hex'), fetched_at: new Date().toISOString() }, { onConflict: 'url' })
    if (status === 'ok') ok++
    console.log(`[${status.toUpperCase()}] ${text.length} car. ${it.url}`)
  } catch (e) { console.log(`[ERRO] ${it.url}: ${e}`) }
}
console.log(`${ok}/${fila.length} textos guardados`)
