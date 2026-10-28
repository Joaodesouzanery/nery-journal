// Amostras SINTÉTICAS (inventadas para o teste).
import test from 'node:test'
import assert from 'node:assert/strict'
import { filtrarLicitacoes, temaDe, resumo } from './licfilters.ts'
import type { LicRow } from './licitacoes.ts'

const row = (o: Partial<LicRow>): LicRow => ({ pncp_id: 'x', orgao: 'Prefeitura', uf: 'SP', municipio: 'Santos', objeto: 'Obra', modalidade: 'Concorrência', valor_estimado: 1000, publicado_em: '2026-10-20T00:00:00Z', encerramento_proposta: null, link: null, ...o })
const rows = [
  row({ pncp_id: 'a', objeto: 'Obras de drenagem pluvial', uf: 'PI', valor_estimado: 5e6, publicado_em: '2026-10-27T00:00:00Z' }),
  row({ pncp_id: 'b', objeto: 'Pavimentação asfáltica da Rua X', uf: 'SP', valor_estimado: 2e7, publicado_em: '2026-10-25T00:00:00Z' }),
  row({ pncp_id: 'c', objeto: 'Construção de escola com 8 salas de aula', uf: 'MA', valor_estimado: 6e7, publicado_em: '2026-09-01T00:00:00Z' }),
]
const now = Date.parse('2026-10-28T00:00:00Z')

test('tema, UF, faixa de valor, período e busca', () => {
  assert.equal(temaDe('Aterro sanitário de Brasília'), 'saneamento')
  assert.deepEqual(filtrarLicitacoes(rows, { tema: 'saneamento' }, now).map((r) => r.pncp_id), ['a'])
  assert.deepEqual(filtrarLicitacoes(rows, { uf: 'SP' }, now).map((r) => r.pncp_id), ['b'])
  assert.deepEqual(filtrarLicitacoes(rows, { faixa: '50mais' }, now).map((r) => r.pncp_id), ['c'])
  assert.deepEqual(filtrarLicitacoes(rows, { dias: 14 }, now).map((r) => r.pncp_id), ['a', 'b'])
  assert.deepEqual(filtrarLicitacoes(rows, { q: 'PAVIMENTACAO' }, now).map((r) => r.pncp_id), ['b'])
})

test('ordenação por valor e resumo', () => {
  assert.deepEqual(filtrarLicitacoes(rows, { ordem: 'valor' }, now).map((r) => r.pncp_id), ['c', 'b', 'a'])
  const r = resumo(rows)
  assert.equal(r.n, 3); assert.equal(r.total, 5e6 + 2e7 + 6e7); assert.equal(r.porUf.SP, 1)
})
