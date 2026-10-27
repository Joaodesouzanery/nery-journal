// Descoberta de feeds: para cada fonte com URL (exceto dados abertos), busca a home e o robots.txt,
// procura <link rel=alternate> e candidatos comuns, e grava o resultado em nj_source_checks.
// Só SUGERE: grava nj_sources.feed_url quando acha um feed válido e o robots permite; nunca raspa páginas de matéria.
// Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Argumento opcional: id de uma fonte.
import { createClient } from '@supabase/supabase-js'
import { discoverFeeds, parseFeed, robotsAllows } from '../collectors/feeds.ts'

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const db = createClient(url, key, { auth: { persistSession: false } })
const UA = 'nery-journal-collector/0.1 (+https://github.com/Joaodesouzanery/nery-journal)'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(u) {
  try {
    const res = await fetch(u, { headers: { 'user-agent': UA, accept: '*/*' }, redirect: 'follow', signal: AbortSignal.timeout(15000) })
    return { status: res.status, text: res.ok ? await res.text() : '' }
  } catch (e) { return { status: 0, text: '', error: String(e) } }
}

const only = process.argv[2]
let q = db.from('nj_sources').select('id,url,kind').eq('active', true).not('url', 'is', null).neq('kind', 'dado_aberto')
if (only) q = q.eq('id', only)
const { data: sources, error } = await q
if (error) { console.error(error.message); process.exit(1) }

for (const s of sources) {
  const home = await get(s.url)
  await sleep(1000)
  const robots = await get(new URL('/robots.txt', s.url).toString())
  await sleep(1000)
  let feed = null
  if (home.status === 200) {
    const cands = [...discoverFeeds(home.text, s.url), ...['/feed', '/rss', '/feed.xml', '/rss.xml'].map((p) => new URL(p, s.url).toString())]
    for (const c of [...new Set(cands)].slice(0, 6)) {
      const r = await get(c)
      await sleep(1000)
      if (r.status === 200 && parseFeed(r.text).length > 0) { feed = c; break }
    }
  }
  const allows = robots.status === 200 ? robotsAllows(robots.text, feed ? new URL(feed).pathname : '/') : null
  const terms = /href=["']([^"']*(?:termos|terms|condicoes|conditions)[^"']*)["']/i.exec(home.text)?.[1]
  let termsUrl = null
  try { termsUrl = terms ? new URL(terms, s.url).toString() : null } catch { /* ignora */ }
  await db.from('nj_source_checks').insert({ source_id: s.id, home_status: home.status, robots_status: robots.status, robots_allows: allows, feed_url: feed, terms_url: termsUrl, note: home.error ?? null })
  if (feed && allows !== false) await db.from('nj_sources').update({ feed_url: feed, terms_url: termsUrl }).eq('id', s.id)
  console.log(`${feed ? 'FEED' : 'sem feed'}  ${s.id}  home=${home.status} robots=${robots.status}${allows === false ? ' (bloqueia)' : ''}  ${feed ?? ''}`)
}
