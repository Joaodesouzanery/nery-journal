import type { ReactNode } from 'react'

/** Ilustração própria (SVG) por tema, no lugar de foto de terceiros: sem licença, sem logo, nas cores da marca. */
const norm = (c: string) => c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '')

const BLUE = '#3da9d6', DEEP = '#0f3a52', MID = '#1a6b94', LIGHT = '#9fd8ee'

const scenes: Record<string, () => ReactNode> = {
  saneamento: () => (
    <>
      <rect width="800" height="500" fill={DEEP} />
      <path d="M0 360 Q100 320 200 360 T400 360 T600 360 T800 360 V500 H0Z" fill={MID} opacity=".7" />
      <path d="M0 410 Q100 375 200 410 T400 410 T600 410 T800 410 V500 H0Z" fill={BLUE} opacity=".55" />
      <g stroke={LIGHT} strokeWidth="26" strokeLinecap="round" fill="none" opacity=".9">
        <path d="M-20 170 H260 V300 H560 V120 H820" />
      </g>
      <g fill={BLUE}><rect x="236" y="150" width="48" height="40" rx="6" /><rect x="236" y="280" width="48" height="40" rx="6" /><rect x="536" y="280" width="48" height="40" rx="6" /><rect x="536" y="100" width="48" height="40" rx="6" /></g>
      <g fill={LIGHT} opacity=".9"><path d="M420 330 q-14 24 0 34 q14 -10 0 -34z" /><path d="M470 345 q-10 18 0 26 q10 -8 0 -26z" /></g>
    </>
  ),
  infraestrutura: () => (
    <>
      <rect width="800" height="500" fill="#13232d" />
      <rect y="360" width="800" height="140" fill={DEEP} />
      <g fill="none" stroke={BLUE} strokeWidth="14"><path d="M60 360 Q200 160 340 360" /><path d="M340 360 Q480 160 620 360" /><path d="M620 360 Q700 250 780 360" opacity=".6" /></g>
      <rect x="0" y="340" width="800" height="24" fill={LIGHT} />
      <g stroke={LIGHT} strokeWidth="5" opacity=".7">{[110, 170, 230, 290, 390, 450, 510, 570].map((x) => <path key={x} d={`M${x} 340 V${x < 340 ? 250 + Math.abs(x - 200) / 3 : 250 + Math.abs(x - 480) / 3}`} />)}</g>
    </>
  ),
  mercado: () => (
    <>
      <rect width="800" height="500" fill="#18212a" />
      {[[40, 220], [140, 150], [240, 260], [340, 190], [440, 110], [540, 230], [640, 170]].map(([x, y], i) => <rect key={i} x={x} y={y} width="80" height={500 - y} fill={i % 2 ? MID : DEEP} />)}
      <g fill={BLUE}>{[[60, 250], [160, 180], [260, 290], [360, 220], [460, 140], [560, 260], [660, 200]].map(([x, y], i) => <g key={i}><rect x={x} y={y} width="14" height="14" /><rect x={x + 34} y={y} width="14" height="14" /><rect x={x} y={y + 40} width="14" height="14" /><rect x={x + 34} y={y + 40} width="14" height="14" /></g>)}</g>
      <polyline points="30,380 150,330 270,350 390,260 510,230 640,150 770,90" fill="none" stroke={LIGHT} strokeWidth="8" strokeLinejoin="round" />
    </>
  ),
  materiais: () => (
    <>
      <rect width="800" height="500" fill="#241f1a" />
      {[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4, 5].map((c) => <rect key={`${r}${c}`} x={(r % 2 ? -60 : 0) + c * 140 + 10} y={90 + r * 70} width="128" height="58" rx="3" fill={(r + c) % 3 ? '#b4673e' : '#8f4d2c'} opacity=".85" />))}
      <rect x="0" y="440" width="800" height="60" fill="#161310" />
    </>
  ),
  credito: () => (
    <>
      <rect width="800" height="500" fill="#16241f" />
      <path d="M200 300 L400 140 L600 300 V420 H200Z" fill={MID} /><path d="M170 310 L400 120 L630 310" fill="none" stroke={LIGHT} strokeWidth="16" strokeLinejoin="round" />
      <rect x="350" y="320" width="100" height="100" fill={DEEP} />
      <circle cx="660" cy="120" r="56" fill={BLUE} /><circle cx="660" cy="120" r="38" fill="none" stroke={DEEP} strokeWidth="8" />
    </>
  ),
  seguranca: () => (
    <>
      <rect width="800" height="500" fill="#2a1f1a" />
      <path d="M200 330 A200 200 0 0 1 600 330 Z" fill="#f2b705" /><rect x="140" y="330" width="520" height="40" rx="14" fill="#d99f04" /><rect x="360" y="150" width="80" height="180" fill="#d99f04" opacity=".6" />
      <g stroke="#ffffff22" strokeWidth="30"><path d="M-40 520 L300 180" /><path d="M120 520 L460 180" /><path d="M300 520 L640 180" /></g>
    </>
  ),
  tecnologia: () => (
    <>
      <rect width="800" height="500" fill="#141a2e" />
      <g stroke="#ffffff14" strokeWidth="2">{Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${i * 50} 0 V500 M0 ${i * 32} H800`} />)}</g>
      <g stroke={BLUE} strokeWidth="5" fill="none"><path d="M120 360 L300 220 L480 300 L660 140" /><path d="M300 220 V90 M480 300 V420" /></g>
      <g fill={LIGHT}>{[[120, 360], [300, 220], [480, 300], [660, 140], [300, 90], [480, 420]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="14" />)}</g>
    </>
  ),
  habitacao: () => (
    <>
      <rect width="800" height="500" fill="#221f2c" />
      {[[80, 230, 150], [250, 170, 200], [450, 260, 120], [600, 210, 160]].map(([x, y, w], i) => <g key={i}><rect x={x} y={y} width={w} height={500 - y} fill={i % 2 ? MID : '#3b3550'} /><path d={`M${x - 10} ${y} L${x + w / 2} ${y - 60} L${x + w + 10} ${y}Z`} fill={LIGHT} opacity=".8" /></g>)}
    </>
  ),
  default: () => (
    <>
      <rect width="800" height="500" fill="#161b21" />
      <g stroke={BLUE} strokeWidth="12" fill="none"><path d="M200 500 V120 H620" /><path d="M200 120 L380 20 M200 120 L120 60" /><path d="M560 120 V240" /></g>
      <rect x="520" y="240" width="80" height="50" fill={LIGHT} opacity=".85" />
      <g stroke="#ffffff1a" strokeWidth="2">{[260, 330, 400, 470].map((y) => <path key={y} d={`M200 ${y} H${y > 300 ? 300 : 280}`} />)}</g>
    </>
  ),
}

export default function CoverArt({ category }: { category: string }) {
  const key = norm(category)
  const scene = scenes[key] ?? scenes.default
  return (
    <svg className="coverart" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {scene()}
    </svg>
  )
}
