import { getCampaign } from '@/lib/data'

const SIZES: Record<string, string> = {
  leaderboard: '970×250 / 728×90',
  mpu: '300×250',
  footer: 'faixa de parceiros',
  native: 'card patrocinado',
}

/**
 * Espaço de patrocínio vendido direto. Com campanha ativa mostra o criativo; sem, mostra "Anuncie aqui".
 * Todo espaço tem o rótulo visível "Publicidade" (CONAR) e links com rel="sponsored".
 */
export default async function AdSlot({ slot }: { slot: 'leaderboard' | 'mpu' | 'footer' | 'native' }) {
  const c = await getCampaign(slot)
  return (
    <aside className={`adslot slot-${slot}`} aria-label="Publicidade">
      <span className="adlabel">{c?.label ?? 'Publicidade'}</span>
      {c ? (
        <a href={`/r/${c.id}`} rel="sponsored noopener" className="adcreative">
          {c.image_url ? <img src={c.image_url} alt={c.alt_text ?? c.advertiser} /> : <span>{c.headline ?? c.advertiser}</span>}
        </a>
      ) : (
        <a href="/anuncie" className="adplaceholder">
          <b>Anuncie aqui</b>
          <small>{SIZES[slot]} · fale com a gente</small>
        </a>
      )}
    </aside>
  )
}
