export const metadata = { title: 'Sobre' }

export default function Sobre() {
  return (
    <article className="article">
      <h1>Sobre o Nery Journal</h1>
      <div className="disclosure"><b>Rascunho.</b> Texto provisório, a ser revisado antes do lançamento.</div>
      <p className="lede">O Nery Journal é a editoria de notícias do <b>Grupo Nery</b> para o setor da construção.</p>
      <div className="body">
        <p>Publicamos notícias, indicadores e licitações de obras. Cada matéria é escrita a partir de fontes primárias (dados oficiais, atos e comunicados), lista as fontes ao final e passa por revisão de um editor.</p>
        <p><b>Transparência:</b> o Grupo Nery atua no setor da construção. Essa relação é declarada para que o leitor avalie o conteúdo com esse contexto.</p>
        <p id="contato"><b>Contato e correções:</b> <a href="mailto:neryadministrativo@gmail.com">neryadministrativo@gmail.com</a> · São Paulo/SP e Brasília/DF.</p>
      </div>
    </article>
  )
}
