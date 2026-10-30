// Busca de fotos reais com licença livre (CC0 / domínio público) no Wikimedia Commons.
// Só entram fotos que não exigem crédito (CC0 e domínio público). Pessoas, logotipos, mapas e diagramas são evitados pelo título/descrição.

export interface CommonsPhoto { url: string; origin_url: string; license: string; credit: string; width: number; height: number; text: string }

const FREE = /^(cc0|cc[- ]?zero|public domain|pd[- ]|pdm|no restrictions|copyrighted free use)/i
const BANNED = /\b(logo|map|mapa|diagram|flag|bandeira|poster|portrait|retrato|people|person|crowd|protest|manifesta\w*|svg|screenshot|icon|chart|gr[aá]fico|child|children|woman|man|worker\w*|soldier\w*|president|minister|navy|naval|army|military|soldier|sailor|meeting|conference|ceremony|visit|visits|officials?|commander|staff|employees?|volunteers?|students?|tray|bucket|laboratory|lab|sample|samples|kitchen|office|room|interior)\b/i

/** Gravuras, desenhos, fotos históricas e digitalizações: não servem como foto de notícia atual. */
const OLD_OR_ART = /\b(engraving|drawing|painting|illustration|lithograph\w*|sketch|vintage|historic\w*|postcard|scan(ned)?|newspaper|journal|magazine|woodcut|etching|archive\w*|museum|(1[0-8]\d\d|19[0-7]\d))\b/i

export const THEME_QUERIES: Record<string, string[]> = {
  saneamento: ['sewage treatment plant', 'water treatment plant', 'water pipeline construction', 'wastewater tank aerial'],
  infraestrutura: ['bridge construction', 'highway construction', 'road construction aerial', 'tunnel construction'],
  mercado: ['construction site crane', 'building under construction', 'skyscraper construction'],
  materiais: ['concrete construction', 'steel beams construction', 'brick wall construction'],
  tecnologia: ['construction site drone aerial', 'building information modeling', 'construction machinery'],
  credito: ['housing construction', 'residential buildings construction'],
  seguranca: ['construction scaffolding', 'construction site safety'],
  habitacao: ['housing development construction', 'apartment buildings construction'],
  default: ['construction site', 'building construction'],
}

const norm = (c: string) => c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '')

/** Termos do título (pt) -> consulta de foto em inglês, do mais específico ao genérico. */
const TERMOS: [RegExp, string][] = [
  [/aterro sanit|res[ií]duos|limpeza urbana|coleta de lixo/i, 'landfill waste facility'],
  [/drenagem|[aá]guas pluviais|enchente/i, 'storm drain culvert'],
  [/esgot|\bETE\b/i, 'sewage treatment plant'],
  [/reúso|reuso|reuse/i, 'water reuse treatment plant'],
  [/pfas|contamina|qualidade da [aá]gua|monitorad/i, 'river water sampling'],
  [/adutora|tubula|rede de [aá]gua|abastecimento/i, 'water pipeline'],
  [/po[cç]o/i, 'water well drilling'],
  [/paviment|asfalt|recapeamento|vicinal/i, 'asphalt road paving'],
  [/rodovia|\bBR-\d+|estrada|DNIT/i, 'highway road'],
  [/ponte|viaduto/i, 'bridge'],
  [/aeroporto|airport/i, 'airport terminal'],
  [/ferrovia|metr[oô]|trem/i, 'railway track'],
  [/porto/i, 'port cranes'],
  [/escola|creche|sala de aula/i, 'school building'],
  [/hospital|sa[uú]de|\bUBS\b|\bUPA\b/i, 'hospital building'],
  [/habita|moradia|minha casa|casa pr[oó]pria/i, 'housing development'],
  [/contenc[aã]o|encosta/i, 'retaining wall slope'],
  [/custo|sinapi|cub|incc/i, 'building construction site'],
  [/produ[cç][aã]o na constru|atividade da constru|construction activity/i, 'construction site crane'],
]
export function queriesFromTitle(title: string): string[] {
  return TERMOS.filter(([re]) => re.test(title)).map(([, q]) => q)
}

