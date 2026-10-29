import Link from 'next/link'
import { getArticles } from '@/lib/data'
import { getProByToken } from '@/lib/licitacoes'
import { UFS } from '@/lib/constants'
import { NewsCard } from '@/components/Cards'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Meu feed Pro', robots: { index: false, follow: false } }

type SP = { token?: string; cat?: string | string[]; uf?: string | string[] }
const list = (v?: string | string[]) => (Array.isArray(v) ? v : v ? [v] : [])

/** Feed filtrado do assinante Pro: assuntos e estados combinados (ex.: Saneamento em SP). Acesso por link privado. */
export default async function ProFeed({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const pro = sp.token ? await getProByToken(sp.token) : null
  if (!pro || pro.status !== 'ativo') {
    return (
      <div className="article">
        <h1>Meu feed Pro</h1>
        <p className="lede">Este espaço é do <Link href="/licitacoes/pro">Nery Journal Pro</Link>: escolha assuntos e estados (por exemplo, Saneamento em São Paulo) e acompanhe só o que importa para o seu negócio.</p>
        <p>Já é assinante? Abra o link privado que enviamos para o seu e-mail.</p>
      </div>
    )
  }
  const items = await getArticles(400)
  const cats = [...new Set(items.map((a) => a.category))].sort()
  const ufs = [...new Set(items.map((a) => a.uf).filter((u): u is string => !!u))].sort()
  const selCats = list(sp.cat).filter((c) => cats.includes(c))
  const selUfs = list(sp.uf).filter((u) => (UFS as readonly string[]).includes(u))
  const shown = items.filter((a) => (!selCats.length || selCats.includes(a.category)) && (!selUfs.length || (a.uf != null && selUfs.includes(a.uf)))).slice(0, 60)
  return (
    <div className="wrap">
      <h1 className="h1">Meu feed Pro</h1>
      <form className="lic-filtros" method="get" action="/pro/feed">
        <input type="hidden" name="token" value={sp.token} />
        <fieldset style={{ border: 0, padding: 0, margin: 0, gridColumn: '1 / -1' }}>
          <legend style={{ fontSize: 12, color: '#6b757d' }}>Assuntos</legend>
          <div className="ufs">{cats.map((c) => <label key={c} className="uf" style={{ cursor: 'pointer' }}><input type="checkbox" name="cat" value={c} defaultChecked={selCats.includes(c)} /> {c}</label>)}</div>
        </fieldset>
        <fieldset style={{ border: 0, padding: 0, margin: 0, gridColumn: '1 / -1' }}>
          <legend style={{ fontSize: 12, color: '#6b757d' }}>Estados</legend>
          <div className="ufs">{(ufs.length ? ufs : [...UFS]).map((u) => <label key={u} className="uf" style={{ cursor: 'pointer' }}><input type="checkbox" name="uf" value={u} defaultChecked={selUfs.includes(u)} /> {u}</label>)}</div>
        </fieldset>
        <button className="btn accent" type="submit">Filtrar</button>
      </form>
      <p className="lic-count">{shown.length} matéria{shown.length === 1 ? '' : 's'}</p>
      {shown.length === 0 ? <div className="disclosure">Nada com esses filtros ainda. As matérias novas entram ao longo do dia.</div> : <div className="cards">{shown.map((a) => <NewsCard key={a.slug} a={a} />)}</div>}
    </div>
  )
}
