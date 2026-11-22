// Coleta licitações de obras do PNCP -> nj_licitacoes. Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Sem as variáveis, roda em modo teste (só imprime). Argumento opcional: dias para trás (padrão 2).
import { createClient } from '@supabase/supabase-js'
import { collectPncpLicitacoes } from '../collectors/licitacoes.ts'

// Dias para trás: argumento, ou "dias=N" em .github/triggers/collect (permite recarga histórica por push), ou 2.
import { readFileSync } from 'node:fs'
let gatilho = ''
try { gatilho = readFileSync(new URL('../.github/triggers/collect', import.meta.url), 'utf8') } catch {}
const dias = Number(process.argv[2] || /dias=(\d+)/.exec(gatilho)?.[1] || 2)
const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env
const db0 = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
let gravadas = 0
const r = await collectPncpLicitacoes(dias, 80, db0 ? async (lote) => {
  const { error } = await db0.from('nj_licitacoes').upsert(lote.map((l) => ({ ...l, atualizado_em: new Date().toISOString() })), { onConflict: 'pncp_id' })
  if (error) console.error('supabase:', error.message); else gravadas += lote.length
} : undefined)
console.log(`gravadas por página: ${gravadas}`)
console.log(`[${r.ok ? 'OK ' : 'ERRO'}] pncp-licitacoes  ${r.items.length} obras${r.error ? '  ' + r.error : ''}`)
for (const l of r.items.slice(0, 3)) console.log('  -', l.uf, l.objeto.slice(0, 90), l.valor_estimado)

// Alerta de cobertura: em dia útil, menos de 150 obras indica coleta cortada ou PNCP fora do ar.
const dow = new Date().getUTCDay()
if (r.ok && dias <= 3 && dow >= 2 && dow <= 6 && r.items.length < 150) {
  console.error(`[ALERTA] só ${r.items.length} obras em ${dias} dia(s): cobertura baixa`)
  process.exit(1)
}
process.exit(r.ok ? 0 : 1)
