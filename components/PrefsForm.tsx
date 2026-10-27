'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { UFS } from '@/lib/constants'

type Prefs = { ufs: string[]; boletim: boolean; analises: boolean; eventos: boolean; alerts_licitacoes: boolean; alerts_normas: boolean; parceiros: boolean }
const EMPTY: Prefs = { ufs: [], boletim: false, analises: false, eventos: false, alerts_licitacoes: false, alerts_normas: false, parceiros: false }

export default function PrefsForm() {
  const token = useSearchParams().get('token') ?? ''
  const confirmed = useSearchParams().get('confirmado') === '1'
  const [prefs, setPrefs] = useState<Prefs>(EMPTY)
  const [name, setName] = useState('')
  const [state, setState] = useState<'loading' | 'ready' | 'invalid' | 'saved'>(token ? 'loading' : 'invalid')

  useEffect(() => {
    if (!token) return
    fetch(`/api/newsletter/prefs?token=${encodeURIComponent(token)}`).then(async (r) => {
      if (!r.ok) return setState('invalid')
      const { profile } = await r.json()
      setName(profile.first_name ?? '')
      const p = Array.isArray(profile.nj_subscriber_prefs) ? profile.nj_subscriber_prefs[0] : profile.nj_subscriber_prefs
      setPrefs({ ...EMPTY, ...(p ?? {}) })
      setState('ready')
    }).catch(() => setState('invalid'))
  }, [token])

  const set = (k: keyof Prefs) => (e: React.ChangeEvent<HTMLInputElement>) => setPrefs((p) => ({ ...p, [k]: e.target.checked }))
  const toggleUf = (u: string) => setPrefs((p) => ({ ...p, ufs: p.ufs.includes(u) ? p.ufs.filter((x) => x !== u) : [...p.ufs, u] }))

  async function save() {
    const r = await fetch('/api/newsletter/prefs', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, ...prefs }) })
    setState(r.ok ? 'saved' : 'invalid')
  }

  if (state === 'loading') return <p>Carregando…</p>
  if (state === 'invalid') return <p>Link inválido ou a newsletter ainda não está configurada.</p>
  if (state === 'saved') return <><h2>Preferências salvas</h2><p>Obrigado! Suas preferências foram atualizadas.</p></>

  return (
    <div className="nform">
      {confirmed && <div className="disclosure">E-mail confirmado. Obrigado{name ? `, ${name}` : ''}!</div>}
      <h2>Suas preferências</h2>
      <fieldset>
        <legend>Conteúdos</legend>
        <label className="chk"><input type="checkbox" checked={prefs.boletim} onChange={set('boletim')} /><span>Boletim Nery Journal</span></label>
        <label className="chk"><input type="checkbox" checked={prefs.analises} onChange={set('analises')} /><span>Análises</span></label>
        <label className="chk"><input type="checkbox" checked={prefs.eventos} onChange={set('eventos')} /><span>Eventos</span></label>
        <label className="chk"><input type="checkbox" checked={prefs.alerts_licitacoes} onChange={set('alerts_licitacoes')} /><span>Alertas de licitações por estado</span></label>
        <label className="chk"><input type="checkbox" checked={prefs.alerts_normas} onChange={set('alerts_normas')} /><span>Alertas de normas</span></label>
        <label className="chk"><input type="checkbox" checked={prefs.parceiros} onChange={set('parceiros')} /><span>Conteúdo de parceiros</span></label>
      </fieldset>
      <fieldset>
        <legend>Estados de interesse</legend>
        <div className="ufs">{UFS.map((u) => <label key={u} className={`uf ${prefs.ufs.includes(u) ? 'on' : ''}`}><input type="checkbox" checked={prefs.ufs.includes(u)} onChange={() => toggleUf(u)} />{u}</label>)}</div>
      </fieldset>
      <button className="btn accent" onClick={save}>Salvar preferências</button>
      <p className="consent" style={{ marginTop: 24 }}>Quer parar de receber tudo? <a href={`/newsletter/cancelar?token=${encodeURIComponent(token)}`}>Cancelar todas as comunicações</a>.</p>
    </div>
  )
}
