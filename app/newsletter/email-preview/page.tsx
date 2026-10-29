import { confirmEmail, welcomeEmail, weeklyEmail, briefingEmail } from '@/lib/emails'

export const metadata = { title: 'Prévia dos e-mails', robots: { index: false, follow: false } }

export default function Preview() {
  const l = { prefsUrl: '#', unsubUrl: '#', privacyUrl: '#' }
  const docs = [
    ['Confirmação', confirmEmail({ name: 'Maria', confirmUrl: '#', ...l })],
    ['Boas-vindas', welcomeEmail({ name: 'Maria', ...l })],
    ['Boletim Pro diário (exemplo)', briefingEmail({ dateLabel: 'Quinta-feira, 29 de outubro de 2026', opening: 'Bom dia. Hoje: a jornada de 42 horas chega à construção, ferrovias ganham pauta no TCU e o que a IA pode economizar nas obras.', items: [{ category: 'Mercado', title: 'Redução da jornada: SindusCon-SP negocia aditivos às convenções', summary: 'A semana de 44 para 42 horas começa em 16 de dezembro. O sindicato negocia como adotar a nova jornada sem necessariamente pagar horas extras.', url: '#' }, { category: 'Infraestrutura', title: 'Ministério dos Transportes quer avançar no pacote ferroviário', summary: 'As conversas com o TCU devem ser intensificadas na próxima semana.', url: '#' }], indicators: [{ nome: 'Custo médio do m² (SINAPI)', valor: 'R$ 1.999,73' }, { nome: 'Selic', valor: 'exemplo' }], sponsor: { name: 'WCR Saneamento', imageUrl: '/ads/wcr-728x90.png', url: '#' }, shareUrl: '#', ...l })],
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