/** Consultas candidatas em inglês, da mais específica à mais genérica: a da matéria, as do título e as do tema. */
export function photoQueries(category: string, photoQuery?: string | null, title?: string): string[] {
  const theme = THEME_QUERIES[norm(category)] ?? THEME_QUERIES.default
  return [...new Set([...(photoQuery ? [photoQuery] : []), ...(title ? queriesFromTitle(title) : []), ...theme])]
}

const GENERIC = new Set(['construction', 'site', 'building', 'aerial', 'view', 'with', 'from', 'the', 'and', 'under', 'new'])
const tokens = (q: string) => q.toLowerCase().split(/[^a-z]+/).filter((t) => t.length >= 4 && !GENERIC.has(t)).map((t) => t.replace(/s$/, ''))

/** Quantos termos específicos da consulta aparecem no título/descrição/categorias da foto (0 = foto genérica). */
export function relevance(query: string, photo: { text: string }): number {
  const t = tokens(query)
  return t.filter((x) => photo.text.includes(x)).length
}

/** Melhor foto para a consulta: maior correlação; empate por tamanho. `min` = correlação mínima aceita. */
export function bestPhoto<T extends { text: string; width: number }>(query: string, photos: T[], min?: number): T | null {
  // Sem mínimo explícito: exige até 2 termos em comum (ou todos os termos específicos, se a consulta tiver menos de 2).
  const need = min ?? Math.min(2, tokens(query).length)
  const ranked = photos.map((p) => ({ p, r: relevance(query, p) })).filter((x) => x.r >= need)
    .sort((a, b) => b.r - a.r || b.p.width - a.p.width)
  return ranked[0]?.p ?? null
}

interface CommonsPage { title?: string; imageinfo?: { thumburl?: string; url?: string; width?: number; height?: number; mime?: string; descriptionurl?: string; extmetadata?: Record<string, { value?: string }> }[] }

/** Escolhe fotos aceitáveis da resposta do Commons (licença livre sem crédito, horizontal, grande, sem pessoas/logos). */
export function pickPhotos(pages: CommonsPage[]): CommonsPhoto[] {
  const out: CommonsPhoto[] = []
  for (const p of pages) {
    const ii = p.imageinfo?.[0]
    if (!ii || !ii.mime || !/^image\/jpeg$/.test(ii.mime)) continue
    const lic = ii.extmetadata?.LicenseShortName?.value ?? ''
    const desc = `${p.title ?? ''} ${(ii.extmetadata?.ImageDescription?.value ?? '').replace(/<[^>]*>/g, ' ')} ${ii.extmetadata?.Categories?.value ?? ''}`
    if (!FREE.test(lic) || BANNED.test(desc) || OLD_OR_ART.test(desc)) continue
    const w = ii.width ?? 0, h = ii.height ?? 0
    if (w < 1000 || w < h * 1.2) continue
    const url = ii.thumburl ?? ii.url
    if (!url) continue
    out.push({ url, origin_url: ii.descriptionurl ?? ii.url ?? url, license: lic, credit: (ii.extmetadata?.Artist?.value ?? '').replace(/<[^>]*>/g, '').trim() || 'Wikimedia Commons', width: w, height: h, text: desc.toLowerCase() })
  }
  return out
}

