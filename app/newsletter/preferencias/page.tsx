import { Suspense } from 'react'
import PrefsForm from '@/components/PrefsForm'

export const metadata = { title: 'Preferências da newsletter', robots: { index: false, follow: false } }

export default function Preferencias() {
  return (
    <div className="wrap" style={{ maxWidth: 820, padding: '40px 24px 80px' }}>
      <h1 className="h1" style={{ marginTop: 0 }}>Preferências</h1>
      <Suspense fallback={<p>Carregando…</p>}><PrefsForm /></Suspense>
    </div>
  )
}
