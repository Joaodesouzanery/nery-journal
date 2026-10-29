import Link from 'next/link'
import { getLicitacoes, brl } from '@/lib/licitacoes'
import { UFS } from '@/lib/constants'
import { fmtDate } from '@/lib/data'
import { TEMAS_LIC, FAIXAS, filtrarLicitacoes, resumo, temaDe, temaNome, type Ordem } from '@/lib/licfilters'

export const revalidate = 600
export const metadata = { title: 'Licitações de obras e saneamento' }

type SP = { uf?: string; tema?: string; faixa?: string; modalidade?: string; dias?: string; q?: string; ordem?: string }

const DIAS = [7, 14, 30]
const nf = (n: number) => n.toLocaleString('pt-BR')

function qs(sp: SP, over: Partial<SP>) {
  const m = { ...sp, ...over }
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(m)) if (v) p.set(k, v)
  const s = p.toString()
  return `/licitacoes${s ? `?${s}` : ''}`
}

export default async function Licitacoes({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const uf = (UFS as readonly string[]).includes(sp.uf ?? '') ? sp.uf : undefined
  const dias = DIAS.includes(Number(sp.dias)) ? Number(sp.dias) : 14
  const ordem: Ordem = sp.ordem === 'valor' || sp.ordem === 'encerra' ? sp.ordem : 'recentes'
  const base = await getLicitacoes({ days: 30 })
  const noPeriodo = filtrarLicitacoes(base, { dias })
  const modalidades = [...new Set(noPeriodo.map((r) => r.modalidade).filter((m): m is string => !!m))].sort()
  const f = { uf, tema: sp.tema, faixa: sp.faixa, modalidade: sp.modalidade, dias, q: sp.q, ordem }
  const rows = filtrarLicitacoes(base, f)
  // contagens por UF e por tema já respeitam os outros filtros
  const porUf = resumo(filtrarLicitacoes(base, { ...f, uf: undefined })).porUf
  const r = resumo(rows)
  const countTema = (id: string) => filtrarLicitacoes(base, { ...f, tema: id }).length
  const ativo = !!(uf || sp.tema || sp.faixa || sp.modalidade || sp.q)
  const FREE = 10 // no plano gratuito só as 10 primeiras; a lista completa é do Pro
  const shown = rows.slice(0, FREE)

  return (
    <div className="wrap lic">
      <h1 className="h1">Licitações de obras e saneamento</h1>
      <p style={{ maxWidth: 760 }}>Editais de obras e serviços de engenharia publicados no PNCP, por estado. O PNCP é a fonte oficial: confira sempre o edital de origem. A cobertura pode ser incompleta em municípios pequenos.</p>

      <div className="lic-stats">
        <div><b>{nf(r.n)}</b><span>editais</span></div>
        <div><b>{brl(r.total)}</b><span>valor estimado somado</span></div>
        <div><b>{Object.keys(r.porUf).length}</b><span>estados</span></div>
      </div>

      <div className="ufs" aria-label="Tema">
        <Link className={`uf ${!sp.tema ? 'on' : ''}`} href={qs(sp, { tema: undefined })}>Todos os temas ({filtrarLicitacoes(base, { ...f, tema: undefined }).length})</Link>
        {TEMAS_LIC.map((t) => <Link key={t[0]} className={`uf ${sp.tema === t[0] ? 'on' : ''}`} href={qs(sp, { tema: t[0] })}>{t[1]} ({countTema(t[0])})</Link>)}
      </div>

      <form className="lic-filtros" method="get" action="/licitacoes">
        {sp.tema && <input type="hidden" name="tema" value={sp.tema} />}
        <label>Buscar<input type="search" name="q" defaultValue={sp.q ?? ''} placeholder="objeto, órgão ou cidade" /></label>
        <label>Estado
          <select name="uf" defaultValue={uf ?? ''}><option value="">Todos</option>{UFS.map((u) => <option key={u} value={u}>{u}{porUf[u] ? ` (${porUf[u]})` : ''}</option>)}</select>
        </label>
        <label>Valor
          <select name="faixa" defaultValue={sp.faixa ?? ''}><option value="">Qualquer</option>{FAIXAS.map((x) => <option key={x[0]} value={x[0]}>{x[1]}</option>)}</select>
        </label>
        <label>Modalidade
          <select name="modalidade" defaultValue={sp.modalidade ?? ''}><option value="">Todas</option>{modalidades.map((m) => <option key={m} value={m}>{m}</option>)}</select>
        </label>
        <label>Período
          <select name="dias" defaultValue={String(dias)}>{DIAS.map((d) => <option key={d} value={d}>Últimos {d} dias</option>)}</select>
        </label>
        <label>Ordenar
          <select name="ordem" defaultValue={ordem}><option value="recentes">Mais recentes</option><option value="valor">Maior valor</option><option value="encerra">Encerra primeiro</option></select>
        </label>
        <button className="btn accent" type="submit">Aplicar</button>
        {ativo && <Link className="btn ghost" href="/licitacoes">Limpar filtros</Link>}
      </form>

      <div className="ufs" aria-label="Estados">
        {Object.entries(porUf).sort((a, b) => b[1] - a[1]).map(([u, n]) => <Link key={u} className={`uf ${uf === u ? 'on' : ''}`} href={qs(sp, { uf: uf === u ? undefined : u })}>{u} ({n})</Link>)}
      </div>

      {rows.length === 0 ? (
        <div className="disclosure">Nenhum edital com esses filtros. Tente ampliar o período ou limpar os filtros.</div>
      ) : (
        <>
          <p className="lic-count">Mostrando {nf(shown.length)} de {nf(rows.length)} editais{rows.length > FREE && <> · <Link href="/licitacoes/pro">veja a lista completa no Nery Journal Pro</Link></>}</p>
          <ul className="lic-list">
            {shown.map((l) => {
              const t = temaDe(l.objeto)
              return (
                <li key={l.pncp_id} className="lic-item">
                  <div className="lic-top">
                    <span className="lic-uf">{l.uf}</span>
                    {t && <span className={`lic-tag t-${t}`}>{temaNome(t)}</span>}
                    {l.modalidade && <span className="lic-mod">{l.modalidade}</span>}
                    <span className="lic-date">Publicado em {fmtDate(l.publicado_em)}</span>
                  </div>
                  <h3>{l.objeto.length > 240 ? l.objeto.slice(0, 240) + '…' : l.objeto}</h3>
                  <div className="lic-bot">
                    <div className="lic-org">{l.orgao}{l.municipio ? ` · ${l.municipio}` : ''}</div>
                    <div className="lic-val">{brl(l.valor_estimado)}</div>
                    {l.encerramento_proposta && <div className="lic-end">Propostas até {fmtDate(l.encerramento_proposta)}</div>}
                    {l.link && <a className="lic-link" href={l.link} target="_blank" rel="noopener noreferrer">Abrir edital ↗</a>}
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
      <div className="signup" style={{ marginTop: 32 }}>
        <h3>Lista completa, histórico e CSV no Nery Journal Pro</h3>
        <p>Oferta de fundadores: R$ 9,99/mês para os 10 primeiros assinantes.</p>
        <Link className="btn accent" href="/licitacoes/pro">Conhecer o Pro</Link>
      </div>
    </div>
  )
}