export async function searchCommons(query: string): Promise<CommonsPhoto[]> {
  const u = new URL('https://commons.wikimedia.org/w/api.php')
  u.search = new URLSearchParams({
    action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrlimit: '30',
    gsrsearch: `${query} filetype:bitmap`, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1200', origin: '*',
  }).toString()
  const res = await fetch(u, { headers: { 'user-agent': 'nery-journal-photos/0.1 (https://github.com/Joaodesouzanery/nery-journal; neryadministrativo@gmail.com)' }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`Commons HTTP ${res.status}`)
  const body = (await res.json()) as { query?: { pages?: Record<string, CommonsPage> } }
  return pickPhotos(Object.values(body.query?.pages ?? {}))
}

// ---------------------------------------------------------------------------
// Entidades (empresas, órgãos, agências): a matéria sobre a Sabesp usa imagem da Sabesp (foto livre ou logo), não de terceiros.
// ---------------------------------------------------------------------------
export interface Entity { id: string; name: string; aliases: string[]; country: string; logo_url: string | null }

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Entidade citada no título (ou no início do texto). Siglas curtas (≤4 letras) exigem caixa alta exata. */
export function matchEntity(text: string, entities: Entity[]): Entity | null {
  for (const e of entities) {
    for (const a of [e.name, ...e.aliases]) {
      const short = a.length <= 4
      if (new RegExp(`(^|[^\\p{L}\\p{N}])${escRe(a)}(?![\\p{L}\\p{N}])`, short ? 'u' : 'iu').test(text)) return e
    }
  }
  return null
}

/** Matéria brasileira: alguma fonte em domínio .br. Matéria brasileira não usa foto de lugar/empresa estrangeira. */
export const isBrazilStory = (sources: { url: string }[]) => sources.some((s) => /^https?:\/\/[^/]*\.br(\/|$)/i.test(s.url))
const FOREIGN = /\b(usa|u\.s\.a?|united states|american?|america|texas|california|florida|new york|chicago|washington|london|england|uk|britain|british|scotland|wales|australia|canada|india|china|japan|germany|france|italy|spain|dubai|singapore)\b/i
export const isForeignPhoto = (photo: { text: string }) => FOREIGN.test(photo.text)

export interface Logo { url: string; origin_url: string; license: string }

/** Logo da entidade no Commons (PNG/SVG convertido em PNG). Uso editorial para identificar o assunto da matéria. */
export async function searchLogo(name: string): Promise<Logo | null> {
  const u = new URL('https://commons.wikimedia.org/w/api.php')
  u.search = new URLSearchParams({
    action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrlimit: '15',
    gsrsearch: `${name} logo`, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '600', origin: '*',
  }).toString()
  const res = await fetch(u, { headers: { 'user-agent': 'nery-journal-photos/0.1 (https://github.com/Joaodesouzanery/nery-journal; neryadministrativo@gmail.com)' }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) return null
  const body = (await res.json()) as { query?: { pages?: Record<string, CommonsPage> } }
  const key = name.toLowerCase().split(/\s+/)[0]
  for (const p of Object.values(body.query?.pages ?? {})) {
    const ii = p.imageinfo?.[0]
    if (!ii || !/^image\/(png|svg\+xml|jpeg)$/.test(ii.mime ?? '')) continue
    if (!(p.title ?? '').toLowerCase().includes(key) || !/logo|logotipo|marca/i.test(p.title ?? '')) continue
    const url = ii.thumburl ?? ii.url
    if (url) return { url, origin_url: ii.descriptionurl ?? url, license: ii.extmetadata?.LicenseShortName?.value ?? 'logo (uso editorial)' }
  }
  return null
}

/** Vocabulário do setor: a foto só serve se o título/descrição/categorias falarem de obra, água, estrada, moradia etc. */
const SECTOR = /\b(construction|building|bridge|road|highway|asphalt|pavement|crane|excavat\w*|scaffold\w*|concrete|steel|sewage|sewer|wastewater|water|treatment plant|pipeline|pipe|pipes|reservoir|dam|landfill|waste|recycling|drainage|culvert|flood\w*|housing|apartment|residential|skyscraper|airport|runway|terminal|railway|rail|train|port|harbou?r|tunnel|infrastructure|engineering|obra|constru[cç][aã]o|ponte|rodovia|esgoto|saneamento|usina|barragem)\b/i
export const isSectorPhoto = (photo: { text: string }) => SECTOR.test(photo.text)
/** Matéria de dado/política/gestão (sem cena física): prefere a logo da entidade a uma foto aleatória. */
export const isAbstractStory = (title: string) => /\b(PIB|juros|Selic|[ií]ndice|capital fixo|infla[cç][aã]o|IPCA|INCC|SINAPI|projeto de lei|intelig[eê]ncia artificial|distrato|zoneamento|jur[ií]dic\w*|bilh[oõ]es? para|relat[oó]rio|pesquisa|dificuldade financeira|estrat[eé]gia)\b/i.test(title)

// ---------------------------------------------------------------------------
// Assunto da matéria × assunto da foto: a foto só vale se for do MESMO grupo (água não recebe avião, estrada não recebe aterro).
// ---------------------------------------------------------------------------
const GROUPS: [string, RegExp][] = [
  ['agua', /\b(water|sewage|sewer|wastewater|drain\w*|flood\w*|river|dam|reservoir|pipeline|pipe|pipes|sanitation|treatment plant|stormwater|culvert|[aá]gua|esgot\w*|inunda\w*|enchente\w*|enxurrada\w*|drenagem|saneamento|ETE|ETA|adutora)\b/i],
  ['residuos', /\b(landfill|waste|recycling|garbage|res[ií]duos?|aterro|lixo|limpeza urbana)\b/i],
  ['rodovia', /\b(road|highway|asphalt|pavement|paving|bridge|viaduct|traffic|rodovia|estrada|paviment\w*|asfalt\w*|ponte|viaduto|BR-\d+)\b/i],
  ['ferrovia', /\b(railway|rail|railroad|train|locomotive|ferrovia\w*|trem|metr[oô])\b/i],
  ['porto', /\b(port|harbou?r|container|dock|quay|terminal portu\w*|porto|portu[aá]ri\w*|dragagem|Suape|Itaja[ií])\b/i],
  ['aeroporto', /\b(airport|runway|aircraft|airplane|aeroporto|pista)\b/i],
  ['energia', /\b(power|transmission|substation|grid|electric\w*|turbine|wind|solar|energia|transmiss[aã]o|subesta[cç][aã]o|leil[aã]o de transmiss[aã]o|el[eé]trica)\b/i],
  ['habitacao', /\b(housing|apartment|residential|homes?|house|moradi\w*|habita\w*|casa|apartamento|condom[ií]nio|incorpora\w*|FGTS)\b/i],
  ['obra', /\b(construction|building|crane|excavat\w*|scaffold\w*|concrete|steel|skyscraper|obra\w*|constru\w+|canteiro)\b/i],
]

/** Grupo do assunto, a partir do título (PT) e da consulta (EN). */
export function topicGroup(...texts: string[]): string | null {
  const t = texts.join(' ')
  for (const [g, re] of GROUPS) if (re.test(t)) return g
  return null
}

/** A foto é do grupo do assunto? Quando o grupo é "obra", qualquer foto de obra serve, mas nunca de outro assunto específico. */
export function photoInGroup(photo: { text: string }, group: string | null): boolean {
  if (!group) return isSectorPhoto(photo)
  const mine = GROUPS.find(([g]) => g === group)![1]
  if (!mine.test(photo.text)) return false
  // rejeita foto que pertence claramente a outro assunto específico (ex.: aeroporto em matéria de água)
  for (const [g, re] of GROUPS) if (g !== group && g !== 'obra' && re.test(photo.text) && !(group === 'obra')) {
    const mineHits = (photo.text.match(new RegExp(mine.source, 'gi')) ?? []).length
    const otherHits = (photo.text.match(new RegExp(re.source, 'gi')) ?? []).length
    if (otherHits > mineHits) return false
  }
  return true
}

/** Logo do site de uma entidade/veículo: <link rel="apple-touch-icon"> ou og:image da página inicial. */
export async function siteLogo(site: string): Promise<string | null> {
  try {
    const res = await fetch(site, { headers: { 'user-agent': 'nery-journal-photos/0.1 (+https://github.com/Joaodesouzanery/nery-journal)' }, signal: AbortSignal.timeout(15000) })
    if (!res.ok) return null
    const html = await res.text()
    const pick = (re: RegExp) => re.exec(html)?.[1]
    const href = pick(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]*href=["']([^"']+)["']/i) ?? pick(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["'][^"']*apple-touch-icon/i)
      ?? pick(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ?? pick(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i)
    return href ? new URL(href, site).toString() : null
  } catch { return null }
}
