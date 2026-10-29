import { proSeatsTaken } from '@/lib/licitacoes'
import { PRO_SEATS, PRO_PRICE } from '@/lib/constants'
import ProForm from '@/components/ProForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Nery Journal Pro', description: 'Boletim diário completo, painel de dados e radar de licitações para quem constrói o Brasil.' }

const BENEFICIOS = [
  ['Boletim Pro, todo dia útil', 'O resumo do que mudou para quem constrói, em 5 minutos, na sua caixa de entrada antes das 7h: notícias, indicadores e o que importa para a obra.'],
  ['Painel de dados', 'Custo da construção (SINAPI), juros, produção e investimento: séries históricas, comparativos e exportação em CSV.'],
  ['Radar de licitações', 'Lista completa de editais de obras e saneamento por estado, valor e tema, com histórico de 90 dias e CSV.'],
  ['Análises e arquivo', 'Acesso a todas as análises aprofundadas e ao arquivo completo, sem limite de leitura.'],
  ['Alertas por tema e estado', 'Avise-me quando sair algo de saneamento em SP, de rodovias em MG ou de qualquer assunto que você acompanha.'],
]

export default async function Pro() {
  const taken = await proSeatsTaken()
  const left = taken == null ? null : Math.max(0, PRO_SEATS - taken)
  const checkout = process.env.NEXT_PUBLIC_PRO_CHECKOUT_URL
  return (
    <div className="article">
      <h1>Nery Journal Pro</h1>
      <p className="lede">Tudo o que o Nery Journal acompanha, organizado para decidir mais rápido. <b>Oferta de fundadores: R$ {PRO_PRICE}/mês</b> para os {PRO_SEATS} primeiros assinantes{left != null && <> — restam <b>{left}</b></>}. Quem entra agora mantém o valor enquanto o plano estiver ativo.</p>
      <div className="valores" style={{ marginTop: 16 }}>
        {BENEFICIOS.map(([t, d]) => <section key={t} className="valor"><h3>{t}</h3><p>{d}</p></section>)}
      </div>
      <p><b>Continua grátis:</b> todas as notícias, indicadores principais e o Boletim Nery Journal semanal.</p>
      <p className="src">O serviço é a organização, o filtro, a análise e os alertas, não o acesso ao dado público. Dados de licitações vêm do PNCP (fonte oficial). Direito de arrependimento de 7 dias (CDC, art. 49). Termos e política de privacidade em revisão.</p>
      {checkout && left !== 0 && <p><a className="btn accent" href={checkout} target="_blank" rel="noopener noreferrer">Assinar por R$ {PRO_PRICE}/mês</a></p>}
      {!checkout && left !== 0 && <div className="disclosure">O pagamento será liberado em breve. Registre seu interesse abaixo: você garante a oferta de fundadores e avisamos quando abrir.</div>}
      {left === 0 && <div className="disclosure">As vagas de fundadores acabaram. Deixe seu e-mail para ser avisado do próximo valor.</div>}
      <h2>Quero entrar na lista</h2>
      <p>Informe seu e-mail e o que quer acompanhar (estados, palavras-chave, valor mínimo). Após o pagamento, ativamos seu acesso.</p>
      <ProForm />
    </div>
  )
}
