import { fmtDate } from '@/lib/data'
import type { RadarItem } from '@/lib/data'

/** Lista de manchetes do radar: sempre com a fonte, a data e o link para o original (abre em nova aba). */
export default function Radar({ items, title = 'Radar do setor' }: { items: RadarItem[]; title?: string }) {
  if (items.length === 0) return null
  return (
    <section className="radar" aria-label={title}>
      <h2 className="h2">{title}</h2>
      <p className="radar-note">Manchetes de fontes do setor, no Brasil e no exterior. O texto completo fica no site de cada fonte.</p>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <div className="radar-meta"><b>{i.source}</b> · {i.tema}{i.lang === 'en' ? <span className="lang">EN</span> : null} · {fmtDate(i.published_at)}</div>
            <a href={i.url} target="_blank" rel="noopener noreferrer nofollow">{i.title}</a>
          </li>
        ))}
      </ul>
    </section>
  )
}
