// Testes das funções puras. Textos abaixo são SINTÉTICOS (não são notícias reais).
// Rodar: node --test nery-journal/pipeline/lib.test.ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { slugify, overlapRatio, extractNumbers, unsupportedNumbers, checkArticle, canSendFulltext, buildCarousel } from './lib.ts'
import type { Article } from './lib.ts'

const SRC = 'O órgão publicou o edital para a obra de recuperação da ponte com valor estimado de 12.500.000 reais e prazo de 18 meses para execução.'

const good: Article = {
  title: 'Edital prevê R$ 12,5 milhões para recuperar ponte',
  lede: 'Licitação aberta fixa prazo de 18 meses para a recuperação da estrutura.',
  body_md: 'A contratação tem valor estimado de 12.500.000 reais.',
  category: 'Infraestrutura',
  facts: ['Valor estimado: 12.500.000 reais', 'Prazo de execução: 18 meses'],
  sources: [{ name: 'PNCP (exemplo)', url: 'https://exemplo.gov.br/edital', primary: true }],
  impact: 'Obra de grande porte abre oportunidade para fornecedores.',
}

test('slugify remove acentos e símbolos', () => {
  assert.equal(slugify('Edital prevê R$ 12,5 milhões!'), 'edital-preve-r-12-5-milhoes')
  assert.equal(slugify('  --Água & Esgoto--  '), 'agua-esgoto')
})

test('overlapRatio detecta cópia literal e ignora texto diferente', () => {
  assert.ok(overlapRatio(SRC, SRC) > 0.99)
  assert.equal(overlapRatio('texto totalmente diferente sem relação alguma com o edital da ponte', SRC), 0)
})

test('extractNumbers normaliza pt-BR e ignora inteiros pequenos sem %', () => {
  const n = extractNumbers('Selic 14,25% e 12.500.000 reais em 18 meses, dia 5 e 3%')
  assert.ok(n.has('14.25') && n.has('12500000') && n.has('3'))
  assert.ok(!n.has('5') && !n.has('18'))
})

test('extractNumbers entende milhões, bilhões e mil', () => {
  const n = extractNumbers('R$ 12,5 milhões, 3 bi e 5 mil')
  assert.ok(n.has('12500000') && n.has('3000000000') && n.has('5000'))
})

test('unsupportedNumbers aponta número que não está nos fatos', () => {
  assert.deepEqual(unsupportedNumbers('Alta de 7,5% no ano', 'Alta de 7,5% no ano'), [])
  assert.deepEqual(unsupportedNumbers('Alta de 9,9% no ano', 'Alta de 7,5% no ano'), ['9.9'])
})

test('checkArticle aprova artigo coerente e reprova sem fonte primária', () => {
  assert.equal(checkArticle({ article: good, sourceTexts: [SRC] }).ok, true)
  const noPrimary = { ...good, sources: [{ ...good.sources[0], primary: false }] }
  const r = checkArticle({ article: noPrimary, sourceTexts: [SRC] })
  assert.equal(r.ok, false)
  assert.ok(r.issues.some((i) => i.code === 'sem_fonte_primaria'))
})

test('checkArticle reprova cópia e número inventado', () => {
  const copy = { ...good, body_md: SRC }
  assert.ok(checkArticle({ article: copy, sourceTexts: [SRC] }).issues.some((i) => i.code === 'copia_da_fonte'))
  const fake = { ...good, lede: 'Prazo de 99 meses para a obra.' }
  assert.ok(checkArticle({ article: fake, sourceTexts: [SRC] }).issues.some((i) => i.code === 'numero_sem_suporte'))
})

test('canSendFulltext exige allow_fulltext E allow_ai', () => {
  assert.equal(canSendFulltext({ allow_fulltext: true, allow_ai: true }), true)
  assert.equal(canSendFulltext({ allow_fulltext: true, allow_ai: false }), false)
  assert.equal(canSendFulltext(null), false)
})

test('buildCarousel segue o formato do template', () => {
  const c = buildCarousel(good)
  assert.equal(c.slides[0].tipo, 'capa')
  assert.equal(c.slides[c.slides.length - 1].tipo, 'fonte')
  assert.equal(c.manchete, good.title)
})

test('nota curta com atribuição passa sem fonte primária; nota longa ou sem atribuição não', () => {
  const base: Article = { title: 'Mirante em aterro no Japão', lede: 'Cone laranja vira mirante.', body_md: 'Segundo a Dezeen, o projeto fica numa ilha do Japão.', category: 'Tecnologia', facts: ['Mirante em cone laranja em complexo de reciclagem no Japão'], sources: [{ name: 'Dezeen', url: 'https://www.dezeen.com/x', primary: false }], kind: 'nota' }
  assert.equal(checkArticle({ article: base, sourceTexts: ['Cone laranja gigante serve de mirante em complexo de reciclagem na ilha de Shikoku'] }).ok, true)
  assert.equal(checkArticle({ article: { ...base, body_md: 'O projeto fica numa ilha do Japão.' }, sourceTexts: [] }).issues.some((i) => i.code === 'sem_atribuicao'), true)
  assert.equal(checkArticle({ article: { ...base, body_md: 'Segundo a Dezeen, ' + 'palavra '.repeat(170) }, sourceTexts: [] }).issues.some((i) => i.code === 'nota_longa'), true)
  assert.equal(checkArticle({ article: { ...base, kind: 'dados' }, sourceTexts: [] }).issues.some((i) => i.code === 'sem_fonte_primaria'), true)
})
