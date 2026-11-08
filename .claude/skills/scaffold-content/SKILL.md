---
name: scaffold-content
description: Passo a passo para adicionar uma nova coleção de conteúdo, ou um novo documento (produto, membro de equipe, página) a uma coleção existente, sem quebrar o contrato do Webtech Editor. Use quando o usuário pedir para criar conteúdo novo, uma coleção nova, ou um componente de apresentação para conteúdo MDX.
---

# Scaffold de conteúdo

Antes de usar esta skill, consulte `webtech-content-contract` para as regras de schema,
pastas e slugs — aqui está apenas a sequência de passos.

## Adicionar um documento a uma coleção existente (caso mais comum)

1. Confirmar os campos de frontmatter exigidos em `cms/estrutura.json` para a coleção.
2. Criar `content/<collection>/<slug>.mdx` com frontmatter YAML preenchendo todos os campos
   declarados e corpo em Markdown puro (sem JSX customizado).
3. Se houver campo `image`, adicionar o arquivo em
   `public/images/<collection>/<slug>/<arquivo>` e referenciar no frontmatter como
   `/images/<collection>/<slug>/<arquivo>`.
4. Nunca adicionar o documento a um array em `.js` — a página já lista a coleção via
   `listContent("<collection>")`/`getContent("<collection>", slug)` em `lib/content.mjs`.
5. Verificar no `npm run dev` que o novo documento aparece sem alterar código.

## Adicionar uma coleção nova

1. Adicionar entrada em `cms/estrutura.json`: `id`, `label`, `folder: "content/<id>"`,
   `extension: "mdx"`, `fields` (lista de `{ name, type }`).
2. Criar a pasta `content/<id>/` e pelo menos um documento `.mdx` seguindo o passo acima.
3. Criar um componente de apresentação em `components/<Nome>.js`: Server Component (ou
   componente puro) que recebe `{ slug, frontmatter, content }` via props e renderiza os
   campos relevantes. Não deve importar `lib/content.mjs` diretamente se for usado em
   contexto client — a leitura de conteúdo é feita na página (Server Component) e passada
   via props.
4. Consumir a coleção em uma página de rota (ex. `app/<rota>/page.js`) via
   `listContent("<id>")`/`getContent("<id>", slug)`.
5. Se a coleção precisar de página de detalhe por slug, seguir o padrão de
   `app/produtos/[slug]/page.js` ou `app/paginas/[slug]/page.js`: `generateStaticParams`,
   `generateMetadata`, `notFound()` quando `getContent` retorna `null`.
6. Rodar `npm run check` para confirmar que nada quebrou.
