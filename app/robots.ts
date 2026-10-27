import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const indexable = process.env.NEXT_PUBLIC_INDEXABLE === '1'
  const site = process.env.NEXT_PUBLIC_SITE_URL
  return indexable
    ? { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/r/', '/licitacoes/meu', '/newsletter/preferencias'] }, ...(site ? { sitemap: `${site}/sitemap.xml` } : {}) }
    : { rules: { userAgent: '*', disallow: '/' } }
}
