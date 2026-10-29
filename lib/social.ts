// Textos dos slides do carrossel: parágrafos curtos da matéria (sem a linha de atribuição), até 3 slides de ~40 palavras.
export function slidesFrom(bodyMd: string, maxSlides = 3, maxWords = 42): string[] {
  const paras = bodyMd.split(/\n{2,}/).map((p) => p.replace(/\*\*/g, '').trim()).filter((p) => p && !/^(com informações|segundo a|segundo o|fonte:)/i.test(p))
  const out: string[] = []
  let cur = ''
  for (const p of paras) {
    const sentences = p.split(/(?<=[.!?])\s+/)
    for (const sent of sentences) {
      const next = cur ? `${cur} ${sent}` : sent
      if (next.split(/\s+/).length > maxWords && cur) { out.push(cur); cur = sent } else cur = next
      if (out.length >= maxSlides) return out
    }
    if (cur && cur.split(/\s+/).length >= maxWords * 0.6) { out.push(cur); cur = '' }
    if (out.length >= maxSlides) return out
  }
  if (cur && out.length < maxSlides) out.push(cur)
  return out.slice(0, maxSlides)
}
