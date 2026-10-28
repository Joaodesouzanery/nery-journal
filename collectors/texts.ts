// Extração do texto principal de uma página (uso interno: conferência de fatos e de originalidade; nunca publicado).

const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”' }

const decode = (s: string) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m)

/** Parágrafos do conteúdo principal (<article>, senão <main>, senão a página), sem menus, rodapés e scripts. Até `max` caracteres. */
export function extractArticleText(html: string, max = 30000): string {
  let h = html.replace(/<(script|style|noscript|svg|nav|header|footer|aside|form|iframe)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
  const region = /<article\b[\s\S]*?<\/article>/i.exec(h)?.[0] ?? /<main\b[\s\S]*?<\/main>/i.exec(h)?.[0] ?? h
  const paras: string[] = []
  for (const m of region.matchAll(/<(p|h[1-3]|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const t = decode(m[2].replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
    if (t.length >= 25) paras.push(t)
  }
  return [...new Set(paras)].join('\n\n').slice(0, max)
}
