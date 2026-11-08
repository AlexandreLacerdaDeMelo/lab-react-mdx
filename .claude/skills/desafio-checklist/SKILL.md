---
name: desafio-checklist
description: Checklist de validação e finalização do desafio descrito em DESAFIO.md (teste decisivo de conteúdo dinâmico, critérios de aceitação, geração do ENTREGA.md). Use quando o usuário pedir para validar, revisar, testar ou finalizar a entrega do desafio.
---

# Checklist de entrega do desafio

Fonte da verdade completa: `DESAFIO.md`. Este checklist resume os passos operacionais de
validação.

## 1. Gate de qualidade

```
npm run check
```

Deve passar (lint + test + build) antes de considerar qualquer entrega pronta.

## 2. Teste decisivo (conteúdo dinâmico, sem tocar JS/JSX)

Com `npm run dev` ativo:

1. Adicionar um 4º produto ou membro de equipe **apenas** criando um novo `.mdx` em
   `content/produtos/` ou `content/equipe/` + imagem em `public/images/<id>/<slug>/`.
   Confirmar que aparece na home sem reiniciar o servidor nem editar componentes.
2. Editar um campo de frontmatter de um documento existente e confirmar que a mudança
   aparece.
3. Remover um documento e confirmar que ele desaparece e que a home não quebra.
4. Repetir o teste após `npm run build && npm start` (produção) e confirmar que o
   comportamento é **diferente**: a build de produção não faz hot-update — é preciso
   rebuildar para refletir mudanças de conteúdo. Isso confirma que a renderização é
   server-side em build time/request time, não client-side dinâmica.

## 3. Critérios de aceitação (`DESAFIO.md`)

Percorrer e confirmar cada um:

- [ ] `/` mostra ≥3 produtos e ≥3 membros de equipe, todos vindos de `.mdx`.
- [ ] `cms/estrutura.json` descreve as 3 coleções (`paginas`, `produtos`, `equipe`).
- [ ] Corpos Markdown renderizam corretamente (empresa, bios, descrições de produto).
- [ ] Cards de produto linkam para `/produtos/<slug>`; slug inválido retorna 404.
- [ ] Coleções vazias não quebram a home (mensagem de fallback, sem erro).
- [ ] Sem scroll horizontal em viewport de 390px; layout funciona em 1280px.
- [ ] Imagens têm `alt` text; links/cards são navegáveis por teclado.
- [ ] `npm run check` passa sem erros.

## 4. `ENTREGA.md`

Deve conter:

- Instruções de execução (`npm ci`, `npm run dev`, `npm run check`).
- Capturas de tela desktop da home e da página de produto.
- Resultado do `npm run check`.
- Respostas às 5 perguntas de reflexão do `DESAFIO.md` sobre `estrutura.json`,
  distinção coleção/slug/rota/pasta de imagem, frontmatter vs. corpo, por que a
  leitura/renderização é server-side, e o fluxo editor → publish → deploy.
