export const metadata = { title: 'Colunistas', description: 'Espaço para profissionais do setor da construção e do saneamento assinarem colunas no Nery Journal.' }

const EMAIL = 'neryadministrativo@gmail.com'
const LINKEDIN = 'https://www.linkedin.com/in/jo%C3%A3o-de-souza-nery-4380262b0/'

const PERFIS = [
  ['Engenheiros e arquitetos', 'Análises técnicas de obra, projeto, orçamento e norma.'],
  ['Gestores públicos e reguladores', 'O que muda em contratos, licitações, concessões e saneamento.'],
  ['Executivos e empreendedores', 'Mercado, crédito, tecnologia e gestão de construtoras e fornecedores.'],
  ['Pesquisadores e professores', 'Dados, estudos e tendências do setor, em linguagem acessível.'],
] as const

export default function Colunistas() {
  return (
    <article className="wrap sobre">
      <h1 className="h1">Colunistas</h1>
      <div className="disclosure"><b>Estamos finalizando este espaço.</b> Em breve, as colunas de profissionais do setor aparecem aqui, com foto, mini-biografia e texto assinado.</div>
      <p className="lede" style={{ maxWidth: 760 }}>O Nery Journal vai abrir espaço para quem vive o setor todos os dias. Se você atua com construção, infraestrutura ou saneamento e quer assinar uma coluna, fale com a gente.</p>

      <h2 className="h2">Quem pode ser colunista</h2>
      <div className="valores">
        {PERFIS.map(([t, d]) => <section key={t} className="valor"><h3>{t}</h3><p>{d}</p></section>)}
      </div>

      <h2 className="h2">Como funciona</h2>
      <ol className="etapas">
        <li>Você nos conta quem é e o tema da sua coluna</li>
        <li>Conversamos sobre formato e periodicidade</li>
        <li>Publicamos com sua foto, cargo e mini-biografia</li>
      </ol>

      <div className="signup" style={{ marginTop: 24, maxWidth: 560 }}>
        <h3>Quero ser colunista</h3>
        <p>Envie seu nome, área de atuação, link do LinkedIn e dois temas que gostaria de abordar.</p>
        <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="btn accent" href={`mailto:${EMAIL}?subject=Quero%20ser%20colunista%20no%20Nery%20Journal`}>Enviar e-mail</a>
          <a className="btn ghost" href={LINKEDIN} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </p>
        <small>{EMAIL}</small>
      </div>
      <p className="src" style={{ marginTop: 20 }}>Colunas são opinião do autor e ficam identificadas como tal, separadas do noticiário do Nery Journal.</p>
    </article>
  )
}
