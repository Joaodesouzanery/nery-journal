// Funções puras do pipeline de autoria do Nery Journal (sem rede, testáveis).

export interface ArticleSource { name: string; url: string; primary: boolean }

export interface Article {
  title: string
  lede: string
  body_md: string
  category: string
  facts: string[]
  sources: ArticleSource[]
  /** 'nota': texto curto (≤ 160 palavras) a partir de um veículo, com atribuição e link; dispensa fonte primária. */
  kind?: 'dados' | 'nota'
  highlight?: { value: string; caption: string; source: string }
  impact?: string
}

export interface SourcePolicy { allow_fulltext: boolean; allow_ai: boolean }

export type Issue = { level: 'erro' | 'aviso'; code: string; msg: string }

/** O texto completo de uma fonte só pode ir à IA se a política permitir as duas coisas. */
export function canSendFulltext(p: SourcePolicy | undefined | null): boolean {
  return !!p && p.allow_fulltext === true && p.allow_ai === true
}

export function slugify(s: string, max = 80): string {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, max).replace(/-+$/g, '')
}

const tokens = (text: string): string[] =>
  text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)

export function ngrams(text: string, n = 5): Set<string> {
  const t = tokens(text)
  const out = new Set<string>()
  for (let i = 0; i + n <= t.length; i++) out.add(t.slice(i, i + n).join(' '))
  return out
}

/** Fração dos n-gramas do candidato que aparecem literalmente na fonte (0 a 1). */
export function overlapRatio(candidate: string, source: string, n = 5): number {
  const c = ngrams(candidate, n)
  if (c.size === 0) return 0
  const s = ngrams(source, n)
  let hit = 0
  for (const g of c) if (s.has(g)) hit++
  return hit / c.size
}

const NUM_RE = /\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g

/** Números do texto normalizados (pt-BR -> forma canônica). Inteiros ≤ 31 sem '%' são ignorados (dias, listas). */
export function extractNumbers(text: string): Set<string> {
  const out = new Set<string>()
  for (const m of text.matchAll(NUM_RE)) {
    const raw = m[0]
    const end = (m.index ?? 0) + raw.length
    let val = Number(raw.replace(/\./g, '').replace(',', '.'))
    if (!Number.isFinite(val)) continue
    // "12,5 milhões" == 12.500.000; "3 bi" == 3.000.000.000; "5 mil" == 5.000
    const scale = /^\s*(milh[ãa]o|milh[õo]es|mi\b|bilh[ãa]o|bilh[õo]es|bi\b|mil\b)/i.exec(text.slice(end, end + 12))
    if (scale) {
      const w = scale[1].toLowerCase()
      val = Math.round(val * (w.startsWith('bi') ? 1e9 : w.startsWith('mi') && w !== 'mil' ? 1e6 : 1e3))
    }
    const isSmallInt = Number.isInteger(val) && val <= 31
    if (isSmallInt && !/^\s*%/.test(text.slice(end, end + 2))) continue
    out.add(String(val))
  }
  return out
}

export function unsupportedNumbers(articleText: string, supportText: string): string[] {
  const support = extractNumbers(supportText)
  return [...extractNumbers(articleText)].filter((n) => !support.has(n))
}

const SENSATIONAL = /\b(chocante|absurdo|esc[aâ]ndalo|bomba|revoltante|inacredit[aá]vel|desastroso|fraude|corrupto|criminoso)\b/i

export interface CheckInput {
  article: Article
  /** Textos-fonte que a IA recebeu (apenas fontes liberadas pela política). */
  sourceTexts: string[]
  maxOverlap?: number
}

export function checkArticle({ article, sourceTexts, maxOverlap = 0.2 }: CheckInput): { ok: boolean; issues: Issue[] } {
  const issues: Issue[] = []
  const add = (level: Issue['level'], code: string, msg: string) => issues.push({ level, code, msg })
  const text = [article.title, article.lede, article.body_md].join('\n')

  if (!article.title.trim()) add('erro', 'titulo_vazio', 'Título vazio.')
  if (article.title.length > 120) add('aviso', 'titulo_longo', 'Título com mais de 120 caracteres.')
  if (article.sources.length < 1) add('erro', 'sem_fonte', 'Nenhuma fonte registrada.')
  else if (article.kind === 'nota') {
    const words = text.split(/\s+/).filter(Boolean).length
    if (words > 160) add('erro', 'nota_longa', `Nota com ${words} palavras (limite 160): vire matéria com fonte primária.`)
    if (!/\b(com informações d[aeo]s?|segundo)\b/i.test(article.body_md)) add('erro', 'sem_atribuicao', 'Nota precisa citar a fonte no texto ("Com informações de…" ou "Segundo…").')
    if (!article.sources.every((s) => /^https?:\/\//.test(s.url))) add('erro', 'sem_link', 'Nota precisa de link para a fonte.')
  }
  else if (!article.sources.some((s) => s.primary)) add('erro', 'sem_fonte_primaria', 'Nenhuma fonte primária (dado oficial, ato, release).')
  if (article.facts.length < 1) add('erro', 'sem_fatos', 'Nenhum fato estruturado.')

  sourceTexts.forEach((src, i) => {
    const r = overlapRatio(text, src)
    if (r > maxOverlap) add('erro', 'copia_da_fonte', `Texto reproduz ${(r * 100).toFixed(0)}% de sequências de 5 palavras da fonte ${i + 1} (limite ${(maxOverlap * 100).toFixed(0)}%).`)
  })

  const support = [...article.facts, ...sourceTexts].join('\n')
  const bad = unsupportedNumbers(text, support)
  if (bad.length) add('erro', 'numero_sem_suporte', `Números sem respaldo nos fatos/fontes: ${bad.join(', ')}.`)

  if (SENSATIONAL.test(text)) add('aviso', 'tom', 'Termo sensacionalista ou acusatório: revisar.')

  return { ok: !issues.some((i) => i.level === 'erro'), issues }
}

/** Monta o JSON do carrossel no formato de nery-journal/templates/carousel.html. */
export function buildCarousel(article: Article, marca = 'nery journal') {
  const slides: Record<string, unknown>[] = [{ tipo: 'capa' }]
  slides.push({ tipo: 'fatos', titulo: 'O que aconteceu', itens: article.facts.slice(0, 3) })
  if (article.highlight) slides.push({ tipo: 'dado', numero: article.highlight.value, legenda: article.highlight.caption, fonte: article.highlight.source })
  if (article.impact) slides.push({ tipo: 'impacto', titulo: 'Por que importa para a obra', texto: article.impact })
  slides.push({
    tipo: 'fonte',
    fontes: article.sources.map((s) => ({ nome: s.name, url: s.url.replace(/^https?:\/\//, '') })),
    cta: 'Receba no WhatsApp',
  })
  const primary = article.sources.find((s) => s.primary) ?? article.sources[0]
  return {
    marca,
    rotulo: article.category,
    manchete: article.title,
    foto: { url: '', credito: '', licenca: '', origem_url: '' },
    fonte_principal: primary ? `Fonte: ${primary.name}` : '',
    publi: { ativo: false, patrocinador: '' },
    correcao: false,
    aviso_ia: 'Produzido com apoio de IA e revisado por editor.',
    slides,
  }
}
