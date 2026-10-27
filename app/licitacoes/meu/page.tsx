import { getProByToken, getProLicitacoes, brl } from '@/lib/licitacoes'
import { fmtDate } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Minhas licitações', robots: { index: false, follow: false } }

export default async function Meu({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams
  const p = await getProByToken(token)
  if (!p || p.status !== 'ativo') return <div className="article"><h1>Acesso indisponível</h1><p>Link inválido ou plano ainda não ativado.</p></div>
  const rows = await getProLicitacoes(p)
  return (
    <div className="wrap">
      <h1 className="h1">Minhas licitações</h1>
      <p>Filtros: {p.ufs.join(', ') || 'todos os estados'} · {p.keywords.join(', ') || 'sem palavra-chave'} · mínimo {brl(p.min_value)} · {rows.length} resultados (90 dias). <a href={`/licitacoes/meu/csv?token=${encodeURIComponent(token)}`}>Baixar CSV</a></p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <tbody>{rows.map((r) => (
          <tr key={r.pncp_id} style={{ borderBottom: '1px solid #ddd', verticalAlign: 'top' }}>
            <td>{r.uf}</td><td>{r.objeto.slice(0, 200)}</td><td>{r.orgao}</td><td>{brl(r.valor_estimado)}</td><td>{fmtDate(r.publicado_em)}</td>
            <td>{r.link && <a href={r.link} target="_blank" rel="noopener noreferrer">Edital</a>}</td>
          </tr>))}</tbody>
      </table>
    </div>
  )
}
