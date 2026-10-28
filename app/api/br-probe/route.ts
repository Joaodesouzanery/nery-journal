// TEMPORÁRIO: mede, a partir da região de São Paulo (gru1) da Vercel, quais fontes respondem.
// Só lê uma lista fixa de endereços públicos e devolve o status; não grava nada e não aceita endereço do usuário.
export const preferredRegion = 'gru1'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const TARGETS: Record<string, string> = {
  'ibge-api': 'https://servicodados.ibge.gov.br/api/v3/agregados/2296/periodos/-2/variaveis/48?localidades=N1[all]',
  'ibge-sidra': 'https://apisidra.ibge.gov.br/values/t/2296/n1/all/v/48/p/last%201',
  caixa: 'https://www.caixa.gov.br/',
  caf: 'https://www.caf.com/',
  'construcao-mercado': 'https://construcaomercado.pini.com.br/',
  'revista-infra': 'https://revistainfra.com.br/',
  'o-empreiteiro': 'https://revistaoempreiteiro.com.br/',
  eurostat: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sts_copr_m?format=JSON&lang=EN&geo=BR&lastTimePeriod=1',
  bid: 'https://www.iadb.org/',
}

export async function GET() {
  const out: Record<string, { status: number | string; ms: number }> = {}
  await Promise.all(Object.entries(TARGETS).map(async ([k, url]) => {
    const t0 = Date.now()
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'nery-journal-collector/0.1 (+https://github.com/Joaodesouzanery/nery-journal)' }, signal: AbortSignal.timeout(9000), cache: 'no-store' })
      out[k] = { status: r.status, ms: Date.now() - t0 }
    } catch (e) {
      const cause = (e as { cause?: { code?: string } }).cause
      out[k] = { status: cause?.code ?? (e as Error).name, ms: Date.now() - t0 }
    }
  }))
  return Response.json({ region: process.env.VERCEL_REGION ?? null, results: out })
}
