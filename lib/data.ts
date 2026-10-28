import { createClient } from '@supabase/supabase-js'
import { classificarTema } from './radar'
import type { Tema } from './radar'

export interface ArticleRow {
  slug: string
  sector: 'construcao' | 'regulacao'
  category: string
  title: string
  lede: string
  body_md: string
  sources: { name: string; url: string; primary?: boolean }[]
  published_at: string | null
  is_placeholder: boolean
  ai_assisted: boolean
  photo_url?: string | null
  uf?: string | null
  cover?: { numero: string; legenda: string } | null
}

// ---------------------------------------------------------------------------
// PLACEHOLDERS: conteúdo de EXEMPLO, claramente rotulado no site. Nada aqui é notícia real.
// Aparecem só quando o banco não tem artigos publicados.
// ---------------------------------------------------------------------------
const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString()
const ph = (slug: string, category: string, title: string, daysAgo: number): ArticleRow => ({
  slug, sector: 'construcao', category, title,
  lede: 'Texto de exemplo para validar o layout. Substitua por matéria real, escrita a partir de fonte primária e revisada por editor.',
  body_md: 'Este é um conteúdo de **exemplo**.\n\nNo lugar dele entram os fatos verificados, o contexto e o "por que importa para obras", sempre com as fontes listadas ao final.',
  sources: [{ name: 'Fonte primária (exemplo)', url: '', primary: true }],
  published_at: d(daysAgo), is_placeholder: true, ai_assisted: true,
})

export const PLACEHOLDERS: ArticleRow[] = [
  ph('exemplo-custo-da-construcao', 'Mercado', 'Exemplo: custo da construção — indicador mensal e o que muda no orçamento da obra', 1),
  ph('exemplo-licitacao-de-obra', 'Infraestrutura', 'Exemplo: licitação de obra pública acima de R$ 5 milhões entra na pauta', 2),
  ph('exemplo-materiais', 'Materiais', 'Exemplo: preços de materiais de construção e o efeito no custo do m²', 3),
  ph('exemplo-credito-imobiliario', 'Crédito', 'Exemplo: crédito imobiliário e juros — o que a construtora precisa acompanhar', 4),
  ph('exemplo-emprego-no-setor', 'Mercado', 'Exemplo: emprego formal na construção civil no mês', 6),
  ph('exemplo-seguranca-na-obra', 'Segurança', 'Exemplo: regra de segurança do trabalho em canteiros muda prazo de adequação', 8),
  ph('exemplo-tecnologia-bim', 'Tecnologia', 'Exemplo: BIM e drones no acompanhamento de obras', 10),
  ph('exemplo-saneamento', 'Infraestrutura', 'Exemplo: investimentos em saneamento e contratos de concessão', 12),
  ph('exemplo-habitacao', 'Habitação', 'Exemplo: programa habitacional e lançamentos imobiliários', 14),
]

export const INDICADORES_PLACEHOLDER = [
  { nome: 'Meta Selic', valor: '— (aguardando coleta)', fonte: 'Banco Central' },
  { nome: 'INCC-M (mensal)', valor: '— (aguardando coleta)', fonte: 'FGV IBRE' },
  { nome: 'CUB/m² (SP)', valor: '— (aguardando coleta)', fonte: 'SindusCon-SP' },
]

export const LICITACOES_PLACEHOLDER = [
  { titulo: 'Exemplo: Concorrência eletrônica — obra de pavimentação', info: 'Aguardando coleta do PNCP' },
  { titulo: 'Exemplo: Pregão — reforma de unidade pública', info: 'Aguardando coleta do PNCP' },
  { titulo: 'Exemplo: Concorrência — saneamento básico', info: 'Aguardando coleta do PNCP' },
]

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
}

const COLS = 'slug,sector,category,title,lede,body_md,sources,published_at,is_placeholder,ai_assisted,photo_id,cover,uf'

export async function getArticles(limit = 30): Promise<ArticleRow[]> {
  const db = client()
  if (!db) return PLACEHOLDERS
  try {
    const { data, error } = await db.from('nj_articles').select(COLS).eq('sector', 'construcao')
      .order('published_at', { ascending: false }).limit(limit)
    if (error || !data || data.length === 0) return PLACEHOLDERS
    const rows = data as (ArticleRow & { photo_id?: string | null })[]
    // Fotos livres (CC0/domínio público) ligadas à matéria; sem foto, o site usa a ilustração do tema.
    const ids = [...new Set(rows.map((r) => r.photo_id).filter((x): x is string => !!x))]
    if (ids.length) {
      const { data: photos } = await db.from('nj_photos').select('id,url').in('id', ids)
      const byId = new Map((photos ?? []).map((p: { id: string; url: string }) => [p.id, p.url]))
      for (const r of rows) r.photo_url = r.photo_id ? byId.get(r.photo_id) ?? null : null
    }
    return rows
  } catch {
    return PLACEHOLDERS
  }
}

