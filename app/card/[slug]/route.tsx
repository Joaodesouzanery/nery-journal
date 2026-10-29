import { ImageResponse } from 'next/og'
import { getArticle } from '@/lib/data'
import { slidesFrom } from '@/lib/social'

// Carrossel 1080×1350 (Instagram/LinkedIn) gerado da matéria, no estilo "foto cheia + texto em caixa alta":
//   /card/<slug>          capa (foto, categoria, título, marca)
//   /card/<slug>?s=1..3   slides de texto (trechos curtos da matéria, sobre a mesma foto escurecida)
//   /card/<slug>?s=cta    último slide (convite ao cadastro)
//   ?w=1200&h=630         formato de link (capa)
export const runtime = 'edge'

const BRAND = '#1a7aa8'

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = await getArticle(slug)
  if (!a) return new Response('Matéria não encontrada', { status: 404 })
  const u = new URL(req.url)
  const w = Math.min(2000, Number(u.searchParams.get('w')) || 1080)
  const h = Math.min(2000, Number(u.searchParams.get('h')) || 1350)
  const s = u.searchParams.get('s') ?? '0'
  const big = h > w
  const logo = a.photo_kind === 'logo'
  const slides = slidesFrom(a.body_md)
  const text = s !== '0' && s !== 'cta' ? slides[Math.max(0, Number(s) - 1)] : null
  const title = a.title.length > 120 ? a.title.slice(0, 117) + '…' : a.title

  const bg = (
    <>
      {a.photo_url && !logo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.photo_url} alt="" width={w} height={h} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
      {a.photo_url && logo && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', paddingBottom: 260 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.photo_url} alt="" width={Math.round(w * 0.6)} style={{ objectFit: 'contain', maxHeight: h * 0.45 }} />
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', background: text ? 'rgba(0,0,0,0.72)' : 'linear-gradient(to bottom, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.9) 100%)' }} />
      <div style={{ position: 'absolute', left: 56, top: 48, display: 'flex', fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>Nery Journal</div>
    </>
  )

  if (s === 'cta') {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 72, background: '#0b0f12', color: '#fff', fontFamily: 'sans-serif' }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 800 }}>Nery Journal</div>
          <div style={{ display: 'flex', marginTop: 24, fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>Informação para quem constrói o Brasil.</div>
          <div style={{ display: 'flex', marginTop: 36, fontSize: 40, color: '#5cc3ee' }}>Notícias, dados e saneamento. Cadastre-se grátis. Link na bio.</div>
        </div>
      ),
      { width: w, height: h },
    )
  }

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#0e2a3a', color: '#fff', fontFamily: 'sans-serif' }}>
        {bg}
        {text ? (
          <div style={{ position: 'absolute', left: 64, right: 64, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', fontSize: 28, letterSpacing: 6, textTransform: 'uppercase', color: '#5cc3ee', marginBottom: 28 }}>{a.category}</div>
            <div style={{ display: 'flex', fontSize: text.length > 220 ? 46 : 54, lineHeight: 1.22, fontWeight: 700, textTransform: 'uppercase' }}>{text}</div>
          </div>
        ) : (
          <div style={{ position: 'absolute', left: 64, right: 64, bottom: 72, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignSelf: 'flex-start', background: BRAND, padding: '8px 20px', borderRadius: 8, fontSize: big ? 30 : 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>{a.category}</div>
            <div style={{ display: 'flex', marginTop: 24, fontSize: big ? 66 : 50, lineHeight: 1.12, fontWeight: 800, textTransform: 'uppercase' }}>{title}</div>
          </div>
        )}
      </div>
    ),
    { width: w, height: h },
  )
}
