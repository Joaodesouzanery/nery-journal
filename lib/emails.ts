// Modelos de e-mail (HTML com estilos inline). NENHUM e-mail é enviado hoje: não há provedor configurado.
// Estrutura inspirada nos e-mails de confirmação/boas-vindas de grandes marcas: faixa de cabeçalho, título, texto, botão, rodapé com links.
// Quando o provedor for escolhido, chame sendMail() com estes HTMLs.

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? ''
const ACCENT = '#3DA9D6'
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

function shell(title: string, body: string, links: { prefs?: string; unsub?: string; privacy?: string }) {
  const foot = [links.prefs && `<a href="${esc(links.prefs)}" style="color:#888">Preferências</a>`, links.unsub && `<a href="${esc(links.unsub)}" style="color:#888">Cancelar inscrição</a>`, links.privacy && `<a href="${esc(links.privacy)}" style="color:#888">Privacidade</a>`].filter(Boolean).join(' &nbsp;·&nbsp; ')
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f5f5f3;font-family:Arial,Helvetica,sans-serif;color:#111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff">
<tr><td style="background:${ACCENT};padding:18px 28px;font-weight:800;font-size:20px;color:#111"><img src="${SITE}/logo-grupo-nery.png" alt="Grupo Nery" height="32" style="vertical-align:middle;border:0"/> <span style="font-weight:400;font-size:13px">&nbsp;Nery Journal · Construção</span></td></tr>
<tr><td style="padding:32px 28px 8px"><h1 style="margin:0;font-weight:400;font-size:28px;line-height:1.2">${esc(title)}</h1></td></tr>
<tr><td style="padding:8px 28px 24px;font-size:15px;line-height:1.55">${body}</td></tr>
<tr><td style="padding:16px 28px 28px;font-size:12px;color:#888;border-top:1px solid #eee">Grupo Nery · São Paulo/SP · Brasília/DF · neryadministrativo@gmail.com<br/>${foot}</td></tr>
</table></td></tr></table></body></html>`
}

const button = (href: string, label: string) =>
  `<p style="margin:20px 0"><a href="${esc(href)}" style="background:${ACCENT};color:#111;text-decoration:none;padding:12px 20px;display:inline-block;font-size:15px">${esc(label)} →</a></p>`

export function confirmEmail(p: { name: string; confirmUrl: string; prefsUrl: string; unsubUrl: string; privacyUrl: string }) {
  return shell('Confirme seu e-mail', `<p>Olá, ${esc(p.name)}!</p><p>Obrigado por se inscrever no Boletim Nery Journal. Confirme seu e-mail abaixo para começar a receber as notícias da construção. Ao confirmar, você também pode ajustar suas preferências.</p>${button(p.confirmUrl, 'Confirmar e-mail')}<p>Se não foi você, ignore esta mensagem: nenhuma inscrição será ativada sem a confirmação.</p>`, { prefs: p.prefsUrl, unsub: p.unsubUrl, privacy: p.privacyUrl })
}

export function welcomeEmail(p: { name: string; prefsUrl: string; unsubUrl: string; privacyUrl: string }) {
  return shell('Agradecemos seu cadastro', `<p>Olá, ${esc(p.name)}!</p><p>Sua inscrição foi confirmada. Em breve você receberá o Boletim Nery Journal com notícias, indicadores e licitações de obras.</p><p>Quer ajustar o que recebe? Escolha seus estados de interesse e os conteúdos que importam para o seu negócio:</p>${button(p.prefsUrl, 'Atualizar preferências')}<ul style="padding-left:18px"><li><b>Boletim e análises</b> — notícias e contexto do setor.</li><li><b>Licitações por estado</b> — alertas de obras (em validação).</li><li><b>Eventos</b> — feiras e congressos da construção.</li></ul>`, { prefs: p.prefsUrl, unsub: p.unsubUrl, privacy: p.privacyUrl })
}

export function weeklyEmail(p: { items: { title: string; url: string; category: string }[]; indicators: { nome: string; valor: string }[]; prefsUrl: string; unsubUrl: string; privacyUrl: string }) {
  const news = p.items.map((i) => `<p style="margin:0 0 14px"><span style="font-size:11px;text-transform:uppercase;color:#888">${esc(i.category)}</span><br/><a href="${esc(i.url)}" style="color:#111;font-size:17px">${esc(i.title)}</a></p>`).join('')
  const ind = p.indicators.map((i) => `<li>${esc(i.nome)}: <b>${esc(i.valor)}</b></li>`).join('')
  return shell('Boletim Nery Journal', `${news}<h3 style="margin:24px 0 8px">Indicadores</h3><ul style="padding-left:18px">${ind}</ul>`, { prefs: p.prefsUrl, unsub: p.unsubUrl, privacy: p.privacyUrl })
}

/** Ponto de integração: troque pelo provedor escolhido (Resend, Brevo, SES...). */
export async function sendMail(_msg: { to: string; subject: string; html: string; unsubUrl: string }): Promise<never> {
  // Ao ligar o provedor, envie estes cabeçalhos (RFC 8058, exigidos por Gmail/Yahoo para envio em volume):
  //   List-Unsubscribe: <unsubUrl>, <mailto:neryadministrativo@gmail.com?subject=cancelar>
  //   List-Unsubscribe-Post: List-Unsubscribe=One-Click
  throw new Error('Provedor de e-mail não configurado.')
}
