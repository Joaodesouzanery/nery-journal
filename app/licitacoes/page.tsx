import Link from 'next/link'
import { getLicitacoes, brl } from '@/lib/licitacoes'
import { UFS } from '@/lib/constants'
import { fmtDate } from '@/lib/data'

export const revalidate = 600
export const metadata = { title: 'Licitações de obras' }

export default async function Licitacoes({ searchParams }: { searchParams: Promise<{ uf?: string }> }) {
  const { uf: raw } = await searchParams
  const uf = (UFS as readonly string[]).includes(raw ?? '') ? raw : undefined
  const all = await getLicitacoes({ days: 7 })
  const rows = uf ? all.filter((r) => r.uf === uf) : all
  const count: Record<string, number> = {}
  for (const r of all) if (r.uf) count[r.uf] = (count[r.uf] ?? 0) + 1
  return (
    <div className="wrap">
      <h1 className="h1">Licitações de obras</h1>
      <p style={{ maxWidth: 720 }}>Obras e serviços de engenharia publicados nos últimos 7 dias no PNCP, por estado. O PNCP é a fonte oficial: confira sempre o edital de origem. A cobertura pode ser incompleta em municípios pequenos.</p>
      <div className="ufs" style={{ margin: '16px 0' }}>
        <Link className={`uf ${!uf ? 'on' : ''}`} href="/licitacoes">Todos ({all.length})</Link>
        {UFS.filter((u) => count[u]).map((u) => <Link key={u} className={`uf ${uf === u ? 'on' : ''}`} href={`/licitacoes?uf=${u}`}>{u} ({count[u]})</Link>)}
      </div>
      {rows.length === 0 ? (
        <div className="disclosure">Ainda não há licitações coletadas. A coleta diária começa quando as chaves forem configuradas.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #111' }}><th>UF</th><th>Objeto</th><th>Órgão</th><th>Valor estimado</th><th>Publicado</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.pncp_id} style={{ borderBottom: '1px solid #ddd', verticalAlign: 'top' }}>
                  <td>{r.uf}</td>
                  <td>{r.objeto.slice(0, 200)}</td>
                  <td>{r.orgao}{r.municipio ? ` · ${r.municipio}` : ''}</td>
                  <td>{brl(r.valor_estimado)}</td>
                  <td>{fmtDate(r.publicado_em)}</td>
                  <td>{r.link && <a href={r.link} target="_blank" rel="noopener noreferrer">Edital</a>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="signup" style={{ marginTop: 32 }}>
        <h3>Filtros, histórico e exportação CSV</h3>
        <p>Plano Pro por R$ 9,99/mês para os 10 primeiros assinantes.</p>
        <Link className="btn accent" href="/licitacoes/pro">Ver o plano Pro</Link>
      </div>
    </div>
  )
}
