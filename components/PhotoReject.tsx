'use client'
import { useState } from 'react'

/** Botão interno: "imagem não combina" -> guarda um aviso; a próxima escolha de fotos bloqueia essa foto e busca outra. */
export default function PhotoReject({ slug }: { slug: string }) {
  const [done, setDone] = useState(false)
  const send = async () => {
    const r = await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'materia', article_slug: slug, message: 'imagem_ruim', page: '/social' }) })
    if (r.ok) setDone(true)
  }
  return done ? <small>Aviso enviado: a imagem será trocada.</small> : <button type="button" className="btn ghost" onClick={send} style={{ padding: '4px 10px', fontSize: 13 }}>Imagem não combina</button>
}
