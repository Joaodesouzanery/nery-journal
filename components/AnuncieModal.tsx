'use client'
import { useRef } from 'react'

const EMAIL = 'neryadministrativo@gmail.com'
const LINKEDIN = 'https://www.linkedin.com/in/jo%C3%A3o-de-souza-nery-4380262b0/'

/** Botão que abre o popup com os contatos comerciais (sem formulário). `slot` = chamada dentro do espaço de publicidade. */
export default function AnuncieModal({ variant = 'nav' }: { variant?: 'nav' | 'slot' }) {
  const ref = useRef<HTMLDialogElement>(null)
  const open = () => ref.current?.showModal()
  return (
    <>
      {variant === 'nav'
        ? <button type="button" className="btn ghost" onClick={open}>Anuncie</button>
        : <button type="button" className="adplaceholder" onClick={open}><b>Anuncie aqui</b><small>960×120 · fale com a gente</small></button>}
      <dialog ref={ref} className="amodal" aria-labelledby="anuncie-title" onClick={(e) => { if (e.target === ref.current) ref.current?.close() }}>
        <div className="amodal-in">
          <button type="button" className="amodal-x" aria-label="Fechar" onClick={() => ref.current?.close()}>×</button>
          <h2 id="anuncie-title">Anuncie no Nery Journal</h2>
          <p>Fale direto com a equipe comercial do Grupo Nery. Um leitor do setor da construção e do saneamento vê o seu anúncio no topo de todas as páginas.</p>
          <ul className="contacts">
            <li><span>E-mail</span><a href={`mailto:${EMAIL}?subject=Anunciar%20no%20Nery%20Journal`}>{EMAIL}</a></li>
            <li><span>LinkedIn</span><a href={LINKEDIN} target="_blank" rel="noopener noreferrer">joaodsouzanery</a></li>
          </ul>
          <small>Formato do espaço: banner 960×120 px (ou 728×90 px). Todo anúncio é identificado como “Publicidade”.</small>
        </div>
      </dialog>
    </>
  )
}
