// Pesquisa no site: sanitiza o termo e consulta artigos e licitações (leitura pública, RLS).
import { createClient } from '@supabase/supabase-js'

export const PAGINAS = [
  { titulo: 'Sobre o Nery Journal', url: '/sobre', texto: 'missão visão valores como produzimos grupo nery transparência contato' },
  { titulo: 'Política editorial', url: '/politica-editorial', texto: 'política editorial fontes correções inteligência artificial independência' },
  { titulo: 'Privacidade', url: '/privacidade', texto: 'privacidade lgpd dados pessoais cookies newsletter' },
  { titulo: 'Boletim Nery Journal (newsletter)', url: '/newsletter', texto: 'newsletter boletim cadastro receber e-mail' },
  { titulo: 'Licitações de obras e saneamento', url: '/licitacoes', texto: 'licitações editais obras pncp estados saneamento' },
  { titulo: 'Saneamento', url: '/saneamento', texto: 'saneamento água esgoto drenagem resíduos' },
  { titulo: 'Plano Pro de licitações', url: '/licitacoes/pro', texto: 'plano pro alertas licitações preço' },
] as const

/** Remove caracteres que mudam o padrão do LIKE/or do PostgREST; exige 2+ caracteres. */
export function sanitizarTermo(raw: string | undefined | null): string | null {
  const t = (raw ?? '').normalize('NFC').replace(/[%_\\,()*"'`;:]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
  return t.length >= 2 ? t : null
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
export const buscarPaginas = (t: string) => PAGINAS.filter((p) => norm(`${p.titulo} ${p.texto}`).includes(norm(t)))

function pub() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
}

export interface Resultados {
  artigos: { slug: string; title: string; lede: string; category: string; published_at: string | null }[]
  licitacoes: { pncp_id: string; objeto: string; orgao: string | null; uf: string | null; municipio: string | null; valor_estimado: number | null; link: string | null }[]
  paginas: typeof PAGINAS[number][]
}

export async function pesquisar(t: string, limite = 20): Promise<Resultados> {
  const out: Resultados = { artigos: [], licitacoes: [], paginas: [...buscarPaginas(t)] }
  const db = pub()
  if (!db) return out
  const p = `%${t}%`
  const [a, l] = await Promise.all([
    db.from('nj_articles').select('slug,title,lede,category,published_at').eq('sector', 'construcao')
      .or(`title.ilike.${p},lede.ilike.${p},body_md.ilike.${p}`).order('published_at', { ascending: false }).limit(limite),
    db.from('nj_licitacoes').select('pncp_id,objeto,orgao,uf,municipio,valor_estimado,link').eq('is_obra', true)
      .or(`objeto.ilike.${p},orgao.ilike.${p},municipio.ilike.${p}`).order('publicado_em', { ascending: false }).limit(limite),
  ])
  out.artigos = (a.data ?? []) as Resultados['artigos']
  out.licitacoes = (l.data ?? []) as Resultados['licitacoes']
  return out
}
