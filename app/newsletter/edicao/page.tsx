import { getArticles, getIndicadores, getCampaign } from '@/lib/data'
import { briefingEmail } from '@/lib/emails'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Edição do boletim', robots: { index: false, follow: false } }

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nery-journal-joaodesouzanerys-projects.vercel.app').replace(/\/$/, '')
const abs = (u: string) => (u.startsWith('http') ? u : `${SITE}${u}`)

/** Interno: monta a edição do dia do Boletim Pro com as matérias reais. Copie o HTML e cole no provedor de e-mail. */
export default async function Edicao() {
  const [arts, ind, sponsor] = await Promise.all([getArticles(12), getIndicadores(), getCampaign('top')])
  const top = arts.filter((a) => !a.is_placeholder).slice(0, 5)
  const date = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' })
  const html = briefingEmail({
    dateLabel: date.charAt(0).toUpperCase() + date.slice(1),
    opening: `Bom dia. ${top.length ? `Hoje: ${top.slice(0, 3).map((a) => a.title.replace(/[.!?]$/, '')).join('; ')}.` : 'As principais notícias de obras e saneamento do Brasil e do mundo.'}`,
    items: top.map((a) => ({ category: a.category, title: a.title, summary: a.lede, url: `${SITE}/construcao/${a.slug}`, imageUrl: a.photo_url && a.photo_kind !== 'logo' ? abs(a.photo_url) : undefined })),
    indicators: ind.slice(0, 4).map((i) => ({ nome: i.nome, valor: '' })),
    sponsor: sponsor?.image_url ? { name: sponsor.advertiser, imageUrl: abs(sponsor.image_url), url: sponsor.link_url.startsWith('http') ? sponsor.link_url : SITE } : undefined,
    shareUrl: SITE,
    prefsUrl: `${SITE}/newsletter/preferencias`, unsubUrl: `${SITE}/newsletter/cancelar`, privacyUrl: `${SITE}/privacidade`,
  })
  return (
    <div className="wrap">
      <h1 className="h1">Edição do boletim</h1>
      <p className="lead">Prévia da edição de hoje (5 principais notícias, indicadores e patrocinador). Copie o HTML abaixo e cole no seu provedor de e-mail quando escolher um.</p>
      <iframe title="Prévia" srcDoc={html} style={{ width: '100%', height: 720, border: '1px solid #ddd', borderRadius: 8 }} />
      <h2 className="h2">HTML para copiar</h2>
      <textarea readOnly value={html} rows={10} style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }} />
    </div>
  )
}
