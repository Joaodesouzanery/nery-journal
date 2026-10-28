# Melhorias dos agentes (registro)

Quando uma matéria passar pelo verificador e o editor humano achar que não estava de acordo, anote aqui e transforme em regra nos arquivos de `.claude/agents/` (ou em uma skill). Assim o problema não se repete.

| Data | Matéria | O que passou | Regra nova |
|---|---|---|---|
| — | — | — | — |

## 28/10 — regra da "nota"
Curiosidades internacionais e itens de um único veículo viram **nota**: até 160 palavras, linha "Com informações de / Segundo <veículo>" e link da fonte, sem foto do veículo. O verificador (`kind: 'nota'`) exige atribuição, link e limite de tamanho; fatos só do que a manchete/trecho sustenta. Substitui, para notas, a exigência de duas fontes.
Falha pega: a série 192 do BC foi rotulada "INCC-M" por engano (conferido contra o SindusCon-SP). Regra: dado de série só leva o nome do índice se o código estiver confirmado na documentação do órgão.
