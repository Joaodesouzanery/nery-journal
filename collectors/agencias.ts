// Lê a página de notícias de uma agência (gov.br/Plone ou portal próprio) e extrai os links de matérias.
// Genérico: pega <a href> que ficam ABAIXO do caminho da listagem e têm título de verdade. Guarda só título e link.
export interface AgItem { title: string; link: string }

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))

export function parseAgencia(html: string, pageUrl: string): AgItem[] {
  const base = new URL(pageUrl)
  const prefix = base.pathname.replace(/\/+$/, '') + '/'
  // gov.br: algumas agências (ANEEL, ANAC, Anatel) listam notícias que moram em outro caminho do mesmo órgão
  const orgRoot = base.host === 'www.gov.br' ? '/' + base.pathname.split('/').filter(Boolean).slice(0, 2).join('/') + '/' : null
  const out: AgItem[] = []
  const seen = new Set<string>()
  const re = /<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi
  for (let m; (m = re.exec(html));) {
    let u: URL
    try { u = new URL(decode(m[1]), base) } catch { continue }
    if (u.host !== base.host) continue
    const under = u.pathname.startsWith(prefix)
    const outro = !under && orgRoot && u.pathname.startsWith(orgRoot) && /noticia/i.test(u.pathname)
    if (!under && !outro) continue
    const rest = (under ? u.pathname.slice(prefix.length) : u.pathname.slice(orgRoot!.length)).replace(/\/+$/, '')
    if (!rest || /^(@@|\+\+|view$|rss$|RSS$)/.test(rest) || /[?&]b_start/.test(u.search)) continue
    if (!/[a-z0-9]+-[a-z0-9]+-[a-z0-9]+/i.test(rest.split('/').pop() ?? '')) continue // slug de matéria tem várias palavras
    const title = decode(m[2].replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
    if (title.length < 25) continue
    const link = u.origin + u.pathname.replace(/\/+$/, '')
    if (seen.has(link)) continue
    seen.add(link); out.push({ title: title.slice(0, 300), link })
  }
  return out
}
