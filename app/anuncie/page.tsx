import AnuncieForm from '@/components/AnuncieForm'

export const metadata = { title: 'Anuncie' }

const FORMATS = [
  ['Leaderboard', '970×250 / 728×90, abaixo do cabeçalho em todas as páginas'],
  ['Retângulo (MPU)', '300×250, na barra lateral das notícias'],
  ['Card patrocinado', 'Entre as matérias, com o rótulo “Publicidade”'],
  ['Parceiros', 'Faixa de logotipos no rodapé'],
  ['Boletim', 'Bloco patrocinado na newsletter semanal'],
  ['Conteúdo patrocinado', 'Matéria identificada como “Publi”, separada do editorial'],
]

export default function Anuncie() {
  return (
    <div className="wrap" style={{ maxWidth: 860, padding: '40px 24px 80px' }}>
      <h1 className="h1" style={{ marginTop: 0 }}>Anuncie no Nery Journal</h1>
      <div className="disclosure"><b>Rascunho.</b> Formatos e condições em definição; valores sob consulta. Todo conteúdo patrocinado é identificado como publicidade e separado do editorial.</div>
      <h2 style={{ fontWeight: 400 }}>Formatos</h2>
      <ul className="formats">
        {FORMATS.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}
      </ul>
      <h2 style={{ fontWeight: 400, marginTop: 40 }}>Fale com a gente</h2>
      <AnuncieForm />
    </div>
  )
}
