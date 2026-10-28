// Filtros e ordenação da página de licitações (funções puras, testáveis).
import type { LicRow } from './licitacoes'

export const TEMAS_LIC = [
  ['saneamento', 'Saneamento', /saneament|esgot|drenagem|aterro sanit|res[ií]duos? s[oó]lidos?|limpeza urbana|coleta de (lixo|res[ií]duos)|po[cç]os? tubulares?|abastecimento de [aá]gua|adutora|el[ei]vat[oó]ria|rede de [aá]gua|tratamento de (a|á)gua|\bETA\b|\bETE\b|[aá]guas pluviais|ligac[oõ]es? (domiciliares|de [aá]gua)/i],
  ['pavimentacao', 'Pavimentação e rodovias', /paviment|asfalt|rodovi|recapeament|estrada|vicinal|\bBR-\d|\bCBUQ\b|viaduto|ponte/i],
  ['educacao-saude', 'Escolas e saúde', /escola|creche|educa[cç][aã]o|sala de aula|\bEMEI\b|\bUBS\b|unidade b[aá]sica|hospital|\bUPA\b|sa[uú]de|\bCAPS\b/i],
  ['edificacoes', 'Edificações e reformas', /reforma|edifica|constru[cç][aã]o de (pr[eé]dio|sede|centro|quadra|ginasio|gin[aá]sio)|restauro|ampliac[aã]o|habita[cç]/i],
  ['urbanizacao', 'Urbanização e contenção', /urbaniza|contenc[aã]o|encosta|reurbaniza|cal[cç]ada|pra[cç]a|\bPAC\b/i],
] as const

export type TemaLic = (typeof TEMAS_LIC)[number][0]

export const temaDe = (objeto: string): TemaLic | null => {
  for (const [id, , re] of TEMAS_LIC) if (re.test(objeto)) return id
  return null
}
export const temaNome = (id: string) => TEMAS_LIC.find((t) => t[0] === id)?.[1] ?? ''

export const FAIXAS = [
  ['ate1', 'Até R$ 1 mi', 0, 1e6],
  ['1a10', 'R$ 1 a 10 mi', 1e6, 1e7],
  ['10a50', 'R$ 10 a 50 mi', 1e7, 5e7],
  ['50mais', 'Acima de R$ 50 mi', 5e7, Infinity],
] as const

export type Ordem = 'recentes' | 'valor' | 'encerra'

export interface LicQuery { tema?: string; uf?: string; faixa?: string; modalidade?: string; dias?: number; q?: string; ordem?: Ordem }

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function filtrarLicitacoes(rows: LicRow[], f: LicQuery, now = Date.now()): LicRow[] {
  const q = f.q ? norm(f.q).trim() : ''
  const faixa = FAIXAS.find((x) => x[0] === f.faixa)
  const desde = f.dias ? now - f.dias * 86400000 : 0
  const out = rows.filter((r) => {
    if (f.uf && r.uf !== f.uf) return false
    if (f.modalidade && r.modalidade !== f.modalidade) return false
    if (f.tema && !(f.tema === 'saneamento' ? temaDe(r.objeto) === 'saneamento' || TEMAS_LIC[0][2].test(r.objeto) : temaDe(r.objeto) === f.tema)) return false
    if (faixa && !((r.valor_estimado ?? -1) >= faixa[2] && (r.valor_estimado ?? -1) < faixa[3])) return false
    if (desde && (!r.publicado_em || Date.parse(r.publicado_em) < desde)) return false
    if (q && !norm(`${r.objeto} ${r.orgao ?? ''} ${r.municipio ?? ''} ${r.uf ?? ''}`).includes(q)) return false
    return true
  })
  const t = (x: string | null) => (x ? Date.parse(x) : 0)
  if (f.ordem === 'valor') out.sort((a, b) => (b.valor_estimado ?? 0) - (a.valor_estimado ?? 0))
  else if (f.ordem === 'encerra') out.sort((a, b) => (t(a.encerramento_proposta) || Infinity) - (t(b.encerramento_proposta) || Infinity))
  else out.sort((a, b) => t(b.publicado_em) - t(a.publicado_em))
  return out
}

export function resumo(rows: LicRow[]) {
  const porUf: Record<string, number> = {}
  let total = 0
  for (const r of rows) { if (r.uf) porUf[r.uf] = (porUf[r.uf] ?? 0) + 1; total += r.valor_estimado ?? 0 }
  return { n: rows.length, total, porUf }
}
