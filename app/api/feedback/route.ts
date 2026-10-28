import { NextResponse } from 'next/server'
import { admin, EMAIL_RE } from '@/lib/newsletter'

const KINDS = ['site', 'materia', 'licitacoes', 'newsletter']

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!b) return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  if (typeof b.website === 'string' && b.website.length > 0) return NextResponse.json({ ok: true }) // isca anti-robô
  const kind = typeof b.kind === 'string' && KINDS.includes(b.kind) ? b.kind : 'site'
  const rating = Number.isInteger(b.rating) && (b.rating as number) >= 1 && (b.rating as number) <= 5 ? (b.rating as number) : null
  const useful = typeof b.useful === 'boolean' ? b.useful : null
  const message = typeof b.message === 'string' ? b.message.trim().slice(0, 2000) : ''
  const emailRaw = typeof b.email === 'string' ? b.email.trim().toLowerCase().slice(0, 254) : ''
  const email = emailRaw && EMAIL_RE.test(emailRaw) ? emailRaw : null
  const slug = typeof b.article_slug === 'string' && /^[a-z0-9-]{1,100}$/.test(b.article_slug) ? b.article_slug : null
  const page = typeof b.page === 'string' ? b.page.slice(0, 200) : null
  if (rating == null && useful == null && !message) return NextResponse.json({ error: 'Escolha uma nota ou escreva um comentário.' }, { status: 400 })
  const db = admin()
  if (!db) return NextResponse.json({ error: 'O envio ainda não está configurado.' }, { status: 503 })
  const { error } = await db.from('nj_feedback').insert({ kind, rating, useful, article_slug: slug, message: message || null, email, page })
  if (error) return NextResponse.json({ error: 'Não foi possível enviar agora.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
