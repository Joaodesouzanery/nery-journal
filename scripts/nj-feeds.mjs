// Lê os feeds RSS/Atom das fontes com feed_url e grava manchete + link + trecho curto em nj_pauta_items (kind 'noticia').
// Radar de pauta: o texto da matéria nunca é guardado. Respeita robots.txt. Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import { createClient } from '@supabase/supabase-js'
import { parseItems, robotsAllows } from '../collectors/feeds.ts'

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const db = createClient(url, key, { auth: { persistSession: false } })
const UA = 'nery-journal-collector/0.1 (+https://github.com/Joaodesouzanery/nery-journal)'

const { data: sources, error } = await db.from('nj_sources').select('id,feed_url').eq('active', true).not('feed_url', 'is', null)
if (error) { console.error(error.message); process.exit(1) }

let failed = 0
for (const s of sources) {
  try {
    const u = new URL(s.feed_url)
    const rb = await fetch(new URL('/robots.txt', u), { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(10000) }).catch(() => null)
    if (rb?.ok && !robotsAllows(await rb.text(), u.pathname)) { console.log(`[PULA] ${s.id}: robots.txt bloqueia`); continue }
    const res = await fetch(u, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const items = parseItems(await res.text()).slice(0, 30).map((i) => ({
      source_id: s.id, external_id: i.link, kind: 'noticia', title: i.title, url: i.link, summary: i.snippet, published_at: i.published_at, payload: {},
    }))
    if (items.length) {
      const { error: e } = await db.from('nj_pauta_items').upsert(items, { onConflict: 'source_id,external_id', ignoreDuplicates: true })
      if (e) throw new Error(e.message)
    }
    console.log(`[OK ] ${s.id}  ${items.length} itens`)
  } catch (e) { failed++; console.log(`[ERRO] ${s.id}  ${e}`) }
  await new Promise((r) => setTimeout(r, 1000))
}
process.exit(0) // erro em uma fonte não derruba o job
