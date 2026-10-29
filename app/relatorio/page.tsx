import { getArticles, getIndicadores, fmtDate } from '@/lib/data'
import { getLicitacoes, brl } from '@/lib/licitacoes'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Relatório Nery do Setor', robots: { index: false, follow: false } }

const weekNo = (d: Date) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((+t - +y0) / 86400000 + 1) / 7) }

/** Relatório semanal (2–3 páginas, A4): abra e use "Salvar como PDF". Arquivo do assinante Pro. */
export default async function Relatorio() {
  const now = new Date()
  const [arts, ind, lics] = await Promise.all([getArticles(80), getIndicadores(), getLicitacoes({ days: 7, limit: 400 })])
  const week = arts.filter((a) => a.published_at && +now - +new Date(a.published_at) < 7 * 86400000)
  const top = week.slice(0, 8)
  const obras = [...lics].sort((a, b) => (b.valor_estimado ?? 0) - (a.valor_estimado ?? 0)).slice(0, 6)
  const prazos = lics.filter((l) => l.encerramento_proposta && new Date(l.encerramento_proposta) > now).sort((a, b) => +new Date(a.encerramento_proposta!) - +new Date(b.encerramento_proposta!)).slice(0, 8)
  return (
    <div className="report">
      <header className="rep-head">
        <div><b>Relatório Nery do Setor</b><br /><small>Nº {weekNo(now)} · semana de {fmtDate(new Date(+now - 6 * 86400000).toISOString())} a {fmtDate(now.toISOString())}</small></div>
        <div style={{ textAlign: 'right' }}><b>Nery Journal</b><br /><small>Grupo Nery · Construção e Saneamento</small></div>
      </header>
      <section><h2>Resumo da semana</h2>
        <ul>{top.map((a) => <li key={a.slug}><b>{a.title}</b> <small>({a.category}{a.uf ? ` · ${a.uf}` : ''})</small></li>)}</ul>
      </section>
      {ind.length > 0 && <section><h2>Indicadores</h2><ul>{ind.slice(0, 6).map((i) => <li key={i.nome}>{i.nome}{i.fonte ? <small> — {i.fonte}</small> : null}</li>)}</ul></section>}
      {obras.length > 0 && <section><h2>Principais obras licitadas</h2>
        <table><thead><tr><th>UF</th><th>Objeto</th><th>Valor</th></tr></thead><tbody>{obras.map((l) => <tr key={l.pncp_id}><td>{l.uf}</td><td>{l.objeto.slice(0, 120)}</td><td>{brl(l.valor_estimado)}</td></tr>)}</tbody></table></section>}
      {prazos.length > 0 && <section><h2>Agenda de prazos (propostas até)</h2>
        <table><thead><tr><th>Data</th><th>UF</th><th>Objeto</th></tr></thead><tbody>{prazos.map((l) => <tr key={l.pncp_id}><td>{fmtDate(l.encerramento_proposta)}</td><td>{l.uf}</td><td>{l.objeto.slice(0, 100)}</td></tr>)}</tbody></table></section>}
      <section><h2>Análise do colunista</h2><p><i>Espaço reservado a um colunista convidado. Quer assinar uma coluna? Fale com neryadministrativo@gmail.com.</i></p></section>
      <footer><small>Fontes: PNCP, IBGE, Banco Mundial e veículos citados em cada matéria. Os dados de licitações vêm do PNCP; confira sempre o edital de origem. © Grupo Nery.</small></footer>
      <p className="noprint"><small>Para gerar o PDF: Ctrl/Cmd + P → Salvar como PDF.</small></p>
    </div>
  )
}
