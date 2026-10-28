// HTML SINTÉTICO inventado para o teste.
import test from 'node:test'
import assert from 'node:assert/strict'
import { extractArticleText } from './texts.ts'

test('extrai parágrafos do article e ignora menu, script e rodapé', () => {
  const html = `<html><nav><p>Menu principal do site com links</p></nav><script>var a = "<p>não</p>"</script>
  <article><h1>Título da matéria de teste</h1><p>Primeiro parágrafo com R$&nbsp;1,5 milhão e &amp; entidades.</p><p>curto</p>
  <p>Segundo parágrafo com texto suficiente para entrar.</p></article><footer><p>Rodapé com texto longo o bastante</p></footer></html>`
  const t = extractArticleText(html)
  assert.match(t, /Título da matéria/)
  assert.match(t, /R\$ 1,5 milhão e & entidades/)
  assert.doesNotMatch(t, /Menu principal|Rodapé|não|curto/)
})
test('respeita o limite de caracteres', () => {
  assert.equal(extractArticleText(`<p>${'a'.repeat(100)}</p>`, 40).length, 40)
})
