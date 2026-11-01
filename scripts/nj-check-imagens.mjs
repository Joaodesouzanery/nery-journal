// Trava final: nenhuma matéria publicada pode ficar sem imagem. Lista as que estão sem foto e sai com erro (o workflow avisa).
import { createClient } from '@supabase/supabase-js'
const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const db = createClient(url, key, { auth: { persistSession: false } })
const { data } = await db.from('nj_articles').select('slug,title,published_at').eq('status', 'publicado').is('photo_id', null).eq('is_placeholder', false)
for (const a of data ?? []) console.log(`[SEM IMAGEM] ${a.slug}`)
console.log(`${(data ?? []).length} matérias publicadas sem imagem`)
process.exit((data ?? []).length ? 1 : 0)
