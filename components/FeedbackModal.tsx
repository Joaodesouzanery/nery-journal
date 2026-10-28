'use client'
import { useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

async function send(body: Record<string, unknown>) {
  const r = await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  return r.ok ? null : ((await r.json().catch(() => null))?.error as string | undefined) ?? 'Não foi possível enviar agora.'
}

/** Aba lateral "Feedback": nota de 1 a 5, comentário e e-mail opcional. */
export function FeedbackModal() {
  const ref = useRef<HTMLDialogElement>(null)
  const path = usePathname()
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [err, setErr] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setState('sending'); setErr('')
    const m = await send({ kind: 'site', rating: rating || null, message, email, website, page: path })
    if (m) { setErr(m); setState('idle') } else setState('done')
  }
  return (
    <>
      <button type="button" className="feedback" onClick={() => ref.current?.showModal()}>Feedback</button>
      <dialog ref={ref} className="amodal" aria-labelledby="fb-title" onClick={(e) => { if (e.target === ref.current) ref.current?.close() }}>
        <div className="amodal-in">
          <button type="button" className="amodal-x" aria-label="Fechar" onClick={() => ref.current?.close()}>×</button>
          {state === 'done' ? (
            <><h2 id="fb-title">Obrigado!</h2><p>Sua opinião ajuda a melhorar o Nery Journal.</p></>
          ) : (
            <form onSubmit={submit} className="fbform">
              <h2 id="fb-title">Como está sendo sua experiência?</h2>
              <div className="stars" role="radiogroup" aria-label="Nota de 1 a 5">
                {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} de 5`} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}>★</button>)}
              </div>
              <label>O que podemos melhorar? (opcional)<textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={4} placeholder="Notícias, licitações, filtros, o que sentiu falta…" /></label>
              <label>Seu e-mail, se quiser resposta (opcional)<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} autoComplete="email" /></label>
              <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
              {err && <p role="alert" style={{ color: '#b3261e' }}>{err}</p>}
              <button className="btn accent" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Enviando…' : 'Enviar'}</button>
            </form>
          )}
        </div>
      </dialog>
    </>
  )
}

/** "Esta matéria foi útil?" no fim de cada matéria. */
export function ArticleUseful({ slug }: { slug: string }) {
  const [sent, setSent] = useState<boolean | null>(null)
  const [err, setErr] = useState('')
  const vote = async (useful: boolean) => {
    const m = await send({ kind: 'materia', useful, article_slug: slug, page: `/construcao/${slug}` })
    if (m) setErr(m); else setSent(useful)
  }
  return (
    <div className="useful">
      {sent === null ? (
        <><b>Esta matéria foi útil?</b><button type="button" className="btn ghost" onClick={() => vote(true)}>Sim</button><button type="button" className="btn ghost" onClick={() => vote(false)}>Não</button>{err && <small>{err}</small>}</>
      ) : <b>Obrigado pelo retorno{sent ? '!' : '. Vamos melhorar.'}</b>}
    </div>
  )
}
