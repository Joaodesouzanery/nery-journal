// Títulos SINTÉTICOS escritos para o teste.
import test from 'node:test'
import assert from 'node:assert/strict'
import { classificarTema } from './radar.ts'

test('Saneamento tem prioridade e reconhece PT e EN', () => {
  assert.equal(classificarTema('Licitação de rede de esgoto em Goiás'), 'Saneamento')
  assert.equal(classificarTema('Utility signs wastewater treatment contract'), 'Saneamento')
  assert.equal(classificarTema('Aegea vence leilão no Pará'), 'Saneamento')
})

test('classificarTema reconhece PT e EN e cai em Setor', () => {
  assert.equal(classificarTema('Prefeitura abre licitação para pavimentação'), 'Licitações e contratos')
  assert.equal(classificarTema('New rail bridge approved for the north corridor'), 'Infraestrutura')
  assert.equal(classificarTema('Preço do cimento sobe no semestre'), 'Materiais e custos')
  assert.equal(classificarTema('Construction firm adopts AI scheduling'), 'Tecnologia')
  assert.equal(classificarTema('Novas regras da NR-18 entram em vigor'), 'Regulação e segurança')
  assert.equal(classificarTema('Evento reúne lideranças do setor'), 'Setor')
})
