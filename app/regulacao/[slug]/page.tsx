import type { Metadata } from 'next'
import { getArticle } from '@/lib/data'
import { ArticleView } from '@/components/ArticleView'

export const revalidate = 300
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticle((await params).slug, 'regulacao')
  return a ? { title: a.title, description: a.lede } : { title: 'Matéria não encontrada' }
}

export default async function ArticleRegula({ params }: Props) {
  const a = await getArticle((await params).slug, 'regulacao')
  return <div className="theme-regula"><ArticleView a={a} /></div>
}
