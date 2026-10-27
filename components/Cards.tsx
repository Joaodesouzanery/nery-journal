import Link from 'next/link'
import { fmtDate } from '@/lib/data'
import type { ArticleRow } from '@/lib/data'

const catClass = (c: string) => 'cat-' + c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '')
const href = (a: ArticleRow) => `/construcao/${a.slug}`

/** Cartão escuro (estilo "Latest insights"): fundo gráfico por categoria, sem foto até haver imagem licenciada. */
export function CoverCard({ a, className = '' }: { a: ArticleRow; className?: string }) {
  return (
    <Link href={href(a)} className={`cover ${catClass(a.category)} ${className}`}>
      {a.is_placeholder && <span className="badge">EXEMPLO</span>}
      <div className="in">
        <div className="meta"><u>{a.category}</u> • {fmtDate(a.published_at)}</div>
        <h3>{a.title}</h3>
      </div>
    </Link>
  )
}

/** Cartão branco (estilo "Latest news"). */
export function NewsCard({ a }: { a: ArticleRow }) {
  return (
    <Link href={href(a)} className="card">
      <div className={`cover img ${catClass(a.category)}`} style={{ borderRadius: 0 }}>
        {a.is_placeholder && <span className="badge">EXEMPLO</span>}
      </div>
      <div className="body">
        <div className="tag">{a.category}</div>
        <h3>{a.title}</h3>
        <div className="date">{fmtDate(a.published_at)}</div>
      </div>
    </Link>
  )
}
