// Coleta licitações de obras do PNCP -> nj_licitacoes. Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Sem as variáveis, roda em modo teste (só imprime). Argumento opcional: dias para trás (padrão 2).
import { createClient } from '@supabase/supabase-js'
import { collectPncpLicitacoes } from '../collectors/licitacoes.ts'

const dias = Number(process.argv[2] || 2)
const r = await collectPncpLicitacoes(dias)
console.log(`[${r.ok ? 'OK ' : 'ERRO'}] pncp-licitacoes  ${r.items.length} obras${r.error ? '  ' + r.error : ''}`)
for (const l of r.items.slice(0, 3)) console.log('  -', l.uf, l.objeto.slice(0, 90), l.valor_estimado)

const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
if (url && key && r.items.length) {
  const db = createClient(url, key, { auth: { persistSession: false } })
  const { error } = await db.from('nj_licitacoes').upsert(r.items.map((l) => ({ ...l, atualizado_em: new Date().toISOString() })), { onConflict: 'pncp_id' })
  if (error) { console.error('supabase:', error.message); process.exit(1) }
  console.log('gravadas em nj_licitacoes')
}
process.exit(r.ok ? 0 : 1)
