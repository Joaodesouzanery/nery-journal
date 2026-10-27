'use client'
import { useState } from 'react'

export default function AnuncieForm() {
  const [state, setState] = useState<'idle' | 'busy' | 'ok'>('idle')
  const [err, setErr] = useState('')
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('busy'); setErr('')
    const f = Object.fromEntries(new FormData(e.currentTarget).entries())
    const r = await fetch('/api/anuncie', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(f) })
    const out = await r.json().catch(() => ({}))
    if (r.ok) setState('ok'); else { setErr(out.error ?? 'Não foi possível enviar agora.'); setState('idle') }
  }
  if (state === 'ok') return <div className="disclosure">Recebemos seu contato. Retornaremos com o mídia kit e as condições.</div>
  return (
    <form className="nform" onSubmit={submit}>
      <div className="grid2">
        <label>Empresa*<input name="company" required maxLength={120} /></label>
        <label>Seu nome*<input name="contact_name" required maxLength={120} /></label>
      </div>
      <div className="grid2">
        <label>E-mail*<input name="email" type="email" required maxLength={254} /></label>
        <label>Telefone<input name="phone" maxLength={40} /></label>
      </div>
      <label>Mensagem<textarea name="message" rows={4} maxLength={1000} placeholder="Formato de interesse, período e objetivo da campanha" /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      {err && <p className="ferr" role="alert">{err}</p>}
      <button className="btn accent" disabled={state === 'busy'}>{state === 'busy' ? 'Enviando…' : 'Quero anunciar'}</button>
    </form>
  )
}
