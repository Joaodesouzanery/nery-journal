'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

/** Chamadas para a página /newsletter (o cadastro completo, com consentimento, fica lá). */
export default function Newsletter({ variant }: { variant: 'button' | 'bar' | 'box' }) {
  const [hidden, setHidden] = useState(false)
  const path = usePathname()

  if (variant === 'button') return <a className="btn accent" href="/newsletter">Receber boletim (Pro)</a>
  if (variant === 'box') {
    return (
      <div className="signup">
        <h3>Boletim Nery Journal (Pro)</h3>
        <p>O resumo diário completo, com filtros por assunto e estado. Entre na lista de espera.</p>
        <a className="btn" href="/newsletter">Entrar na lista</a>
      </div>
    )
  }
  if (hidden || path.startsWith('/newsletter')) return null
  return (
    <div className="bar" role="region" aria-label="Newsletter">
      <div className="wrap">
        <p><b>Boletim Nery Journal (Pro)</b>O resumo diário completo, com filtros por assunto e estado.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <a className="btn accent" href="/newsletter">Entrar na lista</a>
          <button className="btn" onClick={() => setHidden(true)}>Fechar</button>
        </div>
      </div>
    </div>
  )
}
