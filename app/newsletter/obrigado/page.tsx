export const metadata = { title: 'Agradecemos seu cadastro' }

export default async function Obrigado({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams
  return (
    <div className="article" style={{ textAlign: 'center' }}>
      {erro ? (
        <>
          <h1>Link inválido</h1>
          <p className="lede">Este link de confirmação não é válido ou já foi usado. Faça uma nova inscrição em <a href="/newsletter">/newsletter</a>.</p>
        </>
      ) : (
        <>
          <h1>Agradecemos seu cadastro</h1>
          <p className="lede">Você se inscreveu para receber boletins informativos.</p>
          <p>Sua inscrição foi registrada. Assim que o envio dos e-mails estiver ativo, você receberá uma mensagem que explicará como confirmar o e-mail, definir suas preferências de boletim e cancelar a inscrição.</p>
          <p><a className="btn" href="/">Voltar às notícias</a></p>
        </>
      )}
    </div>
  )
}
