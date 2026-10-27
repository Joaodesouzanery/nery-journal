import { NextResponse } from 'next/server'
import { confirmByToken } from '@/lib/newsletter'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') ?? ''
  const ok = await confirmByToken(token)
  const dest = new URL(ok ? '/newsletter/preferencias' : '/newsletter/obrigado', url.origin)
  if (ok) { dest.searchParams.set('token', token); dest.searchParams.set('confirmado', '1') } else dest.searchParams.set('erro', '1')
  return NextResponse.redirect(dest)
}
