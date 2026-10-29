import { NextResponse } from 'next/server'
import { admin, EMAIL_RE } from '@/lib/newsletter'
import { CONSENT_VERSION } from '@/lib/constants'

const SEGMENTS = ['Construtora / incorporadora', 'Engenharia e projetos', 'Fornecedor de materiais', 'Saneamento / utilities', 'Órgão público', 'Banco / financeira', 'Outro']
export const CADASTRO_CONSENT = 'Concordo em me cadastrar no Nery Journal e que meu e-mail e dados profissionais sejam usados para liberar o acesso e para comunicações do Nery Journal. Posso cancelar a qualquer momento.'

/** Cadastro gratuito para acessar o site (nome, e-mail, empresa, segmento). Grava em nj_subscribers como "pending" com a prova do consentimento. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!b) return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  if (typeof b.website === 'string' && b.website.length > 0) return NextResponse.json({ ok: true })
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase().slice(0, 254) : ''
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 120) : ''
  const company = typeof b.company === 'string' ? b.company.trim().slice(0, 120) : ''
  const segment = typeof b.segment === 'string' && SEGMENTS.includes(b.segment) ? b.segment : null
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 })
  if (!name) return NextResponse.json({ error: 'Informe seu nome.' }, { status: 400 })
  if (b.consent !== true) return NextResponse.json({ error: 'É preciso aceitar o consentimento para continuar.' }, { status: 400 })
  const db = admin()
  if (!db) return NextResponse.json({ ok: true, soft: true }) // sem banco configurado: libera o acesso sem gravar
  const [first, ...rest] = name.split(/\s+/)
  const { data: ex } = await db.from('nj_subscribers').select('id').eq('email', email).eq('sector', 'construcao').maybeSingle()
  if (!ex) {
    const { error } = await db.from('nj_subscribers').insert({
      email, sector: 'construcao', first_name: first, last_name: rest.join(' ') || null, company: company || null, segment,
      source_url: typeof b.page === 'string' ? b.page.slice(0, 300) : null, consent_text: CADASTRO_CONSENT, consent_version: CONSENT_VERSION, status: 'pending',
    })
    if (error) return NextResponse.json({ error: 'Não foi possível salvar agora.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
