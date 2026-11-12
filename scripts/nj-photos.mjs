// Liga fotos reais de licença livre (CC0/domínio público, sem exigência de crédito) às matérias publicadas sem foto.
// Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Fonte: Wikimedia Commons. Nunca usa fotos dos veículos.
import { createClient } from '@supabase/supabase-js'
import { photoQueries, searchCommons, bestPhoto, matchEntity, isBrazilStory, isForeignPhoto, searchLogo, isSectorPhoto, isAbstractStory, topicGroup, photoInGroup, queriesFromTitle, siteLogo, searchPexels, groupQueries, placeMismatch, newsQueries, imageLoads, searchOpenverse, searchPixabay, entityOgImage } from '../collectors/photos.ts'

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
  await db.from('nj_articles').update({ status: 'em_revisao', needs_photo: true, photo_id: null }).eq('status', 'publicado')
}
const taken = new Set()
// Bloqueio por SÉRIE (mesma foto com outro número: ..._08.jpg, ..._15.jpg) e por padrões já reprovados na revisão de olho.
const stem = (u) => { try { u = decodeURIComponent(u) } catch {} ; return u.toLowerCase().replace(/[_\s-]*\(?\d{1,3}\)?(\.\w+)$/, '$1') }
const BAD = /hot-mix_asphalt|dirty_jobs|haberkorn|acidente|bulacan|flag_of|bandeira_do_brasil|rikers|zoo/i
const stems = new Set()
const _add = taken.add.bind(taken), _has = taken.has.bind(taken)
taken.add = (u) => { stems.add(stem(u)); return _add(u) }
taken.has = (u) => _has(u) || stems.has(stem(u)) || BAD.test(u)
// Fotos rejeitadas (botão "imagem não combina" em /social): nunca mais usadas; a matéria volta para a fila.
for (const b of (await db.from('nj_photo_blocklist').select('origin_url')).data ?? []) taken.add(b.origin_url)
{
  const { data: bad } = await db.from('nj_feedback').select('id,article_slug').eq('message', 'imagem_ruim').limit(50)
  for (const f of bad ?? []) {
    const { data: art } = await db.from('nj_articles').select('id,photo_id').eq('slug', f.article_slug).maybeSingle()
    if (art?.photo_id) {
      const { data: ph } = await db.from('nj_photos').select('origin_url').eq('id', art.photo_id).maybeSingle()
      if (ph?.origin_url) await db.from('nj_photo_blocklist').upsert({ origin_url: ph.origin_url, reason: 'imagem_ruim' }, { onConflict: 'origin_url' })
      await db.from('nj_articles').update({ status: 'em_revisao', needs_photo: true, photo_id: null }).eq('id', art.id)
      if (ph?.origin_url) taken.add(ph.origin_url)
    }
    await db.from('nj_feedback').update({ message: 'imagem_ruim_tratada' }).eq('id', f.id)
  }
}
// Nunca repetir foto em 30 dias: URLs já ligadas a matérias recentes ficam bloqueadas mesmo no "refazer".
{
  // histórico de fotos dos últimos 30 dias (inclusive as que foram desligadas no "refazer"): nunca reaproveitar
  const since = new Date(Date.now() - 30 * 864e5).toISOString()
  const { data: rec } = await db.from('nj_photos').select('origin_url').gte('created_at', since)
  for (const r of rec ?? []) taken.add(r.origin_url)
}
// Fila: publicadas sem foto + matérias retiradas do ar à espera de foto (needs_photo). Ao achar foto, voltam a publicado.
let q = db.from('nj_articles').select('id,slug,category,title,photo_query,sources,entity_id,needs_photo').is('photo_id', null).eq('is_placeholder', false).or('status.eq.publicado,needs_photo.eq.true').limit(60)
const { data: arts, error } = await q
if (error) { console.error(error.message); process.exit(1) }
if (!refazer) for (const p of (await db.from('nj_photos').select('origin_url')).data ?? []) taken.add(p.origin_url)

