import test from 'node:test'
import assert from 'node:assert/strict'
import { slidesFrom } from './social.ts'

test('slidesFrom corta em trechos curtos e ignora a atribuição', () => {
  const body = 'Primeira frase curta. Segunda frase também curta.\n\nTerceira frase. Quarta frase.\n\nCom informações da Fonte X.'
  const s = slidesFrom(body)
  assert.ok(s.length >= 1 && s.length <= 3)
  assert.ok(s.every((t) => !/Com informações/.test(t)))
  const long = Array.from({ length: 10 }, (_, i) => `Frase número ${i} com várias palavras para encher o texto do slide.`).join(' ')
  assert.ok(slidesFrom(long).every((t) => t.split(/\s+/).length <= 60))
})
