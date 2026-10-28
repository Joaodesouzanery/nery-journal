import { getCampaign } from '@/lib/data'
import AnuncieModal from './AnuncieModal'

/** Criativo no formato 960×120 (8:1). Usa o arquivo 728×90 quando existir: proporção quase igual, escala em qualquer tela. */
function creative(c: { image_url: string | null; alt_text: string | null; advertiser: string; headline: string | null }) {
  if (!c.image_url) return <span>{c.headline ?? c.advertiser}</span>
  const src = c.image_url.includes('970x250') ? c.image_url.replace('970x250', '728x90') : c.image_url
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={c.alt_text ?? c.advertiser} />
}

/**
 * Espaço de patrocínio vendido direto, sempre no formato 960×120: "top" (acima do cabeçalho) e "inline" (entre seções da home).
 * Todo espaço tem o rótulo visível "Publicidade" (CONAR) e links com rel="sponsored".
 */
export default async function AdSlot({ slot }: { slot: 'top' | 'inline' }) {
  const c = await getCampaign(slot)
  return (
    <aside className={`adslot slot-${slot}`} aria-label="Publicidade">
      <span className="adlabel">{c?.label ?? 'Publicidade'}</span>
      {c ? (
        // link_url começando com "#" = anunciante ainda sem endereço: mostra o criativo sem link.
        c.link_url.startsWith('#') ? <div className="adcreative">{creative(c)}</div> : (
          <a href={`/r/${c.id}`} rel="sponsored noopener" className="adcreative">{creative(c)}</a>
        )
      ) : <AnuncieModal variant="slot" />}
    </aside>
  )
}
