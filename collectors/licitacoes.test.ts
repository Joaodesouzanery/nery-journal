// Amostras SINTÉTICAS (inventadas para o teste), não são respostas reais do PNCP.
import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyObra, normalizePncp } from './licitacoes.ts'

test('classifyObra reconhece obra e descarta compra de material', () => {
  assert.equal(classifyObra('Contratação de empresa para pavimentação asfáltica da Rua X'), true)
  assert.equal(classifyObra('Obras de drenagem e saneamento'), true)
  assert.equal(classifyObra('Aquisição de material de consumo para escritório'), false)
  assert.equal(classifyObra('Serviços de limpeza e vigilância'), false)
  assert.equal(classifyObra('Contratação de empresa para manejo de resíduos sólidos e limpeza urbana'), true)
  assert.equal(classifyObra('Serviços de limpeza de fossas sépticas e esgotamento sanitário'), true)
})

test('normalizePncp mapeia campos e exige id e objeto', () => {
  assert.equal(normalizePncp({ objetoCompra: 'x' }), null)
  const l = normalizePncp({ numeroControlePNCP: '12345678000195-1-000123/2026', objetoCompra: ' Reforma de escola ', valorTotalEstimado: 1000, unidadeOrgao: { ufSigla: 'SP', municipioNome: 'Santos' } })
  assert.equal(l?.uf, 'SP')
  assert.equal(l?.objeto, 'Reforma de escola')
  assert.equal(l?.is_obra, true)
  assert.match(l?.link ?? '', /pncp\.gov\.br\/app\/editais\/12345678000195\/2026\/123/)
})
