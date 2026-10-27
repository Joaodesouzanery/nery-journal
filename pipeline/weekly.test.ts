// Dados SINTÉTICOS criados para o teste.
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildWeekly } from './weekly.ts'

const lic = (id: string, uf: string, v: number) => ({ pncp_id: id, uf, objeto: 'Obra ' + id, orgao: null, valor_estimado: v, link: null })

test('buildWeekly agrupa por UF do assinante e ordena por valor', () => {
  const w = buildWeekly([], [lic('a', 'SP', 10), lic('b', 'SP', 30), lic('c', 'RJ', 99), lic('d', 'SP', 20)], ['SP'], { perUf: 2 })
  assert.deepEqual(w.licitacoes.map((g) => g.uf), ['SP'])
  assert.deepEqual(w.licitacoes[0].items.map((i) => i.pncp_id), ['b', 'd'])
})

test('buildWeekly sem UF mostra o top geral e limita as matérias', () => {
  const arts = [1, 2, 3].map((n) => ({ title: 't' + n, slug: 's' + n, category: 'Mercado', published_at: `2026-10-0${n}T00:00:00Z` }))
  const w = buildWeekly(arts, [lic('a', 'SP', 1), lic('b', 'RJ', 2)], [], { maxArticles: 2 })
  assert.deepEqual(w.articles.map((a) => a.slug), ['s3', 's2'])
  assert.equal(w.licitacoes[0].uf, 'Brasil')
  assert.equal(w.licitacoes[0].items[0].pncp_id, 'b')
})

test('buildWeekly omite UF sem licitação', () => {
  assert.equal(buildWeekly([], [lic('a', 'SP', 1)], ['AC']).licitacoes.length, 0)
})
