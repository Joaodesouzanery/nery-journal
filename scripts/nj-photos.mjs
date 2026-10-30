// Liga fotos reais de licença livre (CC0/domínio público, sem exigência de crédito) às matérias publicadas sem foto.
// Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Fonte: Wikimedia Commons. Nunca usa fotos dos veículos.
import { createClient } from '@supabase/supabase-js'
import { photoQueries, searchCommons, bestPhoto, matchEntity, isBrazilStory, isForeignPhoto, searchLogo, isSectorPhoto, isAbstractStory, topicGroup, photoInGroup, queriesFromTitle, siteLogo } from '../collectors/photos.ts'

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
let q = db.from('nj_articles').select('id,slug,category,title,photo_query,sources,entity_id').eq('status', 'publicado').is('photo_id', null).eq('is_placeholder', false).limit(60)
const { data: arts, error } = await q
if (error) { console.error(error.message); process.exit(1) }
const taken = new Set()
if (!refazer) for (const p of (await db.from('nj_photos').select('origin_url')).data ?? []) taken.add(p.origin_url)

let ok = 0
const { data: entsData } = await db.from('nj_entities').select('id,name,aliases,country,logo_url,site')
const ents = entsData ?? []
for (const a of arts ?? []) {
  let chosen = null
  const br = isBrazilStory(a.sources ?? [])
  const ent = (a.entity_id && ents.find((e) => e.id === a.entity_id)) || matchEntity(`${a.title} ${(a.sources ?? []).map((x) => x.name).join(' ')}`, ents)
  // 1) foto livre da própria entidade; 2) logo da entidade
  if (ent) {
    try {
      const found = isAbstractStory(a.title) ? [] : (await searchCommons(ent.name)).filter((p) => !taken.has(p.origin_url) && p.text.includes(ent.name.toLowerCase().split(' ')[0]) && isSectorPhoto(p))
      if (found.length) chosen = { ...found[0], q: ent.name, kind: 'photo' }
    } catch (e) { console.log(`  entidade "${ent.name}": ${e}`) }
    if (!chosen) {
      let logo = ent.logo_url ? { url: ent.logo_url, origin_url: ent.site ?? ent.logo_url, license: 'logo (uso editorial)' } : null
      if (!logo) { try { logo = await searchLogo(ent.name) } catch {} ; if (logo) await db.from('nj_entities').update({ logo_url: logo.url }).eq('id', ent.id) }
      if (logo) chosen = { ...logo, credit: ent.name, q: `logo ${ent.name}`, kind: 'logo' }
    }
  }
  // 3) foto do MESMO assunto (grupo) e com termos em comum; matéria brasileira não usa foto estrangeira. Sem tema genérico.
  const group = topicGroup(a.title, a.photo_query ?? '')
  const specific = [...new Set([...(a.photo_query ? [a.photo_query] : []), ...queriesFromTitle(a.title)])]
  const tiers = br ? [...specific.map((q) => `${q} Brazil`), ...specific] : specific
  if (!chosen && !isAbstractStory(a.title)) for (const q of tiers) {
    try {
      let found = (await searchCommons(q)).filter((p) => !taken.has(p.origin_url) && photoInGroup(p, group))
      if (br) found = found.filter((p) => !isForeignPhoto(p))
      const best = bestPhoto(q.replace(/ Brazil$/, ''), found)
      if (best) { chosen = { ...best, q, kind: 'photo' }; break }
    } catch (e) { console.log(`  busca "${q}": ${e}`) }
    await new Promise((r) => setTimeout(r, 1200))
  }
  // 4) sem foto fiel ao assunto: logo da entidade ou, na falta, logo do veículo/órgão citado como fonte (nunca foto aleatória)
  if (!chosen) {
    const srcUrl = (a.sources ?? [])[0]?.url
    let site = ent?.site
    if (!site && srcUrl) { try { site = new URL(srcUrl).origin } catch {} }
    const url = site ? await siteLogo(site) : null
    if (url) chosen = { url, origin_url: site, license: 'logo (uso editorial)', credit: ent?.name ?? (a.sources?.[0]?.name ?? ''), q: `logo ${site}`, kind: 'logo' }
  }
  if (!chosen) { console.log(`[SEM FOTO] ${a.slug}`); continue }
  const { data: ph, error: e1 } = await db.from('nj_photos').insert({ theme: chosen.q, url: chosen.url, origin_url: chosen.origin_url, license: chosen.license, credit: chosen.credit, has_people: false, has_logos: false, license_verified: true, kind: chosen.kind ?? 'photo' }).select('id').single()
  if (e1) { console.log(`[ERRO] ${a.slug}: ${e1.message}`); continue }
  await db.from('nj_articles').update({ photo_id: ph.id }).eq('id', a.id)
  taken.add(chosen.origin_url); ok++
  console.log(`[OK ] ${a.slug} <- ${chosen.license} · ${chosen.origin_url}`)
}
console.log(`${ok}/${(arts ?? []).length} matérias com foto`)
if (refazer && velhas.length) await db.from('nj_photos').delete().in('id', velhas)
