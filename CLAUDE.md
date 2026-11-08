# CLAUDE.md

Guia rápido para trabalhar neste repositório. Para detalhes completos, veja `README.md`
(laboratório base) e `DESAFIO.md` (desafio "Aurora Studio" em andamento).

## Visão geral

Laboratório de React + Next.js + MDX que evoluiu para o desafio de construir o site
institucional da "Aurora Studio" (produtos de audiovisual). Todo o conteúdo visível
(empresa, produtos, equipe) deve vir de arquivos `.mdx` versionados — nunca de arrays em
`.js` ou dados hardcoded em componentes.

**Stack**: Next.js 15 (App Router), React 19, `next-mdx-remote` (RSC), `gray-matter`. Sem
TypeScript, sem Tailwind — CSS puro em `app/globals.css` com custom properties e `clamp()`.
Node ≥22 (`.nvmrc` = 24). Alias `@/*` → raiz do projeto (`jsconfig.json`).

## Comandos essenciais

- `npm run dev` — servidor de desenvolvimento (porta 3000).
- `npm run check` — `lint && test && build`. **Rode isso antes de considerar qualquer
  tarefa concluída.**
- `npm test` isolado precisa de `node --conditions=react-server` (já configurado no script;
  necessário porque `lib/content.mjs` importa `server-only`).

## Arquitetura

`lib/content.mjs` é o único leitor de conteúdo (server-only, lança erro se o schema de 
`cms/estrutura.json` estiver mal configurado, mas retorna `null`/`[]` graciosamente para
documentos/coleções vazias — essa distinção é testada em `tests/content.test.mjs` e deve ser
preservada). `cms/estrutura.json` declara as coleções existentes: `paginas`, `produtos`,
`equipe`, `grupos` e `categorias`. Cada coleção vive em `content/<id>/<slug>.mdx` e tem
imagens em `public/images/<id>/<slug>/`. Componentes em `components/` são puramente
apresentacionais: recebem `{ slug, frontmatter, content }` via props e nunca importam o
leitor de conteúdo diretamente.

`lib/sections.js` divide um corpo Markdown em seções por heading e reconhece "fichas
técnicas" no formato `- **Chave:** valor` (sem `remark-gfm`, tabelas GFM não compilam —
por isso esse formato de lista; a regex fica exportada como `SPEC_LINE_RE` para quem precisa
de uma variação do parsing, como `lib/numbers.mjs`). `components/SpecSheet.js` renderiza
essas fichas. Usado em produtos (`## Especificações técnicas`), pessoas/grupos (`## Perfil
rápido`) e contato (`## Email`/`## Telefone`/`## WhatsApp`/`## Endereço`/`## Horário`).

Em `/numeros`, a convenção é mais específica: cada seção `## Título` começa com uma lista
`- **Chave:** valor` (os pontos do gráfico), pode terminar com duas chaves especiais —
`Destaque` (número grande de resumo) e `Período` (texto livre) — e qualquer linha depois
disso que não seja mais um bullet é tratada como o parágrafo de leitura exibido no painel de
informações ao lado do gráfico. `lib/numbers.mjs` (`parseMetricSection`, `metricsFromBody`,
`computeVariation`) faz esse parsing à parte de `parseSections`, olhando direto para
`section.raw` — por isso tolera uma seção "mista" (lista + prosa) que `parseSections` sozinho
classificaria como prosa pura.

Outros helpers puros (sem `server-only`, por isso podem ser importados tanto em Server
quanto em Client Components): `lib/search.mjs` (filtro do índice de busca — com filtro de
tipo/categoria ativo, aceita consulta de texto vazia e lista pelo filtro), `lib/slugify.mjs`
(`slugify`/`stripAccents`, usado tanto pela busca quanto para casar `category` de produtos
com o slug de um documento em `categorias`), `lib/categories.mjs` (`buildCategoryIndex`/
`productsForCategory`, combina categorias cadastradas com categorias que só existem no campo
`category` de algum produto), `lib/summary.mjs` (`summarize`, corta a bio no fim de uma frase
quando `equipe` não tem `summary` no frontmatter), `lib/numbers.mjs`, `lib/compare.mjs`
(valida seleção e monta as linhas alinhadas do comparador de produtos), `lib/comments.mjs`
(interface `list`/`add`/`remove` sobre um storage injetável, com campos extras arbitrários e
limite de tamanho configurável — usado tanto por `ProductReviews.js` quanto por
`GuestbookWall.js`), `lib/reviews.mjs` (validação de nota/título/uso e média das avaliações de
produto) e `lib/areas.mjs` (rótulo e cor por área da equipe). Cada um tem testes equivalentes
em `tests/`.

