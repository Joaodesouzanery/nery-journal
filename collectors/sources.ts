// Nery Journal — coletores de dados abertos.
// Cada coletor devolve itens de pauta (título, link, trecho curto). Nunca guarda texto de matéria de terceiros.
// STATUS: escritos a partir da documentação pública e NÃO testados contra as APIs reais
// (o ambiente de desenvolvimento não alcança esses hosts). Rode `npm run nj:probe` de uma máquina com rede.

export type PautaKind = 'dado' | 'licitacao' | 'noticia'

export interface PautaItem {
  source_id: string
  external_id: string
  kind: PautaKind
  title: string
  url: string | null
  summary: string | null
  published_at: string | null
  payload: unknown
}

export interface SourceResult {
  source_id: string
  ok: boolean
  items: PautaItem[]
  error?: string
}

type Json = Record<string, unknown>

async function getJson(url: string, timeoutMs = 20000): Promise<unknown> {
  let lastErr: unknown
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json', 'user-agent': 'nery-journal-collector/0.1' } })
      if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`)
      return await res.json()
    } catch (e) {
      // "fetch failed" esconde a causa real (DNS, reset, timeout): expõe para o log.
      const cause = (e as { cause?: { code?: string; message?: string } }).cause
      lastErr = new Error(`${(e as Error).message}${cause ? ` [${cause.code ?? cause.message}]` : ''} em ${url} (tentativa ${tentativa})`)
      if (String((e as Error).message).startsWith('HTTP 4')) break // erro do cliente: repetir não ajuda
      await new Promise((r) => setTimeout(r, 2000 * tentativa))
    } finally {
      clearTimeout(t)
    }
  }
  throw lastErr
}

const brDateToIso = (d: string): string | null => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

// ---------------------------------------------------------------------------
// Banco Central — SGS (séries temporais). Licença do portal: ODbL (atribuir "Fonte: Banco Central do Brasil").
// Formato documentado: /dados/serie/bcdata.sgs.{codigo}/dados/ultimos/{n}?formato=json -> [{data:"dd/mm/aaaa", valor:"x"}]
// Códigos: 432 e 433 conferidos na documentação do BC; 192 (INCC-M) vem de fonte secundária — conferir no probe.
// ---------------------------------------------------------------------------
export const BCB_SERIES = [
  { code: 432, nome: 'Meta da taxa Selic', unidade: '% a.a.' },
  { code: 433, nome: 'IPCA (variação mensal)', unidade: '%' },
  { code: 192, nome: 'BCB série 192 (índice de custo da construção, variação mensal)', unidade: '%' },
]

export async function collectBcb(): Promise<SourceResult> {
  const source_id = 'bcb-sgs'
  const items: PautaItem[] = []
  try {
    for (const s of BCB_SERIES) {
      const rows = (await getJson(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${s.code}/dados/ultimos/2?formato=json`)) as { data: string; valor: string }[]
      const last = rows[rows.length - 1]
      if (!last) continue
      const prev = rows.length > 1 ? rows[rows.length - 2] : null
      items.push({
        source_id,
        external_id: `${s.code}:${last.data}`,
        kind: 'dado',
        title: `${s.nome}: ${last.valor.replace('.', ',')} ${s.unidade} (${last.data})`,
        url: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${s.code}/dados/ultimos/2?formato=json`,
        summary: prev ? `Valor anterior: ${prev.valor.replace('.', ',')} (${prev.data}). Fonte: Banco Central do Brasil (SGS ${s.code}).` : `Fonte: Banco Central do Brasil (SGS ${s.code}).`,
        published_at: brDateToIso(last.data),
        payload: { serie: s, last, prev },
      })
    }
    return { source_id, ok: true, items }
  } catch (e) {
    return { source_id, ok: false, items, error: String(e) }
  }
}

// ---------------------------------------------------------------------------
// PNCP — contratações publicadas (obras e engenharia). API pública de consulta, sem cadastro.
// Filtros do servidor podem ser ignorados em silêncio (relato público), então filtramos aqui por palavra-chave e valor.
// Modalidades (tabela PNCP): 4 concorrência eletrônica, 5 concorrência presencial, 6 pregão eletrônico — conferir no probe.
// ---------------------------------------------------------------------------
export const PNCP_MODALIDADES = [4, 5, 6, 7, 8]  // + pregão presencial (7) e dispensa (8)
export const PNCP_KEYWORDS = /\b(obra|obras|engenharia|constru[cç][aã]o|pavimenta|rodovia|saneamento|edifica|reforma|ponte|viaduto|terraplenagem|drenagem)\b/i
export const PNCP_MIN_VALOR = 5_000_000

const ymd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')

interface PncpItem {
  numeroControlePNCP?: string
  objetoCompra?: string
  valorTotalEstimado?: number
  modalidadeNome?: string
  dataPublicacaoPncp?: string
  orgaoEntidade?: { razaoSocial?: string }
  unidadeOrgao?: { ufSigla?: string; municipioNome?: string }
}

export function pncpLink(numeroControle: string | undefined): string | null {
  const m = /^(\d{14})-\d+-(\d+)\/(\d{4})$/.exec(numeroControle ?? '')
  return m ? `https://pncp.gov.br/app/editais/${m[1]}/${m[3]}/${Number(m[2])}` : null
}

export async function collectPncp(daysBack = 2): Promise<SourceResult> {
  const source_id = 'pncp'
  const items: PautaItem[] = []
  try {
    const fim = new Date()
    const ini = new Date(Date.now() - daysBack * 86400000)
    for (const modalidade of PNCP_MODALIDADES) {
      for (let pagina = 1; pagina <= 3; pagina++) {
        const url = `https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao?dataInicial=${ymd(ini)}&dataFinal=${ymd(fim)}&codigoModalidadeContratacao=${modalidade}&pagina=${pagina}&tamanhoPagina=50`
        const body = (await getJson(url)) as { data?: PncpItem[]; totalPaginas?: number }
        for (const it of body.data ?? []) {
          const objeto = it.objetoCompra ?? ''
          const valor = it.valorTotalEstimado ?? 0
          if (!PNCP_KEYWORDS.test(objeto) || valor < PNCP_MIN_VALOR || !it.numeroControlePNCP) continue
          const local = [it.unidadeOrgao?.municipioNome, it.unidadeOrgao?.ufSigla].filter(Boolean).join('/')
          items.push({
            source_id,
            external_id: it.numeroControlePNCP,
            kind: 'licitacao',
            title: `${it.modalidadeNome ?? 'Licitação'}: ${objeto.slice(0, 160)}`,
            url: pncpLink(it.numeroControlePNCP),
            summary: `${it.orgaoEntidade?.razaoSocial ?? 'Órgão'}${local ? ' — ' + local : ''}. Valor estimado: ${fmtBRL(valor)}. Fonte: PNCP.`,
            published_at: it.dataPublicacaoPncp ?? null,
            payload: it,
          })
        }
        if (pagina >= (body.totalPaginas ?? 1)) break
      }
    }
    return { source_id, ok: true, items }
  } catch (e) {
    return { source_id, ok: false, items, error: String(e) }
  }
}

// ---------------------------------------------------------------------------
// IBGE — API de agregados (SIDRA). Cite sempre "Fonte: IBGE". Termos de reuso do IBGE têm sinais conflitantes: confirmar.
// Tabela/variável abaixo vêm de memória/fonte secundária: o probe mostra se respondem. Ajuste IBGE_QUERIES conforme o resultado.
// ---------------------------------------------------------------------------
// SIDRA: a API de agregados (servicodados) não responde a servidores fora do Brasil; apisidra.ibge.gov.br responde.
export const IBGE_QUERIES = [
  { id: 'sinapi-custo-m2', nome: 'SINAPI — custo médio do m²', tabela: 2296, variavel: 48 },
]

type SidraRow = Record<string, string>

/** Primeira linha da SIDRA é o cabeçalho; as demais trazem V (valor), MN (unidade) e as dimensões (D1N, D2N...). */
export function parseSidra(rows: SidraRow[]): { valor: string; unidade: string; periodo: string } | null {
  const [header, ...data] = rows
  if (!header || data.length === 0) return null
  const last = data[data.length - 1]
  const periodKey = Object.keys(header).find((k) => /^D\dN$/.test(k) && /m[eê]s|ano|trimestre/i.test(header[k])) ?? 'D3N'
  const valor = last.V
  if (!valor || valor === '...' || valor === '-') return null
  return { valor, unidade: last.MN ?? '', periodo: last[periodKey] ?? '' }
}

export async function collectIbge(): Promise<SourceResult> {
  const source_id = 'ibge-sidra'
  const items: PautaItem[] = []
  try {
    for (const q of IBGE_QUERIES) {
      const url = `https://apisidra.ibge.gov.br/values/t/${q.tabela}/n1/all/v/${q.variavel}/p/last%201`
      const rows = (await getJson(url)) as SidraRow[]
      const r = parseSidra(rows)
      if (!r) continue
      items.push({
        source_id,
        external_id: `${q.id}:${r.periodo}`,
        kind: 'dado',
        title: `${q.nome}: ${r.valor} ${r.unidade} (${r.periodo})`.replace(/\s+/g, ' ').trim(),
        url,
        summary: `${q.nome}. Fonte: IBGE (SIDRA, tabela ${q.tabela}).`,
        published_at: null,
        payload: { query: q, row: rows[rows.length - 1] },
      })
    }
    return { source_id, ok: true, items }
  } catch (e) {
    return { source_id, ok: false, items, error: String(e) }
  }
}

// ---------------------------------------------------------------------------
// Eurostat — API de disseminação (JSON-stat). Produção na construção (sts_copr_m), UE-27, índice 2021=100, ajustado sazonalmente.
// Licença: reuso permitido com atribuição ("Fonte: Eurostat"). Dataset/filtros a confirmar no probe.
// ---------------------------------------------------------------------------
interface JsonStat { value?: Record<string, number> | (number | null)[]; dimension?: { time?: { category?: { index?: Record<string, number> | string[] } } } }

/** Série temporal de uma consulta JSON-stat já filtrada para uma única série: [{periodo, valor}] em ordem cronológica. */
export function parseJsonStatSeries(js: JsonStat): { periodo: string; valor: number }[] {
  const idx = js.dimension?.time?.category?.index
  if (!idx || !js.value) return []
  const entries: [string, number][] = Array.isArray(idx) ? idx.map((p, i) => [p, i]) : Object.entries(idx)
  const get = (i: number) => (Array.isArray(js.value) ? js.value[i] : (js.value as Record<string, number>)[String(i)])
  return entries
    .map(([periodo, i]) => ({ periodo, valor: get(i) }))
    .filter((x): x is { periodo: string; valor: number } => typeof x.valor === 'number')
    .sort((a, b) => a.periodo.localeCompare(b.periodo))
}

export async function collectEurostat(): Promise<SourceResult> {
  const source_id = 'eurostat-produ-o-na-constru-o'
  const items: PautaItem[] = []
  try {
    const url = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sts_copr_m?format=JSON&lang=EN&geo=EU27_2020&nace_r2=F&s_adj=SCA&unit=I21&indic_bt=PRD&lastTimePeriod=3'
    const serie = parseJsonStatSeries((await getJson(url)) as JsonStat)
    const last = serie[serie.length - 1]
    if (last) {
      const prev = serie[serie.length - 2]
      const var_ = prev ? ((last.valor / prev.valor - 1) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : null
      items.push({
        source_id,
        external_id: `sts_copr_m:${last.periodo}`,
        kind: 'dado',
        title: `União Europeia — produção na construção: índice ${last.valor.toLocaleString('pt-BR')} (2021=100, ${last.periodo})${var_ ? `, ${var_}% sobre o mês anterior` : ''}`,
        url,
        summary: 'Produção na construção, UE-27, ajustada sazonalmente. Fonte: Eurostat (sts_copr_m).',
        published_at: null,
        payload: { serie },
      })
    }
    return { source_id, ok: true, items }
  } catch (e) {
    return { source_id, ok: false, items, error: String(e) }
  }
}

// ---------------------------------------------------------------------------
// Banco Mundial — API v2. Datasets em CC BY 4.0 por padrão: creditar e indicar alterações (inclui tradução).
// Indicador: NE.GDI.FTOT.ZS (formação bruta de capital fixo, % do PIB).
// ---------------------------------------------------------------------------
export async function collectWorldBank(): Promise<SourceResult> {
  const source_id = 'worldbank'
  const items: PautaItem[] = []
  try {
    const url = 'https://api.worldbank.org/v2/country/BRA/indicator/NE.GDI.FTOT.ZS?format=json&per_page=5&mrnev=1'
    const body = (await getJson(url)) as [Json, { indicator?: { value?: string }; date?: string; value?: number | null }[]]
    const row = (body[1] ?? []).find((r) => r.value != null)
    if (row) {
      items.push({
        source_id,
        external_id: `NE.GDI.FTOT.ZS:BRA:${row.date}`,
        kind: 'dado',
        title: `Brasil — formação bruta de capital fixo: ${Number(row.value).toFixed(1).replace('.', ',')}% do PIB (${row.date})`,
        url,
        summary: 'Fonte: Banco Mundial (CC BY 4.0). Dados traduzidos/adaptados pelo Nery Journal.',
        published_at: null,
        payload: row,
      })
    }
    return { source_id, ok: true, items }
  } catch (e) {
    return { source_id, ok: false, items, error: String(e) }
  }
}

export const COLLECTORS: Record<string, () => Promise<SourceResult>> = {
  'bcb-sgs': collectBcb,
  pncp: () => collectPncp(),
  'ibge-sidra': collectIbge,
  eurostat: collectEurostat,
  worldbank: collectWorldBank,
}

// Fase 2 (não implementados aqui): DOU/INLABS (exige cadastro), Novo Caged (FTP), SINAPI Caixa (planilhas),
// Eurostat, US Census, feeds RSS aprovados de veículos (somente manchete + link).
