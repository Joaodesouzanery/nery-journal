// Amostras SINTÉTICAS (inventadas para o teste); não são respostas reais do IBGE nem do Eurostat.
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSidra, parseJsonStatSeries } from './sources.ts'

test('parseSidra usa a última linha e o nome do período', () => {
  const rows = [
    { V: 'Valor', MN: 'Unidade de Medida', D3N: 'Mês' },
    { V: '1500,10', MN: 'Reais', D3N: 'julho 2026' },
    { V: '1510,55', MN: 'Reais', D3N: 'agosto 2026' },
  ]
  assert.deepEqual(parseSidra(rows), { valor: '1510,55', unidade: 'Reais', periodo: 'agosto 2026' })
  assert.equal(parseSidra([rows[0]]), null)
  assert.equal(parseSidra([rows[0], { V: '...', MN: '', D3N: 'x' }]), null)
})

test('parseJsonStatSeries ordena por período e ignora vazios', () => {
  const js = { value: { '0': 98.1, '2': 99.3 }, dimension: { time: { category: { index: { '2026-06': 0, '2026-07': 1, '2026-08': 2 } } } } }
  assert.deepEqual(parseJsonStatSeries(js), [{ periodo: '2026-06', valor: 98.1 }, { periodo: '2026-08', valor: 99.3 }])
  assert.deepEqual(parseJsonStatSeries({}), [])
})
