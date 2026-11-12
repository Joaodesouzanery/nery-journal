// Gera miniaturas (800 px) das fotos ainda não revisadas, para a conferência de olho no chat.
// Saída: review/<slug>.jpg + review/index.json (o workflow publica na branch nj-review).
import { createClient } from '@supabase/supabase-js'
import { mkdirSync, writeFileSync } from 'node:fs'
const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const db = createClient(url, key, { auth: { persistSession: false } })
let sharp = null
try { sharp = (await import('sharp')).default } catch { console.log('sharp indisponível: grava a imagem original') }
const { data, error } = await db.from('nj_articles')
  .select('slug,title,lede,category,uf,status,needs_photo,photo:nj_photos!inner(id,url,origin_url,theme,license,kind,approved)')
  .is('photo.approved', null).limit(80)
if (error) { console.error(error.message); process.exit(1) }
mkdirSync('review', { recursive: true })
const index = []
for (const a of data ?? []) {
  try {
    const r = await fetch(a.photo.url, { headers: { 'user-agent': 'NeryJournalBot/1.0' }, signal: AbortSignal.timeout(20000) })
    if (!r.ok) { index.push({ slug: a.slug, erro: `HTTP ${r.status}` }); continue }
    let buf = Buffer.from(await r.arrayBuffer())
    if (sharp) buf = await sharp(buf).resize({ width: 800, withoutEnlargement: true }).jpeg({ quality: 72 }).toBuffer()
    writeFileSync(`review/${a.slug}.jpg`, buf)
    index.push({ slug: a.slug, title: a.title, lede: a.lede, category: a.category, uf: a.uf, status: a.status, photo_id: a.photo.id, kind: a.photo.kind, theme: a.photo.theme, origin_url: a.photo.origin_url, arquivo: `${a.slug}.jpg` })
  } catch (e) { index.push({ slug: a.slug, erro: String(e) }) }
}
writeFileSync('review/index.json', JSON.stringify(index, null, 2))
console.log(`${index.length} miniaturas para revisar`)
