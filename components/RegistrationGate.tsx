'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const SEGMENTS = ['Construtora / incorporadora', 'Engenharia e projetos', 'Fornecedor de materiais', 'Saneamento / utilities', 'Órgão público', 'Banco / financeira', 'Outro']
const OPEN = ['/privacidade', '/politica-editorial', '/sobre', '/newsletter', '/licitacoes/pro', '/colunistas', '/card', '/social', '/relatorio']
const KEY = 'nj_registered'
const SKIP = 'nj_gate_skip'
const DELAY_MS = 20000 // aparece depois de 20 s de navegação
const SKIP_DAYS = 7
const CONSENT = 'Concordo em me cadastrar no Nery Journal e que meu e-mail e dados profissionais sejam usados para liberar o acesso e para comunicações do Nery Journal. Posso cancelar a qualquer momento.'

/** Cadastro gratuito obrigatório para ler o site (uma vez por navegador). Páginas legais e do Pro ficam abertas. */
export default function RegistrationGate() {
  const path = usePathname()
  const [need, setNeed] = useState(false)
  const [f, setF] = useState({ name: '', email: '', company: '', segment: '', consent: false, website: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    try {
      const skipped = Number(localStorage.getItem(SKIP) ?? 0)
      const blocked = localStorage.getItem(KEY) || OPEN.some((p) => path.startsWith(p)) || (skipped && Date.now() - skipped < SKIP_DAYS * 86400000)
      if (!blocked) t = setTimeout(() => setNeed(true), DELAY_MS)
      else setNeed(false)
    } catch { setNeed(false) }
    return () => { if (t) clearTimeout(t) }
  }, [path])
  const dismiss = () => { try { localStorage.setItem(SKIP, String(Date.now())) } catch {} setNeed(false) }
  useEffect(() => {
    if (!need) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [need])
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
    <div className="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title" onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}>
      <form className="gate-box" onSubmit={submit}>
        <button type="button" className="gate-x" aria-label="Fechar" onClick={dismiss}>×</button>
        <h2 id="gate-title">Cadastre-se grátis no Nery Journal</h2>
        <p>Receba novidades e acesso aos conteúdos para quem constrói o Brasil. Leva menos de um minuto, e você pode fechar e continuar lendo.</p>
        <label>Nome<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" maxLength={120} /></label>
        <label>E-mail<input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" maxLength={254} /></label>
        <label>Empresa ou órgão (opcional)<input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} autoComplete="organization" maxLength={120} /></label>
        <label>Segmento
          <select value={f.segment} onChange={(e) => setF({ ...f, segment: e.target.value })}><option value="">Selecione</option>{SEGMENTS.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        <input type="text" name="website" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
        <label className="chk"><input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} /> <span>{CONSENT} <a href="/privacidade">Política de Privacidade</a>.</span></label>
        {err && <p role="alert" style={{ color: '#b3261e', margin: 0 }}>{err}</p>}
        <button className="btn accent" type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Cadastrar'}</button>
      </form>
    </div>
  )
}
