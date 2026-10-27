import type { Metadata } from 'next'
import './globals.css'
import { Header, Footer, TopAd } from '@/components/Chrome'
import Newsletter from '@/components/Newsletter'

const indexable = process.env.NEXT_PUBLIC_INDEXABLE === '1'

export const metadata: Metadata = {
  title: { default: 'Nery Journal — Construção', template: '%s | Nery Journal' },
  description: 'Notícias, indicadores e licitações do setor da construção, com fontes identificadas. Grupo Nery.',
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@300;400;500;600;800&display=swap" />
      </head>
      <body>
        {!indexable && <div className="notice"><b>Em construção.</b> Conteúdo de <b>exemplo</b> para validar o layout; nada aqui é notícia real.</div>}
        <Header />
        <TopAd />
        <main>{children}</main>
        <Footer />
        <a className="feedback" href="/sobre#contato">Feedback</a>
        <Newsletter variant="bar" />
      </body>
    </html>
  )
}
