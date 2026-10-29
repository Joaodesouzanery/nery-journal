'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const SEGMENTS = ['Construtora / incorporadora', 'Engenharia e projetos', 'Fornecedor de materiais', 'Saneamento / utilities', 'Órgão público', 'Banco / financeira', 'Outro']
const OPEN = ['/privacidade', '/politica-editorial', '/sobre', '/newsletter', '/licitacoes/pro', '/colunistas', '/card', '/social', '/relatorio']
const KEY = 'nj_registered'
const CONSENT = 'Concordo em me cadastrar no Nery Journal e que meu e-mail e dados profissionais sejam usados para liberar o acesso e para comunicações do Nery Journal. Posso cancelar a qualquer momento.'

/** Cadastro gratuito obrigatório para ler o site (uma vez por navegador). Páginas legais e do Pro ficam abertas. */
export default function RegistrationGate() {
  const path = usePathname()
  const [need, setNeed] = useState(false)
  const [f, setF] = useState({ name: '', email: '', company: '', segment: '', consent: false, website: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try { setNeed(!localStorage.getItem(KEY) && !OPEN.some((p) => path.startsWith(p))) } catch { setNeed(false) }
  }, [path])
  useEffect(() => { document.body.style.overflow = need ? 'hidden' : '' }, [need])
  if (!need) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('')
    const r = await fetch('/api/cadastro', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...f, page: path }) })
    const j = await r.json().catch(() => ({}))
    setBusy(false)
    if (!r.ok) { setErr(j.error ?? 'Não foi possível enviar agora.'); return }
    try { localStorage.setItem(KEY, '1') } catch {}
    setNeed(false)
  }

  return (
    <div className="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <form className="gate-box" onSubmit={submit}>
        <h2 id="gate-title">Cadastre-se grátis para continuar</h2>
        <p>Notícias, dados e saneamento para quem constrói o Brasil. Leva menos de um minuto.</p>
        <label>Nome<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" maxLength={120} /></label>
        <label>E-mail<input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" maxLength={254} /></label>
        <label>Empresa ou órgão (opcional)<input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} autoComplete="organization" maxLength={120} /></label>
        <label>Segmento
          <select value={f.segment} onChange={(e) => setF({ ...f, segment: e.target.value })}><option value="">Selecione</option>{SEGMENTS.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        <input type="text" name="website" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
        <label className="chk"><input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} /> <span>{CONSENT} <a href="/privacidade">Política de Privacidade</a>.</span></label>
        {err && <p role="alert" style={{ color: '#b3261e', margin: 0 }}>{err}</p>}
        <button className="btn accent" type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Entrar e ler as notícias'}</button>
      </form>
    </div>
  )
}
