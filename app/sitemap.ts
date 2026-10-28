import type { MetadataRoute } from 'next'
import { getArticles } from '@/lib/data'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  if (process.env.NEXT_PUBLIC_INDEXABLE !== '1') return []
  const articles = (await getArticles(200)).filter((a) => !a.is_placeholder)
  const fixed = ['/', '/noticias', '/licitacoes', '/licitacoes/pro', '/newsletter', '/sobre', '/politica-editorial', '/privacidade']
  return [
    ...fixed.map((p) => ({ url: `${site}${p}` })),
    ...articles.map((a) => ({ url: `${site}/construcao/${a.slug}`, lastModified: a.published_at ?? undefined })),
  ]
}
