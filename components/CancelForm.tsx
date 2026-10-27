'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function CancelForm() {
  const token = useSearchParams().get('token') ?? ''
  const [state, setState] = useState<'idle' | 'done' | 'error'>('idle')
  async function go() {
    const r = await fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, { method: 'POST' })
    setState(r.ok ? 'done' : 'error')
  }
  if (state === 'done') return <p>Inscrição cancelada. Você não receberá mais comunicações do Nery Journal.</p>
  return (
    <>
      <p>Ao confirmar, você deixa de receber o boletim, alertas e conteúdos de parceiros.</p>
      {state === 'error' && <p className="ferr">Link inválido ou o serviço ainda não está configurado.</p>}
      <button className="btn solid" onClick={go} disabled={!token}>Cancelar todas as comunicações</button>
    </>
  )
}
