// Curador com visão: confere se a foto ligada combina com a matéria (mesmo assunto, lugar plausível, boa de ver).
// Reprovada -> nj_photo_blocklist e a matéria volta para a fila (nj-photos acha outra). Aprovada -> nj_photos.approved = true.
// Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY (sem ela, não roda).
import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, ANTHROPIC_API_KEY: apiKey } = process.env
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
if (!apiKey) { console.log('ANTHROPIC_API_KEY ausente: curador não rodou.'); process.exit(0) }
const MODEL = process.env.NJ_CURATOR_MODEL || 'claude-sonnet-5-5'
const db = createClient(url, key, { auth: { persistSession: false } })

const SYSTEM = `Você é o editor de fotografia de um jornal de Construção, Engenharia e Saneamento.
Recebe a manchete, o lide e uma foto. Aprove só se a foto mostrar o MESMO assunto (ex.: estação de esgoto para matéria de saneamento, ponte para matéria de ponte),
em lugar plausível (nada de neve em matéria do Brasil ou do Oriente Médio), sem pessoas em destaque, sem texto/marca d'água, e com boa qualidade.
Logo só é aceitável se a matéria for SOBRE aquela entidade. Responda APENAS JSON: {"aprovada": true|false, "motivo": "curto"}`

async function review(article, photo) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL, max_tokens: 200, system: SYSTEM,
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'url', url: photo.url } },
        { type: 'text', text: `Manchete: ${article.title}\nLide: ${article.lede}\nTipo: ${photo.kind}` },
      ] }],
    }),
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const body = await res.json()
  const txt = (body.content ?? []).map((c) => c.text ?? '').join('')
  const m = txt.match(/\{[\s\S]*\}/)
  if (!m) throw new Error(`resposta sem JSON: ${txt.slice(0, 120)}`)
  return JSON.parse(m[0])
}

const { data: arts, error } = await db.from('nj_articles')
  .select('id,slug,title,lede,photo:nj_photos!inner(id,url,origin_url,kind,approved)')
  .eq('status', 'publicado').not('photo_id', 'is', null).is('photo.approved', null).limit(60)
if (error) { console.error(error.message); process.exit(1) }

let ok = 0, bad = 0
for (const a of arts ?? []) {
  try {
    const r = await review(a, a.photo)
    const now = new Date().toISOString()
    if (r.aprovada) {
      await db.from('nj_photos').update({ approved: true, reviewed_at: now, review_note: r.motivo }).eq('id', a.photo.id)
      ok++; console.log(`[OK ] ${a.slug}: ${r.motivo}`)
    } else {
      await db.from('nj_photo_blocklist').upsert({ origin_url: a.photo.origin_url, reason: `curador: ${r.motivo}`.slice(0, 300) }, { onConflict: 'origin_url' })
      await db.from('nj_photos').update({ approved: false, reviewed_at: now, review_note: r.motivo }).eq('id', a.photo.id)
      await db.from('nj_articles').update({ status: 'em_revisao', needs_photo: true, photo_id: null }).eq('id', a.id)
      bad++; console.log(`[REPROVADA] ${a.slug}: ${r.motivo}`)
    }
  } catch (e) { console.log(`[ERRO] ${a.slug}: ${e.message}`) }
}
console.log(`curador: ${ok} aprovadas, ${bad} reprovadas`)
