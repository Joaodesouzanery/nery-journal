import { proSeatsTaken } from '@/lib/licitacoes'
import { PRO_SEATS, PRO_PRICE } from '@/lib/constants'
import ProForm from '@/components/ProForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Licitações Pro' }

export default async function Pro() {
  const taken = await proSeatsTaken()
  const left = taken == null ? null : Math.max(0, PRO_SEATS - taken)
  const checkout = process.env.NEXT_PUBLIC_PRO_CHECKOUT_URL
  return (
    <div className="article">
      <h1>Licitações Pro</h1>
      <p className="lede">Oferta de lançamento: <b>R$ {PRO_PRICE}/mês</b> para os {PRO_SEATS} primeiros assinantes{left != null && <> — restam <b>{left}</b></>}. O preço sobe depois; quem entra agora mantém o valor enquanto o plano estiver ativo.</p>
      <ul>
        <li>Lista filtrada por seus estados, palavras-chave e valor mínimo, com histórico de 90 dias.</li>
        <li>Exportação em CSV.</li>
        <li>Alertas por e-mail assim que o envio de e-mails estiver ativo.</li>
      </ul>
      <p className="src">Os dados vêm do PNCP (fonte oficial); o serviço é a organização, o filtro e os alertas, não o acesso ao dado público. Direito de arrependimento de 7 dias (CDC, art. 49). Termos e política de privacidade em revisão.</p>
      {checkout && left !== 0 && <p><a className="btn accent" href={checkout} target="_blank" rel="noopener noreferrer">Assinar por R$ {PRO_PRICE}/mês</a></p>}
      {left === 0 && <div className="disclosure">As vagas da oferta acabaram. Deixe seu e-mail para ser avisado do próximo valor.</div>}
      <h2>Registrar interesse e filtros</h2>
      <p>Informe seu e-mail e o que quer acompanhar. Após o pagamento, ativamos seu acesso e você recebe o link privado da sua lista.</p>
      <ProForm />
    </div>
  )
}
