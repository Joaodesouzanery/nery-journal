import Link from 'next/link'
import { getArticles } from '@/lib/data'
import { getLicitacoes, brl } from '@/lib/licitacoes'
import { ehSaneamento } from '@/lib/radar'
import { NewsCard } from '@/components/Cards'
import { fmtDate } from '@/lib/data'

export const revalidate = 600
export const metadata = { title: 'Saneamento', description: 'Notícias e licitações de saneamento básico: água, esgoto, drenagem e resíduos.' }

export default async function Saneamento() {
  const [arts, lics] = await Promise.all([getArticles(100), getLicitacoes({ days: 14, limit: 500 })])
  const noticias = arts.filter((a) => a.category === 'Saneamento' || ehSaneamento(a.title)).slice(0, 24)
  const obras = lics.filter((l) => ehSaneamento(l.objeto)).sort((a, b) => (b.valor_estimado ?? 0) - (a.valor_estimado ?? 0)).slice(0, 15)
  return (
    <div className="wrap">
      <h1 className="h1">Saneamento</h1>
      <p style={{ maxWidth: 720 }}>Água, esgoto, drenagem e resíduos: licitações de obras de saneamento publicadas nos últimos 14 dias no PNCP e as notícias do setor no Brasil e no mundo.</p>

      <section style={{ margin: '28px 0 40px' }}>
        <h2 className="h2" style={{ fontWeight: 400, fontSize: 28 }}>Licitações de saneamento</h2>
        {obras.length === 0 ? (
          <div className="disclosure">Nenhuma licitação de saneamento coletada ainda no período.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #111' }}><th>UF</th><th>Objeto</th><th>Órgão</th><th>Valor estimado</th><th>Publicado</th><th></th></tr></thead>
              <tbody>
                {obras.map((r) => (
                  <tr key={r.pncp_id} style={{ borderBottom: '1px solid #ddd', verticalAlign: 'top' }}>
                    <td>{r.uf}</td><td>{r.objeto.slice(0, 180)}</td><td>{r.orgao}{r.municipio ? ` · ${r.municipio}` : ''}</td><td>{brl(r.valor_estimado)}</td><td>{fmtDate(r.publicado_em)}</td>
                    <td>{r.link && <a href={r.link} target="_blank" rel="noopener noreferrer">Edital</a>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ marginTop: 12 }}><Link href="/licitacoes?tema=saneamento">Ver todas as licitações de saneamento por estado →</Link></p>
      </section>

      <h2 className="h2">Notícias de saneamento</h2>
      {noticias.length > 0 ? <div className="cards">{noticias.map((a) => <NewsCard key={a.slug} a={a} />)}</div> : <div className="disclosure">Em breve, novas matérias de saneamento.</div>}
    </div>
  )
}
