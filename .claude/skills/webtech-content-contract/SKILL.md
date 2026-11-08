---
name: webtech-content-contract
description: Regras do contrato de conteúdo com o Webtech Editor neste projeto (schema de cms/estrutura.json, convenção de pastas/slugs/imagens, frontmatter YAML vs. corpo Markdown). Use antes de criar ou editar uma coleção em cms/estrutura.json, ou antes de escrever/revisar o frontmatter de um documento .mdx.
---

# Contrato de conteúdo (Webtech Editor)

O Webtech Editor é uma ferramenta externa (fora deste repo) que edita os arquivos deste
projeto via GitHub, seguindo um contrato implícito. Qualquer coleção ou documento novo deve
respeitar estas regras ou o editor (e o leitor em `lib/content.mjs`) não funcionam
corretamente.

## Schema em `cms/estrutura.json`

Cada coleção é um objeto com:

- `id` — identificador da coleção (ex. `"produtos"`).
- `label` — nome amigável exibido no editor.
- `folder` — **deve ser exatamente** `"content/<id>"`. `lib/content.mjs` lança erro se não
  for igual a `content/${collection}`.
- `extension` — **deve ser** `"mdx"`. O leitor lança erro se for diferente.
- `fields` — lista de campos do frontmatter, cada um com `name` e `type`. Tipos usados neste
  projeto: `string` (texto curto), `text` (texto longo em frontmatter), `image` (caminho de
  imagem), `markdown` (indica que o corpo do documento é o conteúdo Markdown — normalmente
  chamado `body` por convenção, mas o conteúdo real do corpo do `.mdx` sempre está disponível
  via `doc.content`, independente do nome desse campo).

## Pastas e slugs

- Documento físico: `content/<id>/<slug>.mdx`.
- Slug validado por regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`, máximo 100 caracteres (kebab-case
  minúsculo, sem acentos).
- Imagens: `public/images/<id>/<slug>/<arquivo>`, referenciadas no frontmatter como
  `/images/<id>/<slug>/<arquivo>` (sem prefixo `/public`).
- Formatos de imagem aceitos pelo editor real: PNG, JPEG, GIF, WebP, AVIF. SVG é usado neste
  repo apenas para assets de placeholder pré-existentes — não é um formato de upload válido
  no editor real.

## Frontmatter vs. corpo

- Frontmatter = metadados YAML no topo do `.mdx`, um valor por campo declarado em
  `estrutura.json`.
- Corpo = Markdown **puro**. O preview do editor usa `marked` e não executa componentes JSX
  customizados. `components/Callout.js` existe apenas como demonstração didática do lab —
  não deve ser usado em conteúdo real de produção/desafio.
- Um campo declarado em `estrutura.json` não aparece automaticamente na página: é preciso que
  o componente React correspondente leia esse campo do frontmatter e o renderize.

## Nomenclatura de campos

Prefira nomes de campo que não colidam com nomes reservados do editor real. Exemplo: este
projeto usa `position` em vez de `role` para equipe, porque `role` é um campo reservado do
Webtech Editor com opções fixas predefinidas.

## Erros comuns

| Sintoma | Causa provável |
|---|---|
| Editor não encontra coleção | `folder`/`extension` em `estrutura.json` não seguem o padrão `content/<id>` + `mdx` |
| Erro de YAML ao ler frontmatter | Aspas/indentação incorretas no `.mdx` |
| Campo não aparece na página | Componente React não lê esse campo do frontmatter |
| Imagem 404 | Caminho não corresponde a `public/images/<id>/<slug>/<arquivo>` |
