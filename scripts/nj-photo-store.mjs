// Guarda cópia das fotos aprovadas no Supabase Storage (bucket público nj-photos): a URL passa a ser estável.
// Calcula o sha1 do arquivo; se a MESMA imagem já ilustra outra matéria nos últimos 30 dias, reprova a repetida.
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const db = createClient(url, key, { auth: { persistSession: false } })
const UA = 'nery-journal-collector/0.1 (+https://github.com/Joaodesouzanery/nery-journal)'

const { data: photos, error } = await db.from('nj_photos').select('id,url,origin_url,created_at').eq('approved', true).is('stored_at', null).limit(100)
if (error) { console.error(error.message); process.exit(1) }

for (const p of photos ?? []) {
  try {
    const res = await fetch(p.url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const type = res.headers.get('content-type') ?? 'image/jpeg'
    if (!type.startsWith('image/')) throw new Error(`não é imagem: ${type}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const hash = createHash('sha1').update(buf).digest('hex')
    const since = new Date(Date.now() - 30 * 86400000).toISOString()
    const { data: dup } = await db.from('nj_photos').select('id').eq('content_hash', hash).neq('id', p.id).gte('created_at', since).limit(1)
    if (dup?.length) {
      await db.from('nj_photos').update({ approved: false, review_note: 'imagem repetida (mesmo conteúdo)', content_hash: hash, stored_at: new Date().toISOString() }).eq('id', p.id)
      await db.from('nj_articles').update({ status: 'em_revisao', needs_photo: true, photo_id: null }).eq('photo_id', p.id)
      console.log(`[REPETIDA] ${p.id}`)
      continue
    }
    const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('svg') ? 'svg' : 'jpg'
    const path = `${hash}.${ext}`
    const up = await db.storage.from('nj-photos').upload(path, buf, { contentType: type, upsert: true })
    if (up.error) throw new Error(up.error.message)
    const pub = db.storage.from('nj-photos').getPublicUrl(path).data.publicUrl
    await db.from('nj_photos').update({ url: pub, content_hash: hash, stored_at: new Date().toISOString() }).eq('id', p.id)
    console.log(`[OK ] ${p.id} -> ${path}`)
  } catch (e) { console.log(`[ERRO] ${p.id} ${e}`) }
}
process.exit(0)
