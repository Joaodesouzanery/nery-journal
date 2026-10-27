// Autoria assistida por IA: extrai fatos de fontes PERMITIDAS e redige matéria própria a partir dos fatos.
// Requer ANTHROPIC_API_KEY. Modelo padrão: claude-opus-5-5 (troque com NJ_MODEL, ex.: claude-sonnet-5-5 para custo menor).
// STATUS: não executado contra a API real neste ambiente (sem rede nem chave). Rode `node nery-journal/pipeline/run.ts`.
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { canSendFulltext, checkArticle, slugify, buildCarousel } from './lib.ts'
import type { Article, ArticleSource, SourcePolicy, Issue } from './lib.ts'

const MODEL = process.env.NJ_MODEL ?? 'claude-opus-5-5'

const STYLE_GUIDE = `Você é redator do Nery Journal, veículo de notícias do setor de construção e engenharia no Brasil.
Regras de redação:
- Escreva em português do Brasil, a partir SOMENTE dos fatos fornecidos. Não acrescente fato, número, nome ou data que não esteja nos fatos.
- Texto próprio: não siga a ordem nem a redação de nenhuma fonte; sintetize. Frases curtas, voz ativa.
- Manchete factual, com o dado mais relevante (até 110 caracteres). Sem adjetivos sensacionalistas e sem acusar ninguém.
- Atribua afirmações a quem as fez ("segundo o órgão X"). Use "é investigado" e nunca afirme culpa.
- Estrutura: lede (1–2 frases), corpo em markdown curto (contexto e "por que importa para obras"), 3 a 5 fatos curtos, um destaque numérico se houver, uma frase de impacto prático.
- Responda APENAS com um objeto JSON válido, sem texto fora dele.`

const FactsSchema = z.object({ facts: z.array(z.object({ claim: z.string().min(5), quote: z.string().min(5) })) })

const ArticleSchema = z.object({
  title: z.string().min(5),
  lede: z.string().min(20),
  body_md: z.string().min(40),
  category: z.string().min(3),
  facts: z.array(z.string().min(5)).min(1).max(8),
  highlight: z.object({ value: z.string(), caption: z.string(), source: z.string() }).optional(),
  impact: z.string().optional(),
})

function parseJson<T>(text: string, schema: z.ZodType<T>): T {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end < start) throw new Error('Resposta sem JSON.')
  return schema.parse(JSON.parse(text.slice(start, end + 1)))
}

async function ask(client: Anthropic, system: string, user: string): Promise<string> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system,
    output_config: { effort: 'medium' },
    messages: [{ role: 'user', content: user }],
  })
  if (res.stop_reason === 'refusal') throw new Error('Modelo recusou a solicitação.')
  const block = res.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') throw new Error('Resposta sem texto.')
  return block.text
}

/** Extrai afirmações atômicas; descarta as cuja citação literal não existe no texto-fonte (anti-alucinação). */
export async function extractFacts(client: Anthropic, text: string): Promise<string[]> {
  const out = await ask(
    client,
    'Extraia fatos verificáveis de um texto. Responda só JSON: {"facts":[{"claim":"fato em uma frase","quote":"trecho LITERAL do texto que o sustenta"}]}.',
    text,
  )
  const { facts } = parseJson(out, FactsSchema)
  return facts.filter((f) => text.includes(f.quote)).map((f) => f.claim)
}

export interface ProduceInput {
  /** Fatos já conhecidos (ex.: gerados de dados abertos ou digitados pelo editor). */
  facts?: string[]
  /** Fonte cujo texto completo pode ser lido (exige política que permita texto completo E uso por IA). */
  fulltext?: { text: string; policy: SourcePolicy | null | undefined }
  sources: ArticleSource[]
  categoryHint?: string
}

export interface ProduceResult {
  article: Article & { slug: string }
  carousel: ReturnType<typeof buildCarousel>
  check: { ok: boolean; issues: Issue[] }
}

export async function produce(client: Anthropic, input: ProduceInput): Promise<ProduceResult> {
  const facts = [...(input.facts ?? [])]
  const sourceTexts: string[] = []

  if (input.fulltext) {
    if (!canSendFulltext(input.fulltext.policy)) {
      throw new Error('Política da fonte NÃO permite enviar o texto completo à IA. Use fatos digitados pelo editor.')
    }
    facts.push(...(await extractFacts(client, input.fulltext.text)))
    sourceTexts.push(input.fulltext.text)
  }
  if (facts.length === 0) throw new Error('Sem fatos para redigir.')

  const prompt = `Fatos (única base permitida):\n${facts.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nFontes: ${input.sources.map((s) => s.name).join('; ')}\nCategoria sugerida: ${input.categoryHint ?? 'Obras'}\n\nJSON: {"title","lede","body_md","category","facts":[strings],"highlight":{"value","caption","source"}?,"impact"?}`
  const draft = parseJson(await ask(client, STYLE_GUIDE, prompt), ArticleSchema)

  const article: Article = { ...draft, sources: input.sources }
  const check = checkArticle({ article, sourceTexts })
  // Os números do texto podem se apoiar nos fatos fornecidos; checkArticle já os usa como suporte.
  return { article: { ...article, slug: slugify(article.title) }, carousel: buildCarousel(article), check }
}
