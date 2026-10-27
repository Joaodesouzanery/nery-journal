import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { admin } from '@/lib/newsletter'

// Clique em patrocinador: registra (agregado por dia, sem cookie nem IP) e redireciona. Só campanhas ativas e links http(s).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.redirect(new URL('/', _req.url))
  const { data } = await createClient(url, key, { auth: { persistSession: false } }).from('nj_campaigns').select('link_url').eq('id', id).maybeSingle()
  if (!data || !/^https?:\/\//i.test(data.link_url)) return NextResponse.redirect(new URL('/', _req.url))

  const db = admin()
  if (db) {
    try {
      const day = new Date().toISOString().slice(0, 10)
      const { data: row } = await db.from('nj_ad_events').select('clicks, impressions').eq('day', day).eq('campaign_id', id).maybeSingle()
      await db.from('nj_ad_events').upsert({ day, campaign_id: id, clicks: (row?.clicks ?? 0) + 1, impressions: row?.impressions ?? 0 })
    } catch { /* contagem é best-effort */ }
  }
  return NextResponse.redirect(data.link_url, 302)
}
