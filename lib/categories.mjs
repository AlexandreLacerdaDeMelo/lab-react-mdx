import { slugify } from "./slugify.mjs";

// Combina as categorias cadastradas em `categorias` com as categorias que só
// existem no campo `category` dos produtos (sem documento próprio ainda) —
// essas aparecem com dados derivados do nome, sem erro.
export function buildCategoryIndex(produtos, categorias) {
  const bySlug = new Map();

  for (const doc of categorias || []) {
    bySlug.set(doc.slug, {
      slug: doc.slug,
      name: doc.frontmatter.name,
      description: doc.frontmatter.description || null,
      image: doc.frontmatter.image || null,
      alt: doc.frontmatter.alt || null,
      count: 0,
    });
  }

  for (const produto of produtos || []) {
    const categoryName = produto.frontmatter.category;
    if (!categoryName) continue;
    const slug = slugify(categoryName);
    if (!bySlug.has(slug)) {
      bySlug.set(slug, { slug, name: categoryName, description: null, image: null, alt: null, count: 0 });
    }
    bySlug.get(slug).count += 1;
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function productsForCategory(produtos, categorySlug) {
  return (produtos || []).filter((p) => slugify(p.frontmatter.category) === categorySlug);
}