Dois módulos importam `server-only` e nunca devem ser importados por um `"use client"`:
`lib/searchIndex.server.mjs` (monta o índice leve de busca a partir de `listContent`, entrega
pronto via props ao componente cliente de busca) e `lib/ideas-storage.mjs` (grava o
formulário "Envie sua ideia" em disco — só é importado por `app/api/ideias/route.js`, nunca
por um componente).

**Fronteira server/client**: leitura de conteúdo e renderização de MDX ficam em Server
Components. Nunca importar `lib/content.mjs` (ou qualquer coisa que dependa dele) em um
componente `"use client"`, nem renderizar `MDXRemote`/`EditorialContent` num Client
Component. Client Components existentes e por quê cada um precisa ser cliente:
- `NavLink.js` — `aria-current` via `usePathname()`; recebe só `href`/`children`.
- `SearchBox.js` — barra de busca sempre visível no cabeçalho, com popover de filtros; recebe
  o índice já montado no servidor (`lib/searchIndex.server.mjs`) e as categorias de produto
  via props.
- `ParallaxBackground.js` — reage a `pointermove` com duas camadas (fundo + halo),
  interpoladas via `requestAnimationFrame`; envolve a `<img>` de fundo já renderizada pelo
  servidor via `children`, nunca recebe conteúdo bruto.
- `TeamCarousel.js` — navegação do carrossel (scroll nativo, páginas, teclado); recebe só os
  campos enxutos de cada pessoa em destaque (`slug`/`name`/`position`/`summary`/`image`/`alt`).
- `TeamFilter.js` — chips de área; recebe só `{slug, area}[]` e alterna `display` nos itens
  já renderizados pelo servidor via `data-slug`, sem duplicar template.
- `AutoScrollBox.js` — rolagem automática ao passar o mouse; recebe a ficha+bio já
  renderizados pelo servidor via `children`.
- `ChapterIndex.js` — destaca o capítulo visível via `IntersectionObserver`; recebe só
  `{id, heading}[]`. Usado em `/empresa`.
- `ProductReviews.js` — formulário e lista de avaliações (nota/título/uso) por produto; usa
  `localStorage` dentro de `useEffect`/handlers, nunca no corpo do componente.
- `GuestbookWall.js` — mural de recados (nome + texto curto) por pessoa/grupo; mesmo padrão
  de armazenamento de `ProductReviews.js`, UI e campos diferentes.
- `CopyButton.js` — `navigator.clipboard`; recebe só `value`/`label` (strings).
- `CompareDialog.js` — abre um `<dialog>` nativo listando produtos comparáveis; recebe só
  `currentSlug` e a lista enxuta de produtos da mesma categoria.
- `IdeaButton.js` — botão flutuante + `<dialog>` do formulário "Envie sua ideia"; fica oculto
  enquanto o rodapé está visível (`IntersectionObserver` no próprio componente); envia via
  `fetch` para `/api/ideias`, nunca grava nada diretamente.

## Convenções

- Prosa, commits e conteúdo MDX em português; identificadores de código em inglês.
- Slugs em kebab-case minúsculo (`^[a-z0-9]+(-[a-z0-9]+)*$`), validado por `lib/content.mjs`.
- Campos de domínio seguem nomes do schema em `cms/estrutura.json` (ex.: `position`, não
  `role` — ver skill `webtech-content-contract` para o porquê).
- O slug `grupos` é reservado pela rota `/equipe/grupos/[slug]`: não crie
  `content/equipe/grupos.mdx` (ficaria inalcançável, a rota literal sempre tem prioridade
  sobre a dinâmica `/equipe/[slug]`).
- O campo `group` em `equipe` é opcional e aponta para o slug de um documento em `grupos`;
  uma pessoa sem `group` ou com um `group` que não existe aparece normalmente em "Equipe",
  sem erro.
- Campos em `equipe`: `area` (slug livre — `lideranca`/`engenharia`/`producao`/`comercial`/
  `qualidade` são os únicos com cor própria em `app/globals.css`; qualquer outro valor cai no
  tom neutro `--area-neutra` sem erro, via `lib/areas.mjs`), `secondary_position` (opcional,
  texto livre), `featured` (opcional; só o valor exato `"yes"` conta — é `widget: "string"`
  porque o editor não garante um widget booleano confiável) e `summary` (opcional, 1-2 frases
  curtas; sem ele, `lib/summary.mjs` deriva um resumo da bio).
- Campos em `produtos`: `group` (slug de um documento em `grupos`) e `lead` (slug de uma
  pessoa em `equipe`) — ambos resolvidos com `find` tolerante a slug ausente/inexistente,
  nunca quebram a página do produto.
- `category` em `produtos` não precisa ter um documento correspondente em `categorias` — o
  slug de uma categoria é sempre `slugify(category)` (sem acentos, `lib/slugify.mjs`), e uma
  categoria sem documento próprio ainda aparece em `/produtos`/na home com dados derivados do
  nome (`lib/categories.mjs`). Crie o documento em `categorias` quando quiser uma imagem e
  descrição próprias para aquele tipo de produto.

