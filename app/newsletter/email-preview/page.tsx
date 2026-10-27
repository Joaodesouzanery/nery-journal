import { confirmEmail, welcomeEmail, weeklyEmail } from '@/lib/emails'

export const metadata = { title: 'Prévia dos e-mails', robots: { index: false, follow: false } }

export default function Preview() {
  const l = { prefsUrl: '#', unsubUrl: '#', privacyUrl: '#' }
  const docs = [
    ['Confirmação', confirmEmail({ name: 'Maria', confirmUrl: '#', ...l })],
    ['Boas-vindas', welcomeEmail({ name: 'Maria', ...l })],
    ['Edição semanal (exemplo)', weeklyEmail({ items: [{ title: 'Exemplo de manchete', url: '#', category: 'Mercado' }], indicators: [{ nome: 'Selic', valor: 'exemplo' }], ...l })],
  ]
  return (
    <div className="wrap">
      <h1 className="h1">Prévia dos e-mails</h1>
      {docs.map(([t, h]) => (
        <section key={t}><h3>{t}</h3><iframe title={t} srcDoc={h} style={{ width: '100%', height: 560, border: '1px solid #ddd' }} /></section>
      ))}
    </div>
  )
}
