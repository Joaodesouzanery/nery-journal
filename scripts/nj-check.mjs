// Roda as checagens do pipeline (originalidade, números sustentados, fonte primária) num rascunho em JSON.
//   node scripts/nj-check.mjs rascunho.json     -> {"article": {...}, "sourceTexts": ["texto dos dados/fonte", ...]}
import { readFileSync } from 'node:fs'
import { checkArticle } from '../pipeline/lib.ts'

const { article, sourceTexts } = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const r = checkArticle({ article, sourceTexts })
console.log(r.ok ? 'OK' : 'REPROVADO')
for (const i of r.issues) console.log(`  [${i.level}] ${i.code}: ${i.msg}`)
process.exit(r.ok ? 0 : 1)
