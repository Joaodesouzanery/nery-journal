// Licitações do PNCP para a tabela nj_licitacoes. Filtros do servidor não são confiáveis: filtramos do nosso lado.
// NÃO testado contra a API real (ver `npm run nj:probe`); os nomes dos campos vêm da documentação pública.
import { PNCP_MODALIDADES, pncpLink } from './sources.ts'

export interface Licitacao {
  pncp_id: string
  orgao: string | null
  uf: string | null
  municipio: string | null
  objeto: string
  modalidade: string | null
  valor_estimado: number | null
  publicado_em: string | null
  abertura_proposta: string | null
  encerramento_proposta: string | null
  situacao: string | null
  link: string | null
  is_obra: boolean
}

const OBRA = /\b(obra|obras|engenharia|constru[cç][aã]o|pavimenta\w*|rodovia\w*|saneamento|edifica\w*|reforma|ponte|viaduto|terraplenagem|drenagem|recapeamento|urbaniza\w*|esgot\w*|adutora)\b/i
const NAO_OBRA = /\b(material de consumo|aquisi[cç][aã]o de (?:equipamentos|medicamentos|material)|servi[cç]os? de (?:limpeza|vigil[aâ]ncia))\b/i

/** Heurística simples: texto do objeto indica obra/serviço de engenharia e não é compra de material. */
export function classifyObra(objeto: string): boolean {
  return OBRA.test(objeto) && !NAO_OBRA.test(objeto)
}

interface PncpRaw {
  numeroControlePNCP?: string
  objetoCompra?: string
  valorTotalEstimado?: number | null
  modalidadeNome?: string
  situacaoCompraNome?: string
  dataPublicacaoPncp?: string
  dataAberturaProposta?: string
  dataEncerramentoProposta?: string
  linkSistemaOrigem?: string
  orgaoEntidade?: { razaoSocial?: string }
  unidadeOrgao?: { ufSigla?: string; municipioNome?: string }
}

export function normalizePncp(r: PncpRaw): Licitacao | null {
  if (!r.numeroControlePNCP || !r.objetoCompra) return null
  return {
    pncp_id: r.numeroControlePNCP,
    orgao: r.orgaoEntidade?.razaoSocial ?? null,
    uf: r.unidadeOrgao?.ufSigla ?? null,
    municipio: r.unidadeOrgao?.municipioNome ?? null,
    objeto: r.objetoCompra.trim(),
    modalidade: r.modalidadeNome ?? null,
    valor_estimado: typeof r.valorTotalEstimado === 'number' ? r.valorTotalEstimado : null,
    publicado_em: r.dataPublicacaoPncp ?? null,
    abertura_proposta: r.dataAberturaProposta ?? null,
    encerramento_proposta: r.dataEncerramentoProposta ?? null,
    situacao: r.situacaoCompraNome ?? null,
    link: pncpLink(r.numeroControlePNCP),
    is_obra: classifyObra(r.objetoCompra),
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const ymd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')

/** ≤ 12 chamadas/min; backoff no 429; 204 = sem dados; páginas de até 50. */
async function page(url: string): Promise<{ data?: PncpRaw[]; totalPaginas?: number } | null> {
  for (let tentativa = 0; tentativa < 4; tentativa++) {
    const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'nery-journal-collector/0.1' } })
    if (res.status === 204) return null
    if (res.status === 429) { await sleep(15000 * (tentativa + 1)); continue }
    if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`)
    return (await res.json()) as { data?: PncpRaw[]; totalPaginas?: number }
  }
  throw new Error('PNCP: 429 persistente')
}

export async function collectPncpLicitacoes(daysBack = 2, maxPages = 6): Promise<{ ok: boolean; items: Licitacao[]; error?: string }> {
  const items: Licitacao[] = []
  try {
    const fim = new Date()
    const ini = new Date(Date.now() - daysBack * 86400000)
    for (const modalidade of PNCP_MODALIDADES) {
      for (let p = 1; p <= maxPages; p++) {
        const body = await page(`https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao?dataInicial=${ymd(ini)}&dataFinal=${ymd(fim)}&codigoModalidadeContratacao=${modalidade}&pagina=${p}&tamanhoPagina=50`)
        await sleep(5500)
        if (!body) break
        for (const raw of body.data ?? []) {
          const l = normalizePncp(raw)
          if (l?.is_obra) items.push(l)
        }
        if (p >= (body.totalPaginas ?? 1)) break
      }
    }
    return { ok: true, items }
  } catch (e) {
    return { ok: false, items, error: String(e) }
  }
}
