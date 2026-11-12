import type { Metadata } from 'next'
import { getArticle } from '@/lib/data'
import { ArticleView } from '@/components/ArticleView'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const a = await getArticle(slug)
  return a ? { title: a.title, description: a.lede } : { title: 'Matéria não encontrada' }
}

export default async function Article({ params }: Props) {
  const { slug } = await params
  return <ArticleView a={await getArticle(slug)} />
}
