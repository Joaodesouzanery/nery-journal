import { ImageResponse } from 'next/og'
import { getArticle } from '@/lib/data'
import { slidesFrom } from '@/lib/social'

// Carrossel 1080×1350 no estilo dos posts de referência: foto de fundo, degradê escuro embaixo, categoria em letras espaçadas,
// texto em CAIXA ALTA negrito (fonte geométrica) alinhado embaixo à esquerda e marca no canto superior.
//   /card/<slug>          capa
//   /card/<slug>?s=1..3   slides de texto
//   /card/<slug>?s=cta    último slide
//   ?w=1200&h=630         formato de link
export const runtime = 'edge'

const FONT = 'https://cdn.jsdelivr.net/npm/@fontsource/josefin-sans@5.0.8/files/josefin-sans-latin-700-normal.woff'

async function loadFont() {
  try {
    const r = await fetch(FONT)
    return r.ok ? await r.arrayBuffer() : null
  } catch { return null }
}

const spaced = (t: string) => t.toUpperCase().split('').join(' ')

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
  const slides = slidesFrom(a.body_md, 3, 55)
  const text = s !== '0' && s !== 'cta' ? slides[Math.max(0, Number(s) - 1)] : null
  const title = a.title.length > 120 ? a.title.slice(0, 117) + '…' : a.title
  const font = await loadFont()
  const fontFamily = font ? 'Josefin' : 'sans-serif'
  const fonts = font ? [{ name: 'Josefin', data: font, weight: 700 as const, style: 'normal' as const }] : undefined
  const origin = u.origin

  const brand = (
    <div style={{ position: 'absolute', left: 56, top: 48, display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${origin}/logo-mark-white.png`} alt="" width={64} height={64} style={{ objectFit: 'contain' }} />
      <div style={{ display: 'flex', fontSize: 40, letterSpacing: -0.5 }}>Nery Journal</div>
    </div>
  )

  if (s === 'cta') {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#06141c', color: '#fff', fontFamily }}>
          <div style={{ display: 'flex', fontSize: 110, lineHeight: 1 }}>Nery Journal.</div>
          <div style={{ display: 'flex', marginTop: 34, fontSize: 70, lineHeight: 1.08 }}>Informação para quem constrói o Brasil.</div>
          <div style={{ display: 'flex', marginTop: 40, fontSize: 44, color: '#5cc3ee' }}>Cadastre-se grátis. Link na bio.</div>
        </div>
      ),
      { width: w, height: h, fonts },
    )
  }

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: logo ? '#fff' : '#0e2a3a', color: '#fff', fontFamily }}>
        {a.photo_url && !logo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.photo_url} alt="" width={w} height={h} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        {a.photo_url && logo && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 320 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.photo_url} alt="" width={Math.round(w * 0.5)} style={{ objectFit: 'contain', maxHeight: h * 0.4 }} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', background: 'linear-gradient(to bottom, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.94) 100%)' }} />
        {brand}
        <div style={{ position: 'absolute', left: 56, right: 56, bottom: 64, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 30, letterSpacing: 4, marginBottom: 22 }}>{spaced(a.category)}</div>
          {text ? (
            <div style={{ display: 'flex', fontSize: text.length > 240 ? 38 : 44, lineHeight: 1.18, textTransform: 'uppercase' }}>{text}</div>
          ) : (
            <div style={{ display: 'flex', fontSize: big ? 66 : 50, lineHeight: 1.08, textTransform: 'uppercase' }}>{title}</div>
          )}
        </div>
      </div>
    ),
    { width: w, height: h, fonts },
  )
}