let ok = 0
const PEXELS = process.env.PEXELS_API_KEY
const PIXABAY = process.env.PIXABAY_API_KEY
const { data: entsData } = await db.from('nj_entities').select('id,name,aliases,country,logo_url,site')
const ents = entsData ?? []
for (const a of arts ?? []) {
  let chosen = null
  const br = isBrazilStory(a.sources ?? [])
  const ent = (a.entity_id && ents.find((e) => e.id === a.entity_id)) || matchEntity(a.title, ents)
  // 1) foto livre da própria entidade; 2) logo da entidade
  if (ent) {
    try {
      const found = (isAbstractStory(a.title) || ent.name.length <= 4) ? [] : (await searchCommons(ent.name)).filter((p) => !taken.has(p.origin_url) && new RegExp(`\\b${ent.name.split(' ')[0].toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(p.text) && isSectorPhoto(p))
      if (found.length) chosen = { ...found[0], q: ent.name, kind: 'photo' }
    } catch (e) { console.log(`  entidade "${ent.name}": ${e}`) }
  }
  // 1b) foto de destaque do site oficial da entidade (CAESB -> foto da CAESB)
  if (!chosen && ent?.site && !isAbstractStory(a.title)) {
    const og = await entityOgImage(ent.site)
    if (og && !taken.has(og)) chosen = { url: og, origin_url: og, license: 'uso editorial', credit: ent.name, q: `site ${ent.name}`, kind: 'photo', text: ent.name }
  }
  // 2a) Openverse (CC0/domínio público): consultas da notícia (entidade + objeto, objeto + lugar)
  {
    const g0 = topicGroup(a.title, a.photo_query ?? '')
    if (!chosen && !isAbstractStory(a.title)) for (const q of newsQueries(a.title, a.photo_query, ent?.name ?? null)) {
      try {
        const found = (await searchOpenverse(q)).filter((p) => !taken.has(p.origin_url) && photoInGroup(p, g0) && !placeMismatch(a.title, p, br))
        if (found.length) { chosen = { ...found[0], q, kind: 'photo' }; break }
      } catch (e) { console.log(`  openverse "${q}": ${e}`) }
      await new Promise((r) => setTimeout(r, 800))
    }
  }
  // 2b) Pexels (se houver chave): foto bonita e bem ranqueada para a consulta específica, sem pessoas; alt não pode ser de outro assunto
  const grp = topicGroup(a.title, a.photo_query ?? '')
  // consultas montadas a partir da notícia: entidade + objeto, objeto + lugar, objeto
  const spec = newsQueries(a.title, a.photo_query, ent?.name ?? null)
  if (!chosen && PEXELS && !isAbstractStory(a.title)) for (const q of spec) {
    try {
      const found = (await searchPexels(q, PEXELS)).filter((p) => !taken.has(p.origin_url) && (!p.text || photoInGroup({ text: p.text }, grp)) && !placeMismatch(a.title, p, br))
      if (found.length) { chosen = { ...found[0], q, kind: 'photo' }; break }
    } catch (e) { console.log(`  pexels "${q}": ${e}`) }
    await new Promise((r) => setTimeout(r, 600))
  }
  // 3) foto do MESMO assunto (grupo) e com termos em comum; matéria brasileira não usa foto estrangeira. Sem tema genérico.
  const group = topicGroup(a.title, a.photo_query ?? '')
  const specific = newsQueries(a.title, a.photo_query, null)
  const tiers = br ? [...specific.map((q) => `${q} Brazil`), ...specific] : specific
  if (!chosen && !isAbstractStory(a.title)) for (const q of tiers) {
    try {
      let found = (await searchCommons(q)).filter((p) => !taken.has(p.origin_url) && photoInGroup(p, group) && !placeMismatch(a.title, p, br))
      if (br) found = found.filter((p) => !isForeignPhoto(p))
      const best = bestPhoto(q.replace(/ Brazil$/, ''), found)
      if (best) { chosen = { ...best, q, kind: 'photo' }; break }
    } catch (e) { console.log(`  busca "${q}": ${e}`) }
    await new Promise((r) => setTimeout(r, 1200))
  }
  // 3a) Pixabay (se houver chave)
  if (!chosen && PIXABAY && !isAbstractStory(a.title)) for (const q of specific) {
    try {
      const found = (await searchPixabay(q, PIXABAY)).filter((p) => !taken.has(p.origin_url) && photoInGroup(p, group) && !placeMismatch(a.title, p, br))
      if (found.length) { chosen = { ...found[0], q, kind: 'photo' }; break }
    } catch (e) { console.log(`  pixabay "${q}": ${e}`) }
  }
  // 3b) foto genérica do MESMO assunto (grupo), sem mínimo de termos; primeiro as ainda não usadas, depois (último recurso) qualquer uma
  // Openverse genérico do grupo
  if (!chosen) for (const q of groupQueries(group)) {
    try {
      const found = (await searchOpenverse(q)).filter((p) => !taken.has(p.origin_url) && photoInGroup(p, group) && !placeMismatch(a.title, p, br))
      const pick = found[Math.floor(Math.random() * Math.min(found.length, 5))]
      if (pick) { chosen = { ...pick, q, kind: 'photo' }; break }
    } catch (e) { console.log(`  openverse grupo "${q}": ${e}`) }
    await new Promise((r) => setTimeout(r, 800))
  }
  // Pexels genérico do grupo; depois Commons. Nunca repete foto (sem foto, a matéria fica escondida).
  if (!chosen && PEXELS) for (const q of groupQueries(group)) {
    try {
      const found = (await searchPexels(q, PEXELS)).filter((p) => !taken.has(p.origin_url) && !placeMismatch(a.title, p, br))
      const pick = found[Math.floor(Math.random() * Math.min(found.length, 5))]
      if (pick) { chosen = { ...pick, q, kind: 'photo' }; break }
    } catch (e) { console.log(`  pexels grupo "${q}": ${e}`) }
    await new Promise((r) => setTimeout(r, 600))
  }
  {
    for (const q of groupQueries(group)) {
      if (chosen) break
      try {
        let found = (await searchCommons(q)).filter((p) => !taken.has(p.origin_url) && photoInGroup(p, group) && !placeMismatch(a.title, p, br))
        if (br) found = found.filter((p) => !isForeignPhoto(p))
        const pick = found[Math.floor(Math.random() * Math.min(found.length, 4))]
        if (pick) { chosen = { ...pick, q, kind: 'photo' }; break }
      } catch (e) { console.log(`  grupo "${q}": ${e}`) }
      await new Promise((r) => setTimeout(r, 1000))
    }
  }
  // 4) logo SÓ quando a matéria é sobre a entidade e nada de foto serviu (nunca logo do veículo)
  if (!chosen && ent) {
    let logo = ent.logo_url ? { url: ent.logo_url, origin_url: ent.site ?? ent.logo_url, license: 'logo (uso editorial)' } : null
    if (!logo) { try { logo = await searchLogo(ent.name) } catch {} ; if (logo) await db.from('nj_entities').update({ logo_url: logo.url }).eq('id', ent.id) }
    if (!logo && ent.site) { const u = await siteLogo(ent.site); if (u) logo = { url: u, origin_url: ent.site, license: 'logo (uso editorial)' } }
    if (logo && taken.has(logo.origin_url)) logo = null
    if (logo) chosen = { ...logo, credit: ent.name, q: `logo ${ent.name}`, kind: 'logo' }
  }
  if (chosen && !(await imageLoads(chosen.url))) { console.log(`  imagem não abre: ${chosen.url}`); taken.add(chosen.origin_url); chosen = null }
  if (!chosen) {
    console.log(`[SEM FOTO] ${a.slug}`)
    // nunca publicada sem imagem: sai do ar até ganhar foto
    await db.from('nj_articles').update({ status: 'em_revisao', needs_photo: true }).eq('id', a.id).eq('status', 'publicado')
    continue
  }
  const { data: ph, error: e1 } = await db.from('nj_photos').insert({ theme: chosen.q, url: chosen.url, origin_url: chosen.origin_url, license: chosen.license, credit: chosen.credit, has_people: false, has_logos: false, license_verified: true, kind: chosen.kind ?? 'photo', description: (chosen.text ?? '').slice(0, 400) }).select('id').single()
  if (e1) { console.log(`[ERRO] ${a.slug}: ${e1.message}`); continue }
  await db.from('nj_articles').update(a.needs_photo ? { photo_id: ph.id, status: 'publicado', needs_photo: false } : { photo_id: ph.id }).eq('id', a.id)
  taken.add(chosen.origin_url); ok++
  console.log(`[OK ] ${a.slug} <- ${chosen.license} · ${chosen.origin_url}`)
}
console.log(`${ok}/${(arts ?? []).length} matérias com foto`)
// fotos antigas ficam guardadas: servem de histórico para não repetir em 30 dias
