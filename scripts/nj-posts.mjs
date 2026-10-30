// Baixa os cards do carrossel das matérias marcadas em social_at (últimos 3 dias) e salva em social/<slug>/NN-nome.png.
// Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SITE_URL (padrão: site de produção).
import { createClient } from '@supabase/supabase-js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { slidesFrom } from '../lib/social.ts'

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
const SITE = (process.env.SITE_URL || 'https://nery-journal-joaodesouzanerys-projects.vercel.app').replace(/\/$/, '')
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const db = createClient(url, key, { auth: { persistSession: false } })
const { data } = await db.from('nj_articles').select('slug,title,body_md,social_at').not('social_at', 'is', null).gte('social_at', new Date(Date.now() - 3 * 86400000).toISOString()).order('social_at', { ascending: false }).limit(14)
let n = 0
for (const a of data ?? []) {
  const slides = slidesFrom(a.body_md, 3, 55).length
  const parts = [['0', '01-capa'], ...Array.from({ length: slides }, (_, i) => [String(i + 1), `${String(i + 2).padStart(2, '0')}-slide${i + 1}`]), ['cta', `${String(slides + 2).padStart(2, '0')}-final`]]
  mkdirSync(`social/${a.slug}`, { recursive: true })
  for (const [s, name] of parts) {
    const res = await fetch(`${SITE}/card/${a.slug}?s=${s}`)
    if (!res.ok) { console.log(`[ERRO ${res.status}] ${a.slug} ${name}`); continue }
    writeFileSync(`social/${a.slug}/${name}.png`, Buffer.from(await res.arrayBuffer())); n++
  }
  writeFileSync(`social/${a.slug}/legenda.txt`, `${a.title}\n\nLeia mais no Nery Journal (link na bio).\n`)
  console.log(`[OK ] ${a.slug}`)
}
console.log(`${n} imagens salvas`)
