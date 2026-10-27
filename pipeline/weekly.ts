// Montagem da edição semanal: notícias publicadas + licitações do(s) estado(s) do assinante + indicadores.
// Pura (sem acesso a rede/banco) para ser testada; o envio real depende de provedor de e-mail.
export interface WeeklyArticle { title: string; slug: string; category: string; published_at: string | null }
export interface WeeklyLic { pncp_id: string; uf: string | null; objeto: string; orgao: string | null; valor_estimado: number | null; link: string | null }
export interface Weekly {
  articles: WeeklyArticle[]
  licitacoes: { uf: string; items: WeeklyLic[] }[]
}

/** Até `maxArticles` matérias mais recentes e, por UF do assinante, as `perUf` licitações de maior valor. Sem UF: top geral. */
export function buildWeekly(
  articles: WeeklyArticle[], lics: WeeklyLic[], ufs: string[], opts: { maxArticles?: number; perUf?: number } = {},
): Weekly {
  const { maxArticles = 5, perUf = 5 } = opts
  const arts = [...articles].sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? '')).slice(0, maxArticles)
  const byValue = (a: WeeklyLic, b: WeeklyLic) => (b.valor_estimado ?? 0) - (a.valor_estimado ?? 0)
  const groups = ufs.length
    ? ufs.map((uf) => ({ uf, items: lics.filter((l) => l.uf === uf).sort(byValue).slice(0, perUf) }))
    : [{ uf: 'Brasil', items: [...lics].sort(byValue).slice(0, perUf) }]
  return { articles: arts, licitacoes: groups.filter((g) => g.items.length > 0) }
}
