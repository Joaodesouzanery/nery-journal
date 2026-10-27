import { NextResponse } from 'next/server'
import { subscribe, validateSubscribe } from '@/lib/newsletter'

// Inscrição: grava como "pending" com o texto de consentimento. Nenhum e-mail é enviado (provedor não configurado).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  if (typeof body.website === 'string' && body.website.length > 0) return NextResponse.json({ ok: true }) // honeypot
  const v = validateSubscribe(body)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })
  const r = await subscribe(v.value)
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status })
  return NextResponse.json({ ok: true, emailSent: false })
}
