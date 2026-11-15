import test from 'node:test'
import assert from 'node:assert/strict'
import { parseAgencia } from './agencias.ts'

const page = 'https://www.gov.br/aneel/pt-br/assuntos/noticias'
const html = `
<a href="/aneel/pt-br/assuntos/noticias">Notícias</a>
<a href="https://www.gov.br/aneel/pt-br/assuntos/noticias/2026/aneel-aprova-reajuste-tarifario-da-distribuidora-x">ANEEL aprova reajuste tarif&aacute;rio da distribuidora X em 2026</a>
<a href="/aneel/pt-br/assuntos/noticias/2026/aneel-aprova-reajuste-tarifario-da-distribuidora-x/">ANEEL aprova reajuste tarifário da distribuidora X em 2026</a>
<a href="/aneel/pt-br/assuntos/noticias?b_start:int=20">Próxima página de resultados da busca</a>
<a href="/aneel/pt-br/acesso-a-informacao/institucional-da-agencia">Institucional da agência reguladora</a>
<a href="/aneel/pt-br/assuntos/noticias/2026/consulta-publica-sobre-geracao-distribuida"><h2>Consulta pública sobre geração distribuída &amp; tarifas</h2></a>
<a href="/aneel/pt-br/assuntos/noticias/2026/curto">Curto</a>`

test('parseAgencia pega só matérias abaixo da listagem, sem duplicar', () => {
  const r = parseAgencia(html, page)
  assert.equal(r.length, 2)
  assert.equal(r[0].link, 'https://www.gov.br/aneel/pt-br/assuntos/noticias/2026/aneel-aprova-reajuste-tarifario-da-distribuidora-x')
  assert.equal(r[1].title, 'Consulta pública sobre geração distribuída & tarifas')
})
