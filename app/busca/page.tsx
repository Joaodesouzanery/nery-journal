import Link from 'next/link'
import { pesquisar, sanitizarTermo } from '@/lib/search'
import { brl } from '@/lib/licitacoes'
import { fmtDate } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Pesquisar', robots: { index: false, follow: false } }

type Tipo = 'tudo' | 'noticias' | 'licitacoes' | 'paginas'

export default async function Busca({ searchParams }: { searchParams: Promise<{ q?: string; tipo?: string }> }) {
  const { q, tipo: t } = await searchParams
  const termo = sanitizarTermo(q)
  const tipo: Tipo = (['noticias', 'licitacoes', 'paginas'] as const).find((x) => x === t) ?? 'tudo'
  const r = termo ? await pesquisar(termo, tipo === 'tudo' ? 10 : 50) : null
  const n = r ? { noticias: r.artigos.length, licitacoes: r.licitacoes.length, paginas: r.paginas.length } : null
  const total = n ? n.noticias + n.licitacoes + n.paginas : 0
  const href = (x: Tipo) => `/busca?q=${encodeURIComponent(termo ?? '')}${x === 'tudo' ? '' : `&tipo=${x}`}`
  const show = (x: Exclude<Tipo, 'tudo'>) => tipo === 'tudo' || tipo === x
  return (
    <div className="wrap">
      <h1 className="h1">Pesquisar</h1>
      <form className="busca-form" action="/busca" role="search">
        <input type="search" name="q" defaultValue={q ?? ''} placeholder="Notícias, licitações, saneamento, cidade…" aria-label="Pesquisar no site" minLength={2} required autoFocus />
        <button className="btn accent" type="submit">Pesquisar</button>
      </form>
      {!termo && <p className="lead">Digite ao menos 2 letras para pesquisar em matérias, licitações e páginas do site.</p>}
      {r && n && (
        <>
          <p className="lic-count">{total} resultado{total === 1 ? '' : 's'} para “{termo}”</p>
          <div className="ufs">
            <Link className={`uf ${tipo === 'tudo' ? 'on' : ''}`} href={href('tudo')}>Tudo ({total})</Link>
            <Link className={`uf ${tipo === 'noticias' ? 'on' : ''}`} href={href('noticias')}>Matérias ({n.noticias})</Link>
            <Link className={`uf ${tipo === 'licitacoes' ? 'on' : ''}`} href={href('licitacoes')}>Licitações ({n.licitacoes})</Link>
            <Link className={`uf ${tipo === 'paginas' ? 'on' : ''}`} href={href('paginas')}>Páginas ({n.paginas})</Link>
          </div>
          {total === 0 && <div className="disclosure">Nada encontrado. Tente outra palavra, por exemplo “esgoto”, “pavimentação” ou o nome de uma cidade.</div>}
          {show('noticias') && r.artigos.length > 0 && (
            <section className="home-sec"><h2 className="h2">Matérias</h2>
              <ul className="home-list">{r.artigos.map((a) => <li key={a.slug}><Link href={`/construcao/${a.slug}`}><span className="tag">{a.category}</span><span>{a.title}<br /><small style={{ color: '#6b757d' }}>{fmtDate(a.published_at)}</small></span></Link></li>)}</ul>
            </section>
          )}
          {show('licitacoes') && r.licitacoes.length > 0 && (
            <section className="home-sec"><h2 className="h2">Licitações</h2>
              <ul className="lic-list">{r.licitacoes.map((l) => (
                <li key={l.pncp_id} className="lic-item">
                  <div className="lic-top"><span className="lic-uf">{l.uf}</span></div>
                  <h3>{l.objeto.slice(0, 220)}</h3>
                  <div className="lic-bot"><div className="lic-org">{l.orgao}{l.municipio ? ` · ${l.municipio}` : ''}</div><div className="lic-val">{brl(l.valor_estimado)}</div>{l.link && <a className="lic-link" href={l.link} target="_blank" rel="noopener noreferrer">Abrir edital ↗</a>}</div>
                </li>))}</ul>
              <p><Link href={`/licitacoes?q=${encodeURIComponent(termo ?? '')}`}>Ver todas na página de licitações →</Link></p>
            </section>
          )}
          {show('paginas') && r.paginas.length > 0 && (
            <section className="home-sec"><h2 className="h2">Páginas do site</h2>
              <ul className="home-list">{r.paginas.map((p) => <li key={p.url}><Link href={p.url}><span className="tag">Página</span>{p.titulo}</Link></li>)}</ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
