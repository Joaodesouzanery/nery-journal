import { getArticles } from '@/lib/data'
import { CoverCard } from '@/components/Cards'
import Link from 'next/link'
import Radar from '@/components/Radar'
import { getRadar } from '@/lib/data'

export const revalidate = 300

export default async function Home() {
  const [items, radar] = await Promise.all([getArticles(30), getRadar(12)])
  const [a, b, c, d, ...rest] = items
  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1 className="h1">Últimas análises</h1>
          <p className="lead">Dados, contexto e impacto para quem constrói. Cada matéria lista as fontes e é revisada por um editor antes de ser publicada.</p>
        </div>
        <select className="select" aria-label="Categoria" defaultValue="todas">
          <option value="todas">Todas as categorias</option>
          <option>Mercado</option><option>Infraestrutura</option><option>Materiais</option><option>Crédito</option><option>Segurança</option><option>Tecnologia</option>
        </select>
      </div>
      <section className="insights" aria-label="Destaques">
        {a && <CoverCard a={a} className="a big" />}
        {b && <CoverCard a={b} className="b" />}
        {c && <CoverCard a={c} className="c" />}
        {d && <CoverCard a={d} className="d" />}
      </section>
      {rest.length > 0 && (
        <section className="grid3" style={{ marginBottom: 32 }}>
          {rest.slice(0, 6).map((x) => <CoverCard key={x.slug} a={x} className="" />)}
        </section>
      )}
      <Radar items={radar} title="Radar do setor" />
      <div className="more"><Link className="btn" href="/noticias">Visualizar tudo</Link></div>
    </div>
  )
}
