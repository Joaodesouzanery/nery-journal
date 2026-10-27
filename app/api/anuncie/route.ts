import { NextResponse } from 'next/server'
import { admin, EMAIL_RE } from '@/lib/newsletter'

const clean = (s: unknown, max: number) => (typeof s === 'string' ? s.trim().slice(0, max) : '')

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!b) return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  if (typeof b.website === 'string' && b.website.length > 0) return NextResponse.json({ ok: true }) // honeypot
  const company = clean(b.company, 120), contact_name = clean(b.contact_name, 120), email = clean(b.email, 254).toLowerCase()
  if (!company || !contact_name || !EMAIL_RE.test(email)) return NextResponse.json({ error: 'Preencha empresa, nome e um e-mail válido.' }, { status: 400 })
  const db = admin()
  if (!db) return NextResponse.json({ error: 'O formulário ainda não está configurado.' }, { status: 503 })
  const { error } = await db.from('nj_leads_anuncie').insert({ company, contact_name, email, phone: clean(b.phone, 40) || null, message: clean(b.message, 1000) || null })
  if (error) return NextResponse.json({ error: 'Não foi possível enviar agora.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
