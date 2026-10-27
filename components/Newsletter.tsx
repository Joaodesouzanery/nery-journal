'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

/** Chamadas para a página /newsletter (o cadastro completo, com consentimento, fica lá). */
export default function Newsletter({ variant }: { variant: 'button' | 'bar' | 'box' }) {
  const [hidden, setHidden] = useState(false)
  const path = usePathname()

  if (variant === 'button') return <a className="btn accent" href="/newsletter">Receber newsletter</a>
  if (variant === 'box') {
    return (
      <div className="signup">
        <h3>Receba o Boletim Nery Journal</h3>
        <p>Notícias, indicadores e licitações de obras direto na sua caixa de entrada.</p>
        <a className="btn" href="/newsletter">Cadastrar</a>
      </div>
    )
  }
  if (hidden || path.startsWith('/newsletter')) return null
  return (
    <div className="bar" role="region" aria-label="Newsletter">
      <div className="wrap">
        <p><b>Assine o Boletim Nery Journal</b>Notícias, indicadores e licitações de obras com fonte e licença identificadas.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <a className="btn accent" href="/newsletter">Cadastrar</a>
          <button className="btn" onClick={() => setHidden(true)}>Fechar</button>
        </div>
      </div>
    </div>
  )
}
