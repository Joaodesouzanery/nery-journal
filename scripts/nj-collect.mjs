// Coleta dados abertos e grava na pauta (nj_pauta_items). Roda no GitHub Actions.
// Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Opcional: argumento = id de um coletor.
import { createClient } from '@supabase/supabase-js'
import { COLLECTORS } from '../collectors/sources.ts'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes'); process.exit(2) }
const db = createClient(url, key, { auth: { persistSession: false } })

const only = process.argv[2]
let failed = 0
for (const id of Object.keys(COLLECTORS).filter((i) => !only || i === only)) {
  const r = await COLLECTORS[id]()
  let error = r.error
  if (r.items.length) {
    // ignoreDuplicates: não sobrescreve status/edição de itens já vistos.
    const { error: e } = await db.from('nj_pauta_items').upsert(r.items, { onConflict: 'source_id,external_id', ignoreDuplicates: true })
    if (e) error = `${error ? error + ' | ' : ''}supabase: ${e.message}`
  }
  console.log(`[${r.ok && !error ? 'OK ' : 'ERRO'}] ${id}  ${r.items.length} itens${error ? '  ' + error : ''}`)
  if (error) failed++
}
process.exit(failed ? 1 : 0)
