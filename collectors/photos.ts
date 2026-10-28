// Busca de fotos reais com licença livre (CC0 / domínio público) no Wikimedia Commons.
// Só entram fotos que não exigem crédito (CC0 e domínio público). Pessoas, logotipos, mapas e diagramas são evitados pelo título/descrição.

export interface CommonsPhoto { url: string; origin_url: string; license: string; credit: string; width: number; height: number; text: string }

const FREE = /^(cc0|cc[- ]?zero|public domain|pd[- ]|pdm|no restrictions|copyrighted free use)/i
const BANNED = /\b(logo|map|mapa|diagram|flag|bandeira|poster|portrait|retrato|people|person|crowd|protest|manifesta\w*|svg|screenshot|icon|chart|gr[aá]fico|child|children|woman|man|worker\w*|soldier\w*|president|minister)\b/i

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
export function bestPhoto<T extends { text: string; width: number }>(query: string, photos: T[], min = 1): T | null {
  const ranked = photos.map((p) => ({ p, r: relevance(query, p) })).filter((x) => x.r >= min)
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
