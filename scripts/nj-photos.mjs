// Liga fotos reais de licença livre (CC0/domínio público, sem exigência de crédito) às matérias publicadas sem foto.
// Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Fonte: Wikimedia Commons. Nunca usa fotos dos veículos.
import { createClient } from '@supabase/supabase-js'
import { photoQueries, searchCommons } from '../collectors/photos.ts'

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const db = createClient(url, key, { auth: { persistSession: false } })

const { data: arts, error } = await db.from('nj_articles').select('id,slug,category,photo_query').eq('status', 'publicado').is('photo_id', null).eq('is_placeholder', false).limit(40)
if (error) { console.error(error.message); process.exit(1) }
const { data: used } = await db.from('nj_photos').select('origin_url')
const taken = new Set((used ?? []).map((p) => p.origin_url))

let ok = 0
for (const a of arts ?? []) {
  let chosen = null
  for (const q of photoQueries(a.category, a.photo_query)) {
    try {
      const found = (await searchCommons(q)).filter((p) => !taken.has(p.origin_url))
      if (found.length) { chosen = { ...found[Math.floor(Math.random() * Math.min(found.length, 5))], q }; break }
    } catch (e) { console.log(`  busca "${q}": ${e}`) }
    await new Promise((r) => setTimeout(r, 1200))
  }
  if (!chosen) { console.log(`[SEM FOTO] ${a.slug}`); continue }
  const { data: ph, error: e1 } = await db.from('nj_photos').insert({ theme: chosen.q, url: chosen.url, origin_url: chosen.origin_url, license: chosen.license, credit: chosen.credit, has_people: false, has_logos: false, license_verified: true }).select('id').single()
  if (e1) { console.log(`[ERRO] ${a.slug}: ${e1.message}`); continue }
  await db.from('nj_articles').update({ photo_id: ph.id }).eq('id', a.id)
  taken.add(chosen.origin_url); ok++
  console.log(`[OK ] ${a.slug} <- ${chosen.license} · ${chosen.origin_url}`)
}
console.log(`${ok}/${(arts ?? []).length} matérias com foto`)
