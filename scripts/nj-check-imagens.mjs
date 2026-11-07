// Trava final: nenhuma matéria publicada fica sem imagem que ABRA de verdade e que não se repita.
// Sem foto, foto que não carrega ou foto repetida: a matéria sai do ar (em_revisao + needs_photo) e o job de fotos busca outra.
import { createClient } from '@supabase/supabase-js'
import { imageLoads } from '../collectors/photos.ts'
const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const db = createClient(url, key, { auth: { persistSession: false } })
const { data, error } = await db.from('nj_articles').select('id,slug,published_at,photo:nj_photos(id,url,origin_url)').eq('status', 'publicado').eq('is_placeholder', false).order('published_at', { ascending: false })
if (error) { console.error(error.message); process.exit(1) }
const seen = new Set()
let bad = 0
for (const a of data ?? []) {
  let motivo = null
  if (!a.photo?.url) motivo = 'sem imagem'
  else if (seen.has(a.photo.origin_url)) motivo = 'imagem repetida'
  else if (!(await imageLoads(a.photo.url))) motivo = 'imagem não abre'
  if (a.photo?.origin_url) seen.add(a.photo.origin_url)
  if (!motivo) continue
  bad++
  console.log(`[${motivo.toUpperCase()}] ${a.slug} -> retirada do ar até ganhar foto`)
  if (a.photo?.origin_url && motivo !== 'sem imagem') await db.from('nj_photo_blocklist').upsert({ origin_url: a.photo.origin_url, reason: motivo }, { onConflict: 'origin_url' })
  await db.from('nj_articles').update({ status: 'em_revisao', needs_photo: true, photo_id: null }).eq('id', a.id)
}
console.log(`${bad} matérias retiradas por imagem; ${(data ?? []).length - bad} no ar com imagem válida`)
process.exit(bad ? 1 : 0)
