// Coletor das agências reguladoras (GN Regulação): lê a página de notícias de cada fonte reg-* (coluna url)
// e grava título + link em nj_pauta_items (sector 'regulacao'). O texto completo vem depois pelo nj-texts.
import { createClient } from '@supabase/supabase-js'
import { robotsAllows } from '../collectors/feeds.ts'
import { parseAgencia } from '../collectors/agencias.ts'

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const db = createClient(url, key, { auth: { persistSession: false } })
const UA = 'nery-journal-collector/0.1 (+https://github.com/Joaodesouzanery/nery-journal)'

const { data: sources, error } = await db.from('nj_sources').select('id,url').eq('active', true).like('id', 'reg-%').not('url', 'is', null)
if (error) { console.error(error.message); process.exit(1) }

for (const s of sources) {
  try {
    const u = new URL(s.url)
    const rb = await fetch(new URL('/robots.txt', u), { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(10000) }).catch(() => null)
    if (rb?.ok && !robotsAllows(await rb.text(), u.pathname)) { console.log(`[PULA] ${s.id}: robots.txt bloqueia`); continue }
    const res = await fetch(u, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(25000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const items = parseAgencia(await res.text(), res.url || s.url).slice(0, 30).map((i) => ({
      source_id: s.id, external_id: i.link, kind: 'noticia', title: i.title, url: i.link, summary: null, published_at: null, payload: {}, sector: 'regulacao',
    }))
    if (items.length) {
      const { error: e } = await db.from('nj_pauta_items').upsert(items, { onConflict: 'source_id,external_id', ignoreDuplicates: true })
      if (e) throw new Error(e.message)
    }
    console.log(`[OK ] ${s.id}  ${items.length} itens`)
  } catch (e) { console.log(`[ERRO] ${s.id}  ${e}`) }
  await new Promise((r) => setTimeout(r, 1000))
}
process.exit(0)
