import Link from 'next/link'
import Newsletter from './Newsletter'
import AdSlot from './AdSlot'

export function Header() {
  return (
    <header className="header">
      <div className="wrap">
        <div className="top">
          <Link href="/" className="logo" aria-label="Grupo Nery — Nery Journal, Construção">
            <img src="/logo-grupo-nery.png" alt="Grupo Nery" className="logoimg" />
            <span className="group">Nery Journal · Construção</span>
          </Link>
          <div className="util">
            <a href="/noticias#busca">Pesquisar</a>
            <a href="/newsletter">Notificações</a>
            <a href="/sobre#contato">Fale conosco</a>
          </div>
        </div>
        <nav className="nav" aria-label="Principal">
          <ul>
            <li><Link href="/">Análises</Link></li>
            <li><Link href="/noticias">Notícias</Link></li>
            <li><Link href="/noticias#indicadores">Indicadores</Link></li>
            <li><Link href="/noticias#licitacoes">Licitações</Link></li>
            <li><Link href="/anuncie">Anuncie</Link></li>
            <li><Link href="/sobre">Sobre</Link></li>
          </ul>
          <Newsletter variant="button" />
        </nav>
      </div>
    </header>
  )
}

export function TopAd() {
  return <div className="wrap"><AdSlot slot="leaderboard" /></div>
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <AdSlot slot="footer" />
        <div className="cols">
          <div><h4>Notícias</h4><ul><li><Link href="/">Análises</Link></li><li><Link href="/noticias">Últimas notícias</Link></li><li><Link href="/noticias#indicadores">Indicadores</Link></li><li><Link href="/noticias#licitacoes">Licitações de obras</Link></li></ul></div>
          <div><h4>Dados</h4><ul><li>Banco Central</li><li>IBGE e SINAPI</li><li>PNCP</li><li>Diário Oficial da União</li></ul></div>
          <div><h4>Sobre</h4><ul><li><Link href="/sobre">Quem somos</Link></li><li><Link href="/politica-editorial">Política editorial</Link></li><li><Link href="/privacidade">Privacidade</Link></li><li><Link href="/anuncie">Anuncie</Link></li><li><Link href="/newsletter">Boletim Nery Journal</Link></li></ul></div>
          <div><h4>Setores</h4><ul><li>Construção</li><li style={{ color: '#999' }}>Regulação (em breve)</li></ul></div>
        </div>
        <p className="legal">© Grupo Nery · São Paulo/SP e Brasília/DF · <a href="mailto:neryadministrativo@gmail.com">neryadministrativo@gmail.com</a>. Conteúdo produzido com apoio de IA e revisado por editor. Fontes e licenças identificadas em cada matéria. Espaços identificados como “Publicidade” são patrocinados.</p>
      </div>
    </footer>
  )
}