## Skills disponíveis

- **`webtech-content-contract`** — regras do contrato com o Webtech Editor: schema de
  `cms/estrutura.json`, convenção de pastas/slugs/imagens, frontmatter vs. corpo Markdown.
  Use antes de editar `estrutura.json` ou revisar frontmatter de um `.mdx`.
- **`desafio-checklist`** — checklist de validação do `DESAFIO.md` (teste decisivo, critérios
  de aceitação, `ENTREGA.md`). Use ao validar ou finalizar a entrega.
- **`scaffold-content`** — passo a passo para adicionar uma coleção, produto, membro de
  equipe ou página nova sem quebrar o contrato. Use ao criar conteúdo novo.

## Estado conhecido

O desafio "Aurora Studio" passou por quatro rodadas além do mínimo do `DESAFIO.md`. Rotas:
`/`, `/empresa`, `/produtos`, `/produtos/[slug]`, `/categorias/[slug]`, `/comparar`,
`/equipe`, `/equipe/[slug]`, `/equipe/grupos/[slug]`, `/numeros`, `/busca`, `/contato`,
`/api/ideias` (Route Handler, `POST`), `/paginas/[slug]` (rota genérica original, ainda serve
`boas-vindas` e, sem problema, também `empresa`/`contato`/`rodape`/`numeros`, mas não é
linkada para estes — rota literal sempre tem prioridade sobre a dinâmica no App Router,
então não há colisão). `/historia` foi removida: `next.config.mjs` redireciona
permanentemente para `/empresa`, que absorveu seu conteúdo e layout (logo grande, índice
lateral fixo por capítulo via `ChapterIndex.js`, linha do tempo).

Identidade visual escura (`color-scheme: dark`, tokens `--void`/`--surface`/`--ink`/
`--accent`/`--accent-light`/`--violet`/`--azure` em `app/globals.css`, contraste ≥4.5:1
conferido), imagens SVG autorais em estilo duotone roxo/azul com rim-light laranja, logo
próprio (`components/Logo.js` + `app/icon.svg`). Ficha técnica (`lib/sections.js` +
`components/SpecSheet.js`) em produtos, pessoas/grupos e contato; `/numeros` usa a variante
mista de `lib/numbers.mjs` (lista + prosa na mesma seção).

Coleção `grupos` (3 documentos, somando ~80 pessoas) e campo `group` em `equipe` (10 pessoas
cadastradas individualmente, mantendo `marina-costa`/`ana-lima`/`joao-silva`/`rodrigo-vieira`
— mais os 3 grupos; somando os grupos com liderança/engenharia/comercial sem grupo físico, a
empresa tem cerca de 85 pessoas no total, número usado em `empresa.mdx`/`numeros.mdx`).
`area` e `group` são dimensões independentes (função vs. departamento físico) — a
distribuição por `area` em `/numeros` não precisa somar 1:1 às contagens de cada grupo.
Nova coleção `categorias` (5 documentos: Câmeras, Áudio, Iluminação, Estabilização,
Monitores e acessórios) organizando os 13 produtos (2-3 por tipo).

Home com fundo fotográfico de um estúdio de fotografia vazio (licença sem exigência de
atribuição — fonte em `ENTREGA.md`, por isso nenhum crédito aparece no site), parallax em
duas camadas via `ParallaxBackground.js`, equipe em destaque (`featured: "yes"`, 6 pessoas =
2 páginas) via `TeamCarousel.js`, e uma seção "Produtos por tipo" linkando para
`/categorias/[slug]` em vez de uma grade de produtos solta. Busca sempre visível e
centralizada no cabeçalho, com filtros que funcionam sem texto digitado (`SearchBox.js` +
`/busca`). Comparador de produtos iniciado a partir da própria página do produto
(`CompareDialog.js` → `/comparar`). Avaliações com estrelas em produtos (`ProductReviews.js`)
e mural de recados em pessoas/grupos (`GuestbookWall.js`), ambos sobre `lib/comments.mjs`,
sem mensagem de "vazio" quando não há nenhum registro ainda. Popover "Envie sua ideia"
(`IdeaButton.js`) em todas as páginas, submetendo para `app/api/ideias/route.js`, que grava
em `storage/ideias/<uuid>/` via `lib/ideas-storage.mjs` (pasta git-ignorada; trocar o
adaptador de armazenamento antes de um lançamento real em hospedagem sem disco persistente).
Rodapé em blocos vindo de `content/paginas/rodape.mdx`, full-bleed.

`ENTREGA.md` existe e documenta execução, caminho do conteúdo, decisões técnicas, fonte da
fotografia, achados do code review e as respostas conceituais do desafio. `npm run check`
passa. Nada foi commitado ainda (verifique `git status`) — por instrução explícita, as
mudanças ficam locais até revisão.
