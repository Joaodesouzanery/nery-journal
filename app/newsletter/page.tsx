import NewsletterForm from '@/components/NewsletterForm'

export const metadata = { title: 'Boletim Nery Journal' }

export default function NewsletterPage() {
  return (
    <>
      <section className="nhero">
        <div className="wrap">
          <h1>Inscreva-se para receber o Boletim Nery Journal</h1>
          <p>Receba notícias, indicadores e licitações de obras direto no seu e-mail. Escolha os conteúdos e os estados que importam para o seu negócio. Você pode cancelar a inscrição a qualquer momento.</p>
        </div>
      </section>
      <div className="wrap"><NewsletterForm /></div>
    </>
  )
}
