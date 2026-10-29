import NewsletterForm from '@/components/NewsletterForm'

export const metadata = { title: 'Boletim Nery Journal' }

export default function NewsletterPage() {
  return (
    <>
      <section className="nhero">
        <div className="wrap">
          <h1>Boletim Nery Journal, exclusivo do Pro</h1>
          <p>O Boletim completo, enviado todo dia útil, faz parte do Nery Journal Pro, com filtros por assunto e estado. Entre na lista de espera: avisamos assim que abrir e você garante a oferta de fundadores (R$ 9,99/mês para os 10 primeiros). O site, as notícias e os indicadores continuam grátis.</p>
        </div>
      </section>
      <div className="wrap"><NewsletterForm /></div>
    </>
  )
}
