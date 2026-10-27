import { NextResponse } from 'next/server'
import { unsubscribeByToken } from '@/lib/newsletter'

// POST: também atende o descadastro em 1 clique (RFC 8058) quando houver provedor de e-mail.
export async function POST(req: Request) {
  const url = new URL(req.url)
  let token = url.searchParams.get('token') ?? ''
  if (!token) {
    const body = (await req.json().catch(() => null)) as { token?: string } | null
    token = body?.token ?? ''
  }
  if (!(await unsubscribeByToken(token))) return NextResponse.json({ error: 'Link inválido.' }, { status: 400 })
  return NextResponse.json({ ok: true })
}
