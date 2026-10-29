import { getArticles, getIndicadores, fmtDate, INDICADORES_PLACEHOLDER, LICITACOES_PLACEHOLDER } from '@/lib/data'
import { getLicitacoes, brl } from '@/lib/licitacoes'
import { NewsCard, Visual } from '@/components/Cards'
import Newsletter from '@/components/Newsletter'
import Link from 'next/link'

export const revalidate = 300
export const metadata = { title: 'Últimas notícias' }

export default async function Noticias({ searchParams }: { searchParams: Promise<{ cat?: string; p?: string }> }) {
  const { cat, p } = await searchParams
  const [items, indicadores, lics] = await Promise.all([getArticles(400), getIndicadores(), getLicitacoes({ days: 7, limit: 100 })])
  const topLics = [...lics].sort((a, b) => (b.valor_estimado ?? 0) - (a.valor_estimado ?? 0)).slice(0, 5)
  const cats = [...new Set(items.map((a) => a.category))]
  const ufs = [...new Set(items.map((a) => a.uf).filter((u): u is string => !!u))].sort()
  const all = items.filter((a) => !cat || a.category === cat)
  const PER = 24
  const pages = Math.max(1, Math.ceil(all.length / PER))
  const page = Math.min(pages, Math.max(1, Number(p) || 1))
  const shown = all.slice((page - 1) * PER, page * PER)
  const [featured, ...rest] = shown
  const q = (o: { cat?: string; p?: number }) => { const sp = new URLSearchParams(); const m = { cat, ...o }; if (m.cat) sp.set('cat', m.cat); if (m.p && m.p > 1) sp.set('p', String(m.p)); const t = sp.toString(); return `/noticias${t ? `?${t}` : ''}` }
  return (
    <div className="wrap">
      <h1 className="h1">Últimas notícias</h1>
      <div className="ufs" aria-label="Filtrar por assunto">
        <Link className={`uf ${!cat ? 'on' : ''}`} href={q({ cat: undefined })}>Tudo ({items.length})</Link>
        {cats.map((c) => <Link key={c} className={`uf ${cat === c ? 'on' : ''}`} href={q({ cat: c })}>{c}</Link>)}
      </div>
      {ufs.length > 0 && (
        <div className="ufs" aria-label="Filtrar por estado (Pro)">
          {ufs.map((u) => <Link key={u} className="uf locked" href="/licitacoes/pro" title="Filtro por estado é do Nery Journal Pro">🔒 {u}</Link>)}
          <span className="pro-hint">Filtros por estado e assunto combinados: <Link href="/licitacoes/pro">Nery Journal Pro</Link></span>
        </div>
      )}
      {featured && (
        <section className="feature">
          <Link href={`/construcao/${featured.slug}`} className="cover img cat-mercado" style={{ aspectRatio: '16/10', minHeight: 200 }}>
            <Visual a={featured} />
          </Link>
          <div>
            <div className="tag">{featured.category}</div>
            <h2><Link href={`/construcao/${featured.slug}`} style={{ textDecoration: 'none' }}>{featured.title}</Link></h2>
            <div className="date" style={{ color: 'var(--muted)', fontSize: 14 }}>{fmtDate(featured.published_at)}</div>
          </div>
          <Newsletter variant="box" />
        </section>
      )}
      {!featured && <div className="disclosure">Nenhuma matéria com esses filtros.</div>}
      <div className="layout">
        <section aria-label="Notícias">
          <div className="cards">{rest.map((a) => <NewsCard key={a.slug} a={a} />)}</div>
          {pages > 1 && (
            <nav className="pager" aria-label="Páginas">
              {page > 1 && <Link className="btn" href={q({ p: page - 1 })}>← Mais recentes</Link>}
              <span>Página {page} de {pages}</span>
              {page < pages && <Link className="btn accent" href={q({ p: page + 1 })}>Mais antigas →</Link>}
            </nav>
          )}
        </section>
        <aside className="side">
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
