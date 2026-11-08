import "server-only";
import { listContent } from "@/lib/content.mjs";

export async function buildSearchIndex() {
  const [produtos, equipe] = await Promise.all([listContent("produtos"), listContent("equipe")]);

  const produtoEntries = produtos.map((doc) => ({
    type: "produto",
    slug: doc.slug,
    title: doc.frontmatter.name,
    subtitle: doc.frontmatter.category,
    category: doc.frontmatter.category,
    description: doc.frontmatter.description,
    image: doc.frontmatter.image,
  }));

  const equipeEntries = equipe.map((doc) => ({
    type: "pessoa",
    slug: doc.slug,
    title: doc.frontmatter.name,
    subtitle: doc.frontmatter.position,
    category: doc.frontmatter.area,
    description: doc.frontmatter.summary || doc.frontmatter.position,
    image: doc.frontmatter.image,
  }));

  return [...produtoEntries, ...equipeEntries];
}

export async function productCategories() {
  const produtos = await listContent("produtos");
  return [...new Set(produtos.map((doc) => doc.frontmatter.category).filter(Boolean))];
}
