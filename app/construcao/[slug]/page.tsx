import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getArticle, fmtDate } from '@/lib/data'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const a = await getArticle(slug)
  return a ? { title: a.title, description: a.lede } : { title: 'Matéria não encontrada' }
}

// Markdown mínimo e seguro: parágrafos e **negrito**, sem HTML bruto.
function renderBody(md: string) {
  return md.split(/\n{2,}/).map((p, i) => (
    <p key={i}>{p.split(/(\*\*[^*]+\*\*)/g).map((t, j) => (t.startsWith('**') ? <strong key={j}>{t.slice(2, -2)}</strong> : t))}</p>
  ))
}

export default async function Article({ params }: Props) {
  const { slug } = await params
  const a = await getArticle(slug)
  if (!a) notFound()
  return (
    <article className="article">
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>{a.category} • {fmtDate(a.published_at)}</div>
      <h1>{a.title}</h1>
      <p className="lede">{a.lede}</p>
      {a.is_placeholder && <div className="disclosure"><b>EXEMPLO.</b> Conteúdo fictício para validar o layout. Não é notícia.</div>}
      <div className="body">{renderBody(a.body_md)}</div>
      {a.ai_assisted && <div className="disclosure">Produzido com apoio de IA e revisado por editor.</div>}
      <div className="src">
        <b>Fontes</b>
        <ul>
          {a.sources.map((s, i) => <li key={i}>{s.url ? <a href={s.url} rel="noopener noreferrer">{s.name}</a> : s.name}{s.primary ? ' (fonte primária)' : ''}</li>)}
        </ul>
      </div>
    </article>
  )
}
