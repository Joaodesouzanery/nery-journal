import { getArticles } from '@/lib/data'
import { NewsCard } from '@/components/Cards'

export const revalidate = 600
export const metadata = { title: 'GN Regulação', description: 'Regulação de infraestrutura no Brasil: agências reguladoras, consultas públicas, resoluções e decisões. Do Grupo Nery.' }

export default async function Regulacao() {
  const arts = await getArticles(60, 'regulacao')
  return (
    <div className="wrap theme-regula">
      <div className="regula-brand">GN Regulação <span>do Grupo Nery</span></div>
      <p style={{ maxWidth: 720 }}>Agências reguladoras, consultas públicas, resoluções e decisões que mexem com saneamento, energia, transportes e infraestrutura.</p>
      {arts.length > 0
        ? <div className="cards">{arts.map((a) => <NewsCard key={a.slug} a={a} />)}</div>
        : <div className="disclosure">Novas matérias em breve.</div>}
    </div>
  )
}
