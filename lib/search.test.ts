import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizarTermo, buscarPaginas } from './search.ts'

test('sanitizarTermo remove curingas e exige 2 caracteres', () => {
  assert.equal(sanitizarTermo('  esgoto%_ ,(x) '), 'esgoto x')
  assert.equal(sanitizarTermo('a'), null)
  assert.equal(sanitizarTermo(undefined), null)
  assert.equal(sanitizarTermo('"; drop'), 'drop')
})
test('buscarPaginas ignora acentos', () => {
  assert.equal(buscarPaginas('politica')[0]?.url, '/politica-editorial')
  assert.equal(buscarPaginas('xyzxyz').length, 0)
})
