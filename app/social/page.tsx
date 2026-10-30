import { createClient } from '@supabase/supabase-js'
import { slidesFrom } from '@/lib/social'
import PhotoReject from '@/components/PhotoReject'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Posts do dia', robots: { index: false, follow: false } }

/** Painel interno: matérias marcadas para redes sociais (social_at) com os slides prontos para baixar. */
export default async function Social() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const db = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
  const { data } = db ? await db.from('nj_articles').select('slug,title,category,body_md,social_at').not('social_at', 'is', null).order('social_at', { ascending: false }).limit(14) : { data: [] }
  const rows = (data ?? []) as { slug: string; title: string; category: string; body_md: string }[]
  return (
    <div className="wrap">
      <h1 className="h1">Posts do dia</h1>
      <p className="lead">Matérias escolhidas para Instagram e LinkedIn. Abra cada imagem, salve e poste na ordem: capa, slides de texto e último slide.</p>
      {rows.length === 0 && <div className="disclosure">Nenhuma matéria marcada ainda. As escolhas do dia aparecem aqui (5 a 7 por dia).</div>}
      {rows.map((r) => {
        const n = slidesFrom(r.body_md, 3, 55).length
        const imgs = [['0', 'Capa'], ...Array.from({ length: n }, (_, i) => [String(i + 1), `Slide ${i + 1}`]), ['cta', 'Último']]
        return (
          <section key={r.slug} className="home-sec">
            <h2 className="h2" style={{ fontSize: 22 }}>{r.title}</h2>
            <p><PhotoReject slug={r.slug} /></p>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
              {imgs.map(([s, label]) => (
                <a key={s} href={`/card/${r.slug}?s=${s}`} target="_blank" rel="noopener noreferrer" style={{ flex: '0 0 200px', textDecoration: 'none' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/card/${r.slug}?s=${s}&w=540&h=675`} alt={label} width={200} height={250} loading="lazy" style={{ width: 200, height: 250, objectFit: 'cover', borderRadius: 8, border: '1px solid #e3e7ea' }} />
                  <small>{label}</small>
                </a>
              ))}
            </div>
            <p className="lic-count">Legenda sugerida: {r.title}. Link e mais detalhes no site (link na bio).</p>
          </section>
        )
      })}
    </div>
  )
}