export interface Indicador { nome: string; valor: string; fonte: string; url: string | null }

/** Último valor de cada indicador de dados abertos coletado (BCB, IBGE, Banco Mundial). Vazio se ainda não houve coleta. */
export async function getIndicadores(): Promise<Indicador[]> {
  const db = client()
  if (!db) return []
  try {
    const { data } = await db.from('nj_pauta_items').select('external_id,title,summary,url,created_at').eq('kind', 'dado')
      .order('created_at', { ascending: false }).limit(60)
    const seen = new Set<string>()
    const out: Indicador[] = []
    for (const r of (data ?? []) as { external_id: string; title: string; summary: string | null; url: string | null }[]) {
      const key = r.external_id.split(':')[0]
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ nome: r.title, valor: '', fonte: (/Fonte: ([^.]+)/.exec(r.summary ?? '')?.[1] ?? '').trim(), url: r.url })
    }
    return out.slice(0, 8)
  } catch {
    return []
  }
}

export interface RadarItem { id: string; title: string; url: string; snippet: string | null; published_at: string | null; source: string; kind: string; lang: 'pt' | 'en'; tema: Tema }

const EN_HOSTS = /\.(co\.uk|com\.au|co\.za)\b|constructiondive|enr\.com|dezeen|construction\.com|constructionexec|equipmentworld|smartcitiesdive|highways\.today|globalconstructionreview|bdcnetwork|newcivilengineer|constructionnews|constructionenquirer|theconstructionindex|buildaustralia/

/** Radar do setor: manchetes dos feeds das fontes, com link para o original. Só título, link e trecho curto; nunca o texto da matéria. */
export async function getRadar(limit = 60): Promise<RadarItem[]> {
  const db = client()
  if (!db) return []
  try {
    const [{ data: items }, { data: sources }] = await Promise.all([
      db.from('nj_pauta_items').select('id,source_id,title,url,summary,published_at,created_at').eq('kind', 'noticia')
        .order('published_at', { ascending: false, nullsFirst: false }).limit(limit * 3),
      db.from('nj_sources').select('id,name,kind'),
    ])
    const names = new Map((sources ?? []).map((x: { id: string; name: string; kind: string }) => [x.id, x]))
    const perSource = new Map<string, number>()
    const out: RadarItem[] = []
    for (const r of (items ?? []) as { id: string; source_id: string; title: string; url: string | null; summary: string | null; published_at: string | null }[]) {
      if (!r.url) continue
      const n = perSource.get(r.source_id) ?? 0
      if (n >= 6) continue // nenhuma fonte domina o radar
      perSource.set(r.source_id, n + 1)
      const src = names.get(r.source_id)
      out.push({ id: r.id, title: r.title, url: r.url, snippet: r.summary, published_at: r.published_at, source: src?.name ?? r.source_id, kind: src?.kind ?? 'veiculo', lang: EN_HOSTS.test(r.url) ? 'en' : 'pt', tema: classificarTema(r.title) })
      if (out.length >= limit) break
    }
    return out
  } catch {
    return []
  }
}

export async function getArticle(slug: string): Promise<ArticleRow | null> {
  const all = await getArticles(100)
  return all.find((a) => a.slug === slug) ?? null
}

export interface Campaign {
  id: string
  advertiser: string
  slot: string
  image_url: string | null
  alt_text: string | null
  headline: string | null
  link_url: string
  label: string
}

/** Campanha ativa para o espaço (RLS só expõe campanhas ativas e dentro do período). */
export async function getCampaign(slot: string): Promise<Campaign | null> {
  const db = client()
  if (!db) return null
  try {
    const { data } = await db.from('nj_campaigns').select('id,advertiser,slot,image_url,alt_text,headline,link_url,label')
      .eq('slot', slot).order('created_at', { ascending: false }).limit(1)
    return (data?.[0] as Campaign | undefined) ?? null
  } catch {
    return null
  }
}

export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
