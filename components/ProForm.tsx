'use client'
import { useState } from 'react'
import { UFS, PRO_CONSENT } from '@/lib/constants'

export default function ProForm() {
  const [state, setState] = useState<'idle' | 'busy' | 'ok'>('idle')
  const [err, setErr] = useState('')
  const [ufs, setUfs] = useState<string[]>([])
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('busy'); setErr('')
    const f = Object.fromEntries(new FormData(e.currentTarget).entries())
    const r = await fetch('/api/pro', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...f, ufs }) })
    const out = await r.json().catch(() => ({}))
    if (r.ok) setState('ok'); else { setErr(out.error ?? 'Não foi possível enviar agora.'); setState('idle') }
  }
  if (state === 'ok') return <div className="disclosure">Interesse registrado. Assim que o pagamento for confirmado, enviaremos o acesso à sua lista.</div>
  return (
    <form className="nform" onSubmit={submit}>
      <label>E-mail*<input name="email" type="email" required maxLength={254} /></label>
      <fieldset><legend>Estados</legend>
        <div className="ufs">{UFS.map((u) => <label key={u} className={`uf ${ufs.includes(u) ? 'on' : ''}`}><input type="checkbox" checked={ufs.includes(u)} onChange={() => setUfs((p) => p.includes(u) ? p.filter((x) => x !== u) : [...p, u])} />{u}</label>)}</div>
      </fieldset>
      <div className="grid2">
        <label>Palavras-chave (separadas por vírgula)<input name="keywords" maxLength={200} placeholder="pavimentação, saneamento" /></label>
        <label>Valor mínimo (R$)<input name="min_value" inputMode="numeric" maxLength={14} placeholder="0" /></label>
      </div>
      <label className="chk"><input type="checkbox" name="consent" required /><span>{PRO_CONSENT}</span></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      {err && <p className="ferr" role="alert">{err}</p>}
      <button className="btn accent" disabled={state === 'busy'}>{state === 'busy' ? 'Enviando…' : 'Registrar interesse'}</button>
    </form>
  )
}
