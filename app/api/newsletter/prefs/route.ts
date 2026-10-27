import { NextResponse } from 'next/server'
import { getProfile, updatePrefs } from '@/lib/newsletter'

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? ''
  const p = await getProfile(token)
  if (!p) return NextResponse.json({ error: 'Link inválido ou newsletter não configurada.' }, { status: 404 })
  return NextResponse.json({ profile: p })
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const token = typeof body?.token === 'string' ? body.token : ''
  if (!body || !(await updatePrefs(token, body))) return NextResponse.json({ error: 'Link inválido.' }, { status: 400 })
  return NextResponse.json({ ok: true })
}
