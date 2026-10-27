import { NextResponse } from 'next/server'
import { admin, EMAIL_RE } from '@/lib/newsletter'
import { UFS, PRO_CONSENT } from '@/lib/constants'

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!b) return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  if (typeof b.website === 'string' && b.website.length > 0) return NextResponse.json({ ok: true })
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase().slice(0, 254) : ''
  if (!EMAIL_RE.test(email) || !b.consent) return NextResponse.json({ error: 'Informe um e-mail válido e aceite o contato.' }, { status: 400 })
  const ufs = Array.isArray(b.ufs) ? b.ufs.filter((u): u is string => typeof u === 'string' && (UFS as readonly string[]).includes(u)) : []
  const keywords = typeof b.keywords === 'string' ? b.keywords.split(',').map((k) => k.trim().slice(0, 40)).filter(Boolean).slice(0, 10) : []
  const min_value = Math.max(0, Number(String(b.min_value ?? '').replace(/\D/g, '')) || 0)
  const db = admin()
  if (!db) return NextResponse.json({ error: 'O formulário ainda não está configurado.' }, { status: 503 })
  // Atualiza filtros sem mexer em status/token de quem já existe.
  const { data: ex } = await db.from('nj_pro_subscribers').select('id').eq('email', email).maybeSingle()
  const { error } = ex
    ? await db.from('nj_pro_subscribers').update({ ufs, keywords, min_value }).eq('id', ex.id)
    : await db.from('nj_pro_subscribers').insert({ email, ufs, keywords, min_value, consent_text: PRO_CONSENT, consent_version: 'v0-rascunho' })
  if (error) return NextResponse.json({ error: 'Não foi possível enviar agora.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
