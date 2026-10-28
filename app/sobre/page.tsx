export const metadata = { title: 'Sobre', description: 'Missão, visão e valores do Nery Journal, a editoria de notícias do Grupo Nery para construção e saneamento.' }

const VALORES = [
  ['Rigor', 'Todo dado nasce de fonte primária (órgãos, atos e bases abertas). Se não dá para confirmar, não publicamos.'],
  ['Independência', 'Texto próprio, sem cópia de veículos. Patrocínio é sempre identificado como “Publicidade” e nunca influencia a pauta.'],
  ['Transparência', 'Cada matéria lista as fontes, a data e o que foi feito com apoio de IA. Erros são corrigidos e avisados.'],
  ['Utilidade', 'Informação que ajuda a decidir: orçar, licitar, comprar, contratar e investir em obras.'],
  ['Responsabilidade', 'Respeito à lei, aos direitos autorais e à privacidade. Dados públicos tratados com cuidado.'],
] as const

const ETAPAS = ['Radar de fontes do Brasil e do mundo', 'Fonte primária e fatos conferidos', 'Redação própria', 'Verificação de números e originalidade', 'Revisão editorial e publicação']

export default function Sobre() {
  return (
    <article className="wrap sobre">
      <h1 className="h1">Sobre o Nery Journal</h1>
      <p className="lede" style={{ maxWidth: 760 }}>O Nery Journal é a editoria de notícias do <b>Grupo Nery</b> para quem constrói o Brasil: construção civil, infraestrutura e saneamento, com dados, licitações e contexto em um só lugar.</p>

      <div className="mvv">
        <section className="mvv-card"><h2>Missão</h2><p>Informar quem projeta, constrói e fiscaliza obras com notícias, dados e licitações claros, verificáveis e úteis para decidir melhor.</p></section>
        <section className="mvv-card"><h2>Visão</h2><p>Ser a referência nacional em informação e inteligência de mercado para a construção e o saneamento, do pequeno município às grandes obras.</p></section>
      </div>

      <h2 className="h2">Valores</h2>
      <div className="valores">
        {VALORES.map(([t, d]) => <section key={t} className="valor"><h3>{t}</h3><p>{d}</p></section>)}
      </div>

      <h2 className="h2">Como produzimos</h2>
      <ol className="etapas">{ETAPAS.map((e) => <li key={e}>{e}</li>)}</ol>
      <p style={{ maxWidth: 760 }}>Fontes e veículos servem de base e ficam sempre citados e linkados; o texto é nosso. Parte do trabalho usa inteligência artificial e todo conteúdo passa por verificação antes de ir ao ar. Conheça a <a href="/politica-editorial">política editorial</a>.</p>

      <div className="disclosure"><b>Transparência:</b> o Grupo Nery atua no setor da construção. Declaramos essa relação para que o leitor avalie o conteúdo com esse contexto.</div>

      <p id="contato"><b>Contato e correções:</b> <a href="mailto:neryadministrativo@gmail.com">neryadministrativo@gmail.com</a> · São Paulo/SP e Brasília/DF.</p>
    </article>
  )
}
