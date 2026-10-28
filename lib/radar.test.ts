// Títulos SINTÉTICOS escritos para o teste.
import test from 'node:test'
import assert from 'node:assert/strict'
import { classificarTema } from './radar.ts'

test('classificarTema reconhece PT e EN e cai em Setor', () => {
  assert.equal(classificarTema('Prefeitura abre licitação para pavimentação'), 'Licitações e contratos')
  assert.equal(classificarTema('New rail bridge approved for the north corridor'), 'Infraestrutura')
  assert.equal(classificarTema('Preço do cimento sobe no semestre'), 'Materiais e custos')
  assert.equal(classificarTema('Construction firm adopts AI scheduling'), 'Tecnologia')
  assert.equal(classificarTema('Novas regras da NR-18 entram em vigor'), 'Regulação e segurança')
  assert.equal(classificarTema('Evento reúne lideranças do setor'), 'Setor')
})
