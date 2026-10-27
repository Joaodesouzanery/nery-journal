'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UFS, SEGMENTS, JOB_ROLES, CONSENT_BOLETIM, CONSENT_ALERTAS, CONSENT_PARCEIROS } from '@/lib/constants'

export default function NewsletterForm() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [ufs, setUfs] = useState<string[]>([])
  const toggleUf = (u: string) => setUfs((p) => (p.includes(u) ? p.filter((x) => x !== u) : [...p, u]))

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setErr('')
    const f = new FormData(e.currentTarget)
    const on = (k: string) => f.get(k) === 'on'
    const body = {
      email: f.get('email'), first_name: f.get('first_name'), last_name: f.get('last_name'), company: f.get('company'),
      job_role: f.get('job_role'), segment: f.get('segment'), country: 'Brasil', ufs,
      boletim: on('boletim'), analises: on('analises'), eventos: on('eventos'),
      alerts_licitacoes: on('alerts_licitacoes'), alerts_normas: on('alerts_normas'), parceiros: on('parceiros'),
      website: f.get('website'), source_url: typeof window !== 'undefined' ? window.location.pathname : '',
    }
    try {
      const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      const out = await res.json().catch(() => ({}))
      if (res.ok) router.push('/newsletter/obrigado')
      else setErr(out.error ?? 'Não foi possível concluir agora.')
    } catch { setErr('Sem conexão. Tente novamente.') }
    setBusy(false)
  }

  return (
    <form className="nform" onSubmit={submit} noValidate={false}>
      <h2>Informações pessoais</h2>
      <p className="req">* campo obrigatório</p>
      <div className="grid2">
        <label>Nome*<input name="first_name" required maxLength={120} placeholder="Digite seu nome" autoComplete="given-name" /></label>
        <label>Sobrenome*<input name="last_name" required maxLength={120} placeholder="Digite seu sobrenome" autoComplete="family-name" /></label>
      </div>
      <label>E-mail*<input name="email" type="email" required maxLength={254} placeholder="voce@empresa.com.br" autoComplete="email" /></label>
      <label>Empresa*<input name="company" required maxLength={120} placeholder="Nome da empresa" autoComplete="organization" /></label>
      <div className="grid2">
        <label>Cargo<select name="job_role" defaultValue=""><option value="">Selecione</option>{JOB_ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
        <label>Segmento<select name="segment" defaultValue=""><option value="">Selecione</option>{SEGMENTS.map((s) => <option key={s}>{s}</option>)}</select></label>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />

      <h2>Boletim e conteúdos</h2>
      <fieldset>
        <legend>Escolha o que deseja receber</legend>
        <label className="chk"><input type="checkbox" name="boletim" defaultChecked={false} /><span><b>Boletim Nery Journal</b> — resumo semanal de notícias, indicadores e licitações.</span></label>
        <label className="chk"><input type="checkbox" name="analises" /><span><b>Análises</b> — contexto e impacto para quem constrói.</span></label>
        <label className="chk"><input type="checkbox" name="eventos" /><span><b>Eventos</b> — feiras, congressos e treinamentos do setor.</span></label>
        <p className="consent">{CONSENT_BOLETIM}</p>
      </fieldset>

      <fieldset>
        <legend>Alertas</legend>
        <label className="chk"><input type="checkbox" name="alerts_licitacoes" /><span><b>Licitações de obras por estado</b> — avisos de editais (recurso em validação).</span></label>
        <label className="chk"><input type="checkbox" name="alerts_normas" /><span><b>Normas e regras</b> — mudanças que afetam obras e engenharia.</span></label>
        <p className="consent">{CONSENT_ALERTAS}</p>
      </fieldset>

      <fieldset>
        <legend>Estados de interesse</legend>
        <div className="ufs">
          {UFS.map((u) => (
            <label key={u} className={`uf ${ufs.includes(u) ? 'on' : ''}`}><input type="checkbox" checked={ufs.includes(u)} onChange={() => toggleUf(u)} />{u}</label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Conteúdo de parceiros (opcional)</legend>
        <label className="chk"><input type="checkbox" name="parceiros" /><span>Quero receber ofertas e comunicados de patrocinadores.</span></label>
        <p className="consent">{CONSENT_PARCEIROS}</p>
      </fieldset>

      <p className="consent">Idioma: Português. Para saber como tratamos seus dados, veja a <a href="/privacidade">Política de Privacidade</a>*. Nenhuma caixa vem marcada por padrão.</p>
      {err && <p className="ferr" role="alert">{err}</p>}
      <button className="btn accent" disabled={busy}>{busy ? 'Enviando…' : 'Enviar'}</button>
    </form>
  )
}
