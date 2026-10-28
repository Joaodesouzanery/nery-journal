// Liga fotos reais de licença livre (CC0/domínio público, sem exigência de crédito) às matérias publicadas sem foto.
// Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Fonte: Wikimedia Commons. Nunca usa fotos dos veículos.
import { createClient } from '@supabase/supabase-js'
import { photoQueries, searchCommons, bestPhoto } from '../collectors/photos.ts'

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const db = createClient(url, key, { auth: { persistSession: false } })

import { readFileSync } from 'node:fs'
// "refazer" em .github/triggers/photos: troca as fotos de todas as matérias publicadas (ex.: depois de endurecer o filtro).
let gatilho = ''
try { gatilho = readFileSync(new URL('../.github/triggers/photos', import.meta.url), 'utf8') } catch {}
const refazer = /refazer/.test(gatilho)
let velhas = []
if (refazer) {
  const { data: cur } = await db.from('nj_articles').select('photo_id').eq('status', 'publicado').not('photo_id', 'is', null)
  velhas = (cur ?? []).map((x) => x.photo_id)
  await db.from('nj_articles').update({ photo_id: null }).eq('status', 'publicado')
}
let q = db.from('nj_articles').select('id,slug,category,title,photo_query').eq('status', 'publicado').is('photo_id', null).eq('is_placeholder', false).limit(60)
const { data: arts, error } = await q
if (error) { console.error(error.message); process.exit(1) }
const taken = new Set()
if (!refazer) for (const p of (await db.from('nj_photos').select('origin_url')).data ?? []) taken.add(p.origin_url)

let ok = 0
for (const a of arts ?? []) {
  let chosen = null
  const qs = photoQueries(a.category, a.photo_query, a.title)
  // Correlação: as consultas específicas exigem termo em comum com a foto; só a última (genérica do tema) aceita qualquer uma.
  for (const [i, q] of qs.entries()) {
    try {
      const found = (await searchCommons(q)).filter((p) => !taken.has(p.origin_url))
      const last = i === qs.length - 1
      const best = bestPhoto(q, found, last ? 0 : 1)
      if (best) { chosen = { ...best, q }; break }
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
if (refazer && velhas.length) await db.from('nj_photos').delete().in('id', velhas)
