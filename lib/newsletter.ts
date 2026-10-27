import { createClient } from '@supabase/supabase-js'
import { CONSENT_VERSION, CONSENT_BOLETIM, CONSENT_ALERTAS, CONSENT_PARCEIROS } from './constants'

// Somente servidor. Usa a service role (nunca exposta ao navegador).
export function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface SubscribeInput {
  email: string
  first_name: string
  last_name: string
  company: string
  job_role?: string
  country?: string
  segment?: string
  ufs?: string[]
  boletim: boolean
  analises?: boolean
  eventos?: boolean
  alerts_licitacoes?: boolean
  alerts_normas?: boolean
  parceiros?: boolean
  source_url?: string
}

const clean = (s: unknown, max = 120) => (typeof s === 'string' ? s.trim().slice(0, max) : '')

export function validateSubscribe(b: Record<string, unknown>): { ok: true; value: SubscribeInput } | { ok: false; error: string } {
  const email = clean(b.email, 254).toLowerCase()
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'E-mail inválido.' }
  const first_name = clean(b.first_name), last_name = clean(b.last_name), company = clean(b.company)
  if (!first_name || !last_name || !company) return { ok: false, error: 'Preencha nome, sobrenome e empresa.' }
  const boletim = b.boletim === true
  const alerts_licitacoes = b.alerts_licitacoes === true
  const alerts_normas = b.alerts_normas === true
  const parceiros = b.parceiros === true
  if (!boletim && !alerts_licitacoes && !alerts_normas && !parceiros) return { ok: false, error: 'Marque ao menos uma opção de conteúdo e o respectivo consentimento.' }
  const ufs = Array.isArray(b.ufs) ? (b.ufs as unknown[]).map((u) => clean(u, 2).toUpperCase()).filter((u) => u.length === 2).slice(0, 27) : []
  return {
    ok: true,
    value: {
      email, first_name, last_name, company,
      job_role: clean(b.job_role) || undefined, country: clean(b.country) || 'Brasil', segment: clean(b.segment) || undefined,
      ufs, boletim, analises: b.analises === true, eventos: b.eventos === true,
      alerts_licitacoes, alerts_normas, parceiros, source_url: clean(b.source_url, 300) || undefined,
    },
  }
}

/** Texto de consentimento realmente exibido, conforme as caixas marcadas (guardado como prova). */
export function consentTextFor(v: SubscribeInput): string {
  const parts: string[] = []
  if (v.boletim || v.analises || v.eventos) parts.push(CONSENT_BOLETIM)
  if (v.alerts_licitacoes || v.alerts_normas) parts.push(CONSENT_ALERTAS)
  if (v.parceiros) parts.push(CONSENT_PARCEIROS)
  return parts.join('\n')
}

export async function subscribe(v: SubscribeInput): Promise<{ ok: true; token: string } | { ok: false; status: number; error: string }> {
  const db = admin()
  if (!db) return { ok: false, status: 503, error: 'A newsletter ainda não está configurada.' }

  const { data: existing } = await db.from('nj_subscribers').select('id, token, status').eq('email', v.email).eq('sector', 'construcao').maybeSingle()
  let id: string, token: string
  if (existing) {
    // Não reenvia nem sobrescreve inscrição já confirmada; mesma resposta para não revelar se o e-mail existe.
    id = existing.id; token = existing.token
    if (existing.status === 'confirmed') return { ok: true, token }
  } else {
    const { data, error } = await db.from('nj_subscribers').insert({
      email: v.email, sector: 'construcao', first_name: v.first_name, last_name: v.last_name, company: v.company,
      job_role: v.job_role ?? null, country: v.country ?? 'Brasil', segment: v.segment ?? null, source_url: v.source_url ?? null,
      consent_text: consentTextFor(v), consent_version: CONSENT_VERSION, status: 'pending',
    }).select('id, token').single()
    if (error || !data) return { ok: false, status: 500, error: 'Não foi possível salvar agora.' }
    id = data.id; token = data.token
  }

  await db.from('nj_subscriber_prefs').upsert({
    subscriber_id: id, ufs: v.ufs ?? [], boletim: v.boletim, analises: v.analises ?? false, eventos: v.eventos ?? false,
    alerts_licitacoes: v.alerts_licitacoes ?? false, alerts_normas: v.alerts_normas ?? false, parceiros: v.parceiros ?? false,
    language: 'pt-BR', updated_at: new Date().toISOString(),
  })
  await db.from('nj_subscriber_events').insert({ subscriber_id: id, event: 'subscribe', consent_text: consentTextFor(v), consent_version: CONSENT_VERSION })
  return { ok: true, token }
}

export async function confirmByToken(token: string): Promise<boolean> {
  const db = admin()
  if (!db || !token) return false
  const { data } = await db.from('nj_subscribers').select('id, status').eq('token', token).maybeSingle()
  if (!data || data.status === 'unsubscribed') return false
  if (data.status !== 'confirmed') {
    await db.from('nj_subscribers').update({ status: 'confirmed', confirmed_at: new Date().toISOString() }).eq('id', data.id)
    await db.from('nj_subscriber_events').insert({ subscriber_id: data.id, event: 'confirm', consent_version: CONSENT_VERSION })
  }
  return true
}

export async function getProfile(token: string) {
  const db = admin()
  if (!db || !token) return null
  const { data } = await db.from('nj_subscribers')
    .select('id, email, first_name, last_name, company, job_role, segment, status, nj_subscriber_prefs(ufs, boletim, analises, eventos, alerts_licitacoes, alerts_normas, parceiros)')
    .eq('token', token).maybeSingle()
  return data
}

export async function updatePrefs(token: string, b: Record<string, unknown>): Promise<boolean> {
  const db = admin()
  if (!db || !token) return false
  const { data } = await db.from('nj_subscribers').select('id, status').eq('token', token).maybeSingle()
  if (!data || data.status === 'unsubscribed') return false
  const ufs = Array.isArray(b.ufs) ? (b.ufs as unknown[]).map((u) => clean(u, 2).toUpperCase()).filter((u) => u.length === 2) : []
  const flag = (k: string) => b[k] === true
  await db.from('nj_subscriber_prefs').upsert({
    subscriber_id: data.id, ufs, boletim: flag('boletim'), analises: flag('analises'), eventos: flag('eventos'),
    alerts_licitacoes: flag('alerts_licitacoes'), alerts_normas: flag('alerts_normas'), parceiros: flag('parceiros'),
    updated_at: new Date().toISOString(),
  })
  await db.from('nj_subscriber_events').insert({ subscriber_id: data.id, event: 'prefs', consent_version: CONSENT_VERSION })
  return true
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const db = admin()
  if (!db || !token) return false
  const { data } = await db.from('nj_subscribers').select('id').eq('token', token).maybeSingle()
  if (!data) return false
  await db.from('nj_subscribers').update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() }).eq('id', data.id)
  await db.from('nj_subscriber_prefs').update({ boletim: false, analises: false, eventos: false, alerts_licitacoes: false, alerts_normas: false, parceiros: false }).eq('subscriber_id', data.id)
  await db.from('nj_subscriber_events').insert({ subscriber_id: data.id, event: 'unsubscribe' })
  return true
}
