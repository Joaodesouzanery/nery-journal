import { getArticles, getIndicadores, fmtDate, INDICADORES_PLACEHOLDER, LICITACOES_PLACEHOLDER } from '@/lib/data'
import { getLicitacoes, brl } from '@/lib/licitacoes'
import { NewsCard } from '@/components/Cards'
import Newsletter from '@/components/Newsletter'
import AdSlot from '@/components/AdSlot'
import Link from 'next/link'
import Radar from '@/components/Radar'
import { getRadar } from '@/lib/data'

export const revalidate = 300
export const metadata = { title: 'Últimas notícias' }

export default async function Noticias() {
  const [items, indicadores, lics, radar] = await Promise.all([getArticles(40), getIndicadores(), getLicitacoes({ days: 7, limit: 100 }), getRadar(60)])
  const onlyExamples = items.every((a) => a.is_placeholder)
  const topLics = [...lics].sort((a, b) => (b.valor_estimado ?? 0) - (a.valor_estimado ?? 0)).slice(0, 5)
  const real = onlyExamples && radar.length > 0 ? [] : items
  const [featured, ...rest] = real
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
      {!featured && <div style={{ maxWidth: 520, margin: '8px 0 24px' }}><Newsletter variant="box" /></div>}
      <div className="layout">
        <section className="cards" aria-label="Notícias">
          {rest.map((a) => <NewsCard key={a.slug} a={a} />)}
          {radar.length > 0 && <div style={{ gridColumn: '1 / -1' }}><Radar items={radar} /></div>}
        </section>
        <aside className="side">
          <AdSlot slot="mpu" />
          <section id="indicadores">
            <h3>Indicadores</h3>
            {indicadores.length > 0 ? (
              <ul>
                {indicadores.map((i) => (
                  <li key={i.nome}>{i.nome}<small>{i.fonte ? `Fonte: ${i.fonte}` : ''}</small></li>
                ))}
              </ul>
            ) : (
              <>
                <ul>
                  {INDICADORES_PLACEHOLDER.map((i) => (
                    <li key={i.nome}><b style={{ fontWeight: 500 }}>{i.nome}</b><small>{i.valor} · {i.fonte}</small></li>
                  ))}
                </ul>
                <small style={{ color: 'var(--muted)' }}>Exemplo: preenchido pelo coletor de dados abertos.</small>
              </>
            )}
          </section>
          <section id="licitacoes">
            <h3>Licitações de obras</h3>
            {topLics.length > 0 ? (
              <>
                <ul>
                  {topLics.map((l) => (
                    <li key={l.pncp_id}>{l.link ? <a href={l.link} target="_blank" rel="noopener noreferrer">{l.objeto.slice(0, 110)}</a> : l.objeto.slice(0, 110)}<small>{l.uf} · {brl(l.valor_estimado)}</small></li>
                  ))}
                </ul>
                <small><Link href="/licitacoes">Ver todas por estado →</Link></small>
              </>
            ) : (
              <>
                <ul>
                  {LICITACOES_PLACEHOLDER.map((l) => (
                    <li key={l.titulo}>{l.titulo}<small>{l.info}</small></li>
                  ))}
                </ul>
                <small style={{ color: 'var(--muted)' }}>Exemplo: fonte PNCP, valores acima de R$ 5 milhões.</small>
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
