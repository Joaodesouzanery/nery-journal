// Tratamento editorial do radar: tema por palavras-chave no título (PT e EN). Função pura; não depende de rede.
export const TEMAS = ['Saneamento', 'Licitações e contratos', 'Infraestrutura', 'Habitação e mercado', 'Materiais e custos', 'Tecnologia', 'Sustentabilidade', 'Regulação e segurança', 'Setor'] as const
export type Tema = (typeof TEMAS)[number]

export const RE_SANEAMENTO = /saneament|esgot|[aá]gua tratada|abastecimento de [aá]gua|adutora|elevat[oó]ria|\bETE\b|\bETA\b|sabesp|copasa|sanepar|aegea|ig[uú]a|brk ambiental|marco legal|ligac[oõ]es? de [aá]gua|\b(water|wastewater|sewer\w*|sewage|drinking water|desalination|stormwater|water utilit\w*|pipelines?)\b/i
export const ehSaneamento = (t: string) => RE_SANEAMENTO.test(t)

const REGRAS: [Tema, RegExp][] = [
  ['Saneamento', RE_SANEAMENTO],
  ['Licitações e contratos', /licita|edital|concorr[eê]ncia|preg[aã]o|contrata[cç][aã]o|\b(tender|procurement|bidding|contract award|awarded)\b/i],
  ['Infraestrutura', /rodovia|ferrovia|porto|aeroporto|ponte|viaduto|saneamento|metr[oô]|obra p[uú]blica|\b(highway|bridge|rail(way)?|airport|tunnel|infrastructure|road|dam|port)\b/i],
  ['Habitação e mercado', /habita|imobili|incorpora|financiamento|cr[eé]dito|minha casa|lan[cç]amentos|\b(housing|mortgage|real estate|homebuild\w*|apartment)\b/i],
  ['Materiais e custos', /cimento|\ba[cç]o\b|custo|infla[cç][aã]o|incc|sinapi|pre[cç]o|material|insumo|\b(cement|steel|lumber|cost|prices?|inflation|tariff\w*)\b/i],
  ['Tecnologia', /\bbim\b|tecnologia|digital|intelig[eê]ncia artificial|rob[oô]|drone|automa[cç][aã]o|\b(ai|technology|software|robot\w*|automation|3d print\w*|digital twin)\b/i],
  ['Sustentabilidade', /sustent|carbono|energia|solar|emiss[oõ]es|\b(green|sustainab\w*|carbon|energy|net[- ]zero|climate|renewable)\b/i],
  ['Regulação e segurança', /\bnr-?\d|norma|regulament|seguran[cç]a|\blei\b|decreto|\b(regulation|safety|code|law|legislation|compliance|fatal\w*)\b/i],
]

export function classificarTema(titulo: string): Tema {
  for (const [tema, re] of REGRAS) if (re.test(titulo)) return tema
  return 'Setor'
}
