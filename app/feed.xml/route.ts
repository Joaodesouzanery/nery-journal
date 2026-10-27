import { getArticles } from '@/lib/data'

export const revalidate = 1800
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c] as string))

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const items = (await getArticles(30)).filter((a) => !a.is_placeholder)
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Nery Journal — Construção</title><link>${esc(site)}</link><description>Notícias, indicadores e licitações de obras.</description><language>pt-BR</language>${items.map((a) => `<item><title>${esc(a.title)}</title><link>${esc(`${site}/construcao/${a.slug}`)}</link><guid>${esc(`${site}/construcao/${a.slug}`)}</guid>${a.published_at ? `<pubDate>${new Date(a.published_at).toUTCString()}</pubDate>` : ''}<description>${esc(a.lede)}</description></item>`).join('')}</channel></rss>`
  return new Response(body, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } })
}
