export const metadata = { title: 'Política editorial' }

export default function Politica() {
  return (
    <article className="article">
      <h1>Política editorial</h1>
      <div className="disclosure"><b>Rascunho.</b> Revisar com assessoria jurídica antes do lançamento.</div>
      <div className="body">
        <p><b>Fontes.</b> Priorizamos fontes primárias: dados abertos, atos oficiais e comunicados. Veículos de imprensa servem de ponto de partida para a pauta, e citamos e linkamos a origem.</p>
        <p><b>Autoria e IA.</b> Os textos são redigidos com apoio de inteligência artificial a partir de fatos extraídos de fontes permitidas, e revisados por um editor antes da publicação. Conferimos números, datas e nomes contra as fontes.</p>
        <p><b>Imagens.</b> Usamos fotos próprias, licenciadas ou de uso livre, com crédito e licença identificados.</p>
        <p><b>Publicidade.</b> Conteúdo patrocinado é identificado como “publi” e separado do editorial.</p>
        <p><b>Correções e direito de resposta.</b> Erros são corrigidos de forma visível. Pedidos de correção e resposta serão atendidos pelo canal de contato.</p>
      </div>
    </article>
  )
}
