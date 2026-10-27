import { getProByToken, getProLicitacoes } from '@/lib/licitacoes'

const cell = (v: unknown) => {
  let s = String(v ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s // evita injeção de fórmula em planilhas
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET(req: Request) {
  const p = await getProByToken(new URL(req.url).searchParams.get('token') ?? '')
  if (!p || p.status !== 'ativo') return new Response('Acesso indisponível', { status: 403 })
  const rows = await getProLicitacoes(p)
  const head = ['uf', 'municipio', 'orgao', 'objeto', 'modalidade', 'valor_estimado', 'publicado_em', 'encerramento_proposta', 'link']
  const csv = [head.join(','), ...rows.map((r) => head.map((h) => cell((r as unknown as Record<string, unknown>)[h])).join(','))].join('\n')
  return new Response('﻿' + csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="licitacoes.csv"' } })
}
