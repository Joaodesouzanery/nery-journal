import Link from 'next/link'
import { getArticles, getIndicadores } from '@/lib/data'
import { ehSaneamento } from '@/lib/radar'
import { CoverCard, NewsCard } from '@/components/Cards'
import AdSlot from '@/components/AdSlot'
import Newsletter from '@/components/Newsletter'

export const revalidate = 300

const isDados = (a: { sources: { primary?: boolean }[] }) => a.sources.some((s) => s.primary)

export default async function Home() {
  const [items, indicadores] = await Promise.all([getArticles(40), getIndicadores()])
  const [a, b, c, d, ...rest] = items
  const analises = items.filter(isDados).slice(0, 4)
  const sanea = items.filter((x) => x.category === 'Saneamento' || ehSaneamento(x.title)).slice(0, 3)
  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1 className="h1">Destaques</h1>
          <p className="lead">Notícias, dados e licitações para quem constrói o Brasil, com fontes identificadas e revisão editorial.</p>
        </div>
      </div>

      <section className="insights" aria-label="Notícias em destaque">
        {a && <CoverCard a={a} className="a big" />}
        {b && <CoverCard a={b} className="b" />}
        {c && <CoverCard a={c} className="c" />}
        {d && <CoverCard a={d} className="d" />}
      </section>

      {indicadores.length > 0 && (
        <section id="indicadores" aria-label="Indicadores" className="home-sec ind-strip">
          <h2 className="h2">Indicadores</h2>
          <div className="ind-grid">
            {indicadores.slice(0, 6).map((i) => <div key={i.nome} className="ind"><b>{i.nome}</b><small>{i.fonte ? `Fonte: ${i.fonte}` : ''}</small></div>)}
          </div>
        </section>
      )}

      <AdSlot slot="inline" />

      {rest.length > 0 && (
        <section aria-label="Todas as notícias">
          <h2 className="h2">Todas as notícias</h2>
          <div className="cards">{rest.slice(0, 9).map((x) => <NewsCard key={x.slug} a={x} />)}</div>
          <div className="more"><Link className="btn" href="/noticias">Ver todas as notícias</Link></div>
        </section>
      )}

      {analises.length > 0 && (
        <section aria-label="Análises e dados" className="home-sec">
          <h2 className="h2">Análises e dados</h2>
          <ul className="home-list">
            {analises.map((x) => <li key={x.slug}><Link href={`/construcao/${x.slug}`}><span className="tag">{x.category}</span>{x.title}</Link></li>)}
          </ul>
        </section>
      )}

      {sanea.length > 0 && (
        <section aria-label="Saneamento" className="home-sec">
          <h2 className="h2">Saneamento</h2>
          <div className="cards">{sanea.map((x) => <NewsCard key={x.slug} a={x} />)}</div>
          <div className="more"><Link className="btn" href="/saneamento">Ver saneamento</Link></div>
        </section>
      )}

      <div style={{ maxWidth: 560, margin: '28px 0' }}><Newsletter variant="box" /></div>
    </div>
  )
}
