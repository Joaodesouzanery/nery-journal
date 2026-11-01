// Redator automático (sem chat): pega itens novos do radar, pede ao Claude uma nota PRÓPRIA só com os fatos do item,
// confere com o verificador (checkArticle) e publica. Requer ANTHROPIC_API_KEY; sem ela, sai sem erro.
// Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, NJ_MODEL (padrão claude-sonnet-5-5), NJ_MAX (padrão 6).
import { createClient } from '@supabase/supabase-js'
import { checkArticle, slugify } from '../pipeline/lib.ts'

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, ANTHROPIC_API_KEY: apiKey } = process.env
if (!apiKey) { console.log('ANTHROPIC_API_KEY não configurada: redator automático desligado.'); process.exit(0) }
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const MODEL = process.env.NJ_MODEL || 'claude-sonnet-5-5'
const MAX = Number(process.env.NJ_MAX || 6)
const db = createClient(url, key, { auth: { persistSession: false } })

const SYSTEM = `Você é o redator do Nery Journal (construção, infraestrutura e saneamento, para o Brasil todo). Escreva em português do Brasil, texto 100% PRÓPRIO, factual e útil para construtoras, engenheiros, fornecedores e poder público.
REGRAS: use SOMENTE fatos presentes no texto da fonte fornecido (título, trecho ou texto). Não invente números, datas, nomes ou causas. Não copie frases: reorganize com palavras suas. Nada de opinião, adjetivação ou política partidária.
Se o item não tiver relação clara com obras, infraestrutura, habitação, saneamento, energia/água, materiais, mercado da construção ou for fofoca/política/esporte/saúde geral, responda {"use":false}.
Formato (JSON puro, sem markdown): {"use":true,"category":"Mercado|Infraestrutura|Saneamento|Habitação|Tecnologia","title":"até 110 caracteres, com o número principal quando houver","lede":"1 frase","body_md":"3 a 4 parágrafos curtos separados por linha em branco: o que aconteceu; detalhes; por que importa para a obra (sem inventar); terminar com 'Com informações de <fonte>.' (ou 'Segundo a <fonte>.')","facts":["3 a 5 pontos curtos"],"uf":"sigla do estado principal ou null","photo_query":"2 a 4 termos em inglês do assunto exato, sem pessoas"}. Notas de 150 a 260 palavras.`

async function ask(user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 1800, system: SYSTEM, messages: [{ role: 'user', content: user }] }),
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const j = await res.json()
  const text = (j.content ?? []).map((c) => c.text ?? '').join('')
  const m = /\{[\s\S]*\}/.exec(text)
  return m ? JSON.parse(m[0]) : { use: false }
}

const since = new Date(Date.now() - 14 * 3600 * 1000).toISOString()
const { data: items } = await db.from('nj_pauta_items').select('id,title,url,summary,published_at,source_id').eq('kind', 'noticia').not('url', 'is', null).gte('published_at', since).order('published_at', { ascending: false }).limit(120)
const { data: srcs } = await db.from('nj_sources').select('id,name,topic')
const sname = new Map((srcs ?? []).map((s) => [s.id, s]))
const { data: arts } = await db.from('nj_articles').select('slug,sources').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
const usadas = new Set((arts ?? []).flatMap((a) => (a.sources ?? []).map((s) => s.url)))
const slugs = new Set((arts ?? []).map((a) => a.slug))
const { data: texts } = await db.from('nj_source_texts').select('url,text').eq('status', 'ok').in('url', (items ?? []).map((i) => i.url))
const txt = new Map((texts ?? []).map((t) => [t.url, t.text]))
const JUNK = /Áudio|Bolsonaro|Trump|menopausa|Enem|INSS|violência|futebol|Copa do|novela|horóscopo/i
const cand = (items ?? []).filter((i) => !usadas.has(i.url) && !JUNK.test(i.title))

let feito = 0
for (const it of cand) {
  if (feito >= MAX) break
  const src = sname.get(it.source_id)
  const corpo = (txt.get(it.url) ?? it.summary ?? '').replace(/&#\d+;|&[a-z]+;/g, ' ').slice(0, 3500)
  const base = `Fonte: ${src?.name ?? 'fonte'}\nTítulo original: ${it.title}\nURL: ${it.url}\nTexto/trecho da fonte:\n${corpo}`
  try {
    let out = await ask(base)
    if (!out.use) continue
    const mk = (o) => ({ title: o.title, lede: o.lede, body_md: o.body_md, category: o.category || 'Mercado', facts: o.facts ?? [], sources: [{ name: src?.name ?? 'Fonte', url: it.url, primary: false }], kind: 'nota' })
    let r = checkArticle({ article: mk(out), sourceTexts: [`${it.title} ${corpo}`] })
    if (!r.ok) {
      out = await ask(`${base}\n\nSua versão anterior foi reprovada pelo verificador: ${r.issues.map((i) => i.msg).join(' | ')}. Reescreva corrigindo (mais palavras suas, sem números que a fonte não traga).`)
      if (!out.use) continue
      r = checkArticle({ article: mk(out), sourceTexts: [`${it.title} ${corpo}`] })
    }
    if (!r.ok) { console.log(`[REPROVADO] ${it.title.slice(0, 70)}: ${r.issues.map((i) => i.code).join(',')}`); continue }
    const slug = slugify(out.title)
    if (slugs.has(slug)) continue
    const { error } = await db.from('nj_articles').insert({
      slug, sector: 'construcao', category: out.category || 'Mercado', title: out.title, lede: out.lede, body_md: out.body_md, facts: out.facts ?? [],
      sources: [{ name: src?.name ?? 'Fonte', url: it.url, primary: false }], photo_query: out.photo_query ?? null, uf: /^[A-Z]{2}$/.test(out.uf ?? '') ? out.uf : null,
      status: 'publicado', is_placeholder: false, ai_assisted: true, reviewed_by: 'auto-verificador', reviewed_at: new Date().toISOString(), published_at: new Date().toISOString(),
    })
    if (error) { console.log(`[ERRO] ${error.message}`); continue }
    slugs.add(slug); feito++
    console.log(`[OK ] ${out.title}`)
  } catch (e) { console.log(`[ERRO] ${it.title.slice(0, 60)}: ${e}`) }
}
console.log(`${feito} matérias publicadas`)
