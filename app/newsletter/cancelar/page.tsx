import { Suspense } from 'react'
import CancelForm from '@/components/CancelForm'

export const metadata = { title: 'Cancelar inscrição', robots: { index: false, follow: false } }

export default function Cancelar() {
  return (
    <div className="article">
      <h1>Cancelar inscrição</h1>
      <Suspense fallback={<p>Carregando…</p>}><CancelForm /></Suspense>
    </div>
  )
}
