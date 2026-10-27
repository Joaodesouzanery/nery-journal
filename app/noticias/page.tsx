import { getArticles, fmtDate, INDICADORES_PLACEHOLDER, LICITACOES_PLACEHOLDER } from '@/lib/data'
import { NewsCard } from '@/components/Cards'
import Newsletter from '@/components/Newsletter'
import AdSlot from '@/components/AdSlot'
import Link from 'next/link'

export const revalidate = 300
export const metadata = { title: 'Últimas notícias' }

export default async function Noticias() {
  const items = await getArticles(40)
  const [featured, ...rest] = items
  return (
    <div className="wrap">
      <h1 className="h1" id="busca">Últimas notícias</h1>
      {featured && (
        <section className="feature">
          <Link href={`/construcao/${featured.slug}`} className="cover img cat-mercado" style={{ aspectRatio: '16/10', minHeight: 200 }}>
            {featured.is_placeholder && <span className="badge">EXEMPLO</span>}
          </Link>
          <div>
            <div className="tag">{featured.category}</div>
            <h2><Link href={`/construcao/${featured.slug}`} style={{ textDecoration: 'none' }}>{featured.title}</Link></h2>
            <div className="date" style={{ color: 'var(--muted)', fontSize: 14 }}>{fmtDate(featured.published_at)}</div>
          </div>
          <Newsletter variant="box" />
        </section>
      )}
      <div className="layout">
        <section className="cards" aria-label="Notícias">
          {rest.map((a) => <NewsCard key={a.slug} a={a} />)}
        </section>
        <aside className="side">
          <AdSlot slot="mpu" />
          <section id="indicadores">
            <h3>Indicadores</h3>
            <ul>
              {INDICADORES_PLACEHOLDER.map((i) => (
                <li key={i.nome}><b style={{ fontWeight: 500 }}>{i.nome}</b><small>{i.valor} · {i.fonte}</small></li>
              ))}
            </ul>
            <small style={{ color: 'var(--muted)' }}>Exemplo: preenchido pelo coletor de dados abertos.</small>
          </section>
          <section id="licitacoes">
            <h3>Licitações de obras</h3>
            <ul>
              {LICITACOES_PLACEHOLDER.map((l) => (
                <li key={l.titulo}>{l.titulo}<small>{l.info}</small></li>
              ))}
            </ul>
            <small style={{ color: 'var(--muted)' }}>Exemplo: fonte PNCP, valores acima de R$ 5 milhões.</small>
          </section>
        </aside>
      </div>
    </div>
  )
}
