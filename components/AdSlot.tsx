import { getCampaign } from '@/lib/data'

const SIZES: Record<string, string> = {
  leaderboard: '970×250 / 728×90',
  mpu: '300×250',
  footer: 'faixa de parceiros',
  native: 'card patrocinado',
}

/** Criativo: no leaderboard, o banner 970×250 vira 728×90 em telas estreitas (mesmo nome de arquivo, outro tamanho). */
function creative(c: { image_url: string | null; alt_text: string | null; advertiser: string; headline: string | null }) {
  if (!c.image_url) return <span>{c.headline ?? c.advertiser}</span>
  const narrow = c.image_url.includes('970x250') ? c.image_url.replace('970x250', '728x90') : null
  return (
    <picture>
      {narrow && <source media="(max-width: 1000px)" srcSet={narrow} />}
      <img src={c.image_url} alt={c.alt_text ?? c.advertiser} />
    </picture>
  )
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
        // link_url começando com "#" = anunciante ainda sem endereço: mostra o criativo sem link.
        c.link_url.startsWith('#') ? <div className="adcreative">{creative(c)}</div> : (
          <a href={`/r/${c.id}`} rel="sponsored noopener" className="adcreative">{creative(c)}</a>
        )
      ) : (
        <a href="/anuncie" className="adplaceholder">
          <b>Anuncie aqui</b>
          <small>{SIZES[slot]} · fale com a gente</small>
        </a>
      )}
    </aside>
  )
}
