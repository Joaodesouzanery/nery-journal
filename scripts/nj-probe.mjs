// Testa os coletores contra as APIs reais (roda no GitHub Actions ou numa máquina com internet).
//   npm run nj:probe            (todos)
//   npm run nj:probe -- pncp    (um só)
// Não grava nada no banco: só imprime status, quantidade de itens e exemplos.
import { COLLECTORS } from '../collectors/sources.ts'

const only = process.argv[2]
const ids = Object.keys(COLLECTORS).filter((id) => !only || id === only)
let failed = 0

for (const id of ids) {
  const t0 = Date.now()
  const r = await COLLECTORS[id]()
  console.log(`\n[${r.ok ? 'OK ' : 'ERRO'}] ${id}  ${r.items.length} itens  ${Date.now() - t0} ms`)
  if (r.error) { console.log('  erro:', r.error); failed++ }
  for (const it of r.items.slice(0, 3)) console.log('  -', it.title, '\n    ', it.url ?? '(sem link)')
}

console.log(failed ? `\n${failed} coletor(es) com erro: ajuste URLs/códigos em collectors/sources.ts` : '\nTodos responderam.')
process.exit(failed ? 1 : 0)
