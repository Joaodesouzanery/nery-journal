import { ImageResponse } from 'next/og'
import { getArticle } from '@/lib/data'

// Card 1080×1350 (formato feed do Instagram/LinkedIn) gerado da matéria: foto livre ao fundo, categoria, título e marca.
// Uso: abrir /card/<slug> e salvar a imagem. Adicione ?w=1200&h=630 para o formato de link.
export const runtime = 'edge'

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = await getArticle(slug)
  if (!a) return new Response('Matéria não encontrada', { status: 404 })
  const u = new URL(req.url)
  const w = Math.min(2000, Number(u.searchParams.get('w')) || 1080)
  const h = Math.min(2000, Number(u.searchParams.get('h')) || 1350)
  const big = h > w
  const title = a.title.length > 120 ? a.title.slice(0, 117) + '…' : a.title
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#0e2a3a', color: '#fff', fontFamily: 'sans-serif' }}>
        {a.photo_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.photo_url} alt="" width={w} height={h} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.88) 100%)' }} />
        <div style={{ position: 'absolute', left: 64, right: 64, bottom: 72, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignSelf: 'flex-start', background: '#1a7aa8', padding: '8px 20px', borderRadius: 8, fontSize: big ? 30 : 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>{a.category}</div>
          <div style={{ display: 'flex', marginTop: 24, fontSize: big ? 68 : 52, lineHeight: 1.12, fontWeight: 700 }}>{title}</div>
          <div style={{ display: 'flex', marginTop: 32, fontSize: big ? 30 : 24, opacity: 0.9 }}>Nery Journal · Grupo Nery</div>
        </div>
      </div>
    ),
    { width: w, height: h },
  )
}
