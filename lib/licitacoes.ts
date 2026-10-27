import { createClient } from '@supabase/supabase-js'
import { admin } from './newsletter'

import { PRO_SEATS } from './constants'

export interface LicRow {
  pncp_id: string; orgao: string | null; uf: string | null; municipio: string | null; objeto: string
  modalidade: string | null; valor_estimado: number | null; publicado_em: string | null
  encerramento_proposta: string | null; link: string | null
}
const COLS = 'pncp_id,orgao,uf,municipio,objeto,modalidade,valor_estimado,publicado_em,encerramento_proposta,link'

function pub() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
}

/** Obras publicadas nos últimos `days` dias (leitura pública). */
export async function getLicitacoes(opts: { days?: number; uf?: string; limit?: number } = {}): Promise<LicRow[]> {
  const db = pub()
  if (!db) return []
  let q = db.from('nj_licitacoes').select(COLS).eq('is_obra', true)
    .gte('publicado_em', new Date(Date.now() - (opts.days ?? 7) * 86400000).toISOString())
    .order('publicado_em', { ascending: false }).limit(opts.limit ?? 200)
  if (opts.uf) q = q.eq('uf', opts.uf)
  const { data } = await q
  return (data ?? []) as LicRow[]
}

export async function proSeatsTaken(): Promise<number | null> {
  const db = admin()
  if (!db) return null
  const { count } = await db.from('nj_pro_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'ativo')
  return count ?? 0
}

export interface ProProfile { email: string; ufs: string[]; keywords: string[]; min_value: number; status: string }
export async function getProByToken(token: string): Promise<ProProfile | null> {
  const db = admin()
  if (!db || !/^[a-f0-9]{48}$/.test(token)) return null
  const { data } = await db.from('nj_pro_subscribers').select('email,ufs,keywords,min_value,status').eq('token', token).maybeSingle()
  return (data as ProProfile | null) ?? null
}

/** Aplica os filtros do assinante Pro (UFs, palavras-chave, valor mínimo) sobre o histórico de 90 dias. */
export async function getProLicitacoes(p: ProProfile): Promise<LicRow[]> {
  const rows = await getLicitacoes({ days: 90, limit: 1000 })
  const kws = p.keywords.map((k) => k.toLowerCase())
  return rows.filter((r) =>
    (!p.ufs.length || (r.uf && p.ufs.includes(r.uf))) &&
    (r.valor_estimado ?? 0) >= p.min_value &&
    (!kws.length || kws.some((k) => r.objeto.toLowerCase().includes(k))))
}

export const brl = (v: number | null) => (v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }))
