// CLI: node nery-journal/pipeline/run.ts entrada.json
// entrada.json = { "facts": ["..."], "fulltext": {"text": "...", "policy": {"allow_fulltext": true, "allow_ai": true}}?,
//                  "sources": [{"name":"...","url":"https://...","primary":true}], "categoryHint": "Infraestrutura" }
// Imprime o artigo, o carrossel e o resultado das checagens. Não grava no banco: a revisão humana vem depois.
import { readFileSync } from 'node:fs'
import Anthropic from '@anthropic-ai/sdk'
import { produce } from './author.ts'
import type { ProduceInput } from './author.ts'

const file = process.argv[2]
if (!file) {
  console.error('Uso: node nery-journal/pipeline/run.ts entrada.json')
  process.exit(2)
}

const input = JSON.parse(readFileSync(file, 'utf8')) as ProduceInput
const result = await produce(new Anthropic(), input)
console.log(JSON.stringify(result, null, 2))
if (!result.check.ok) {
  console.error('\nChecagens reprovaram o rascunho: revise antes de qualquer publicação.')
  process.exit(1)
}
