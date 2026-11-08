import { listContent } from "@/lib/content.mjs";
import { buildCategoryIndex } from "@/lib/categories.mjs";

const BASE_URL = "https://aurorastudio.example";

export default async function sitemap() {
  const [produtos, equipe, grupos, categorias] = await Promise.all([
    listContent("produtos"),
    listContent("equipe"),
    listContent("grupos"),
    listContent("categorias"),
  ]);

  const categoriaIndex = buildCategoryIndex(produtos, categorias);

  const staticRoutes = ["", "/empresa", "/produtos", "/equipe", "/numeros", "/contato"].map((path) => ({
    url: `${BASE_URL}${path}`,
  }));

  const produtoRoutes = produtos.map((doc) => ({ url: `${BASE_URL}/produtos/${doc.slug}` }));
  const equipeRoutes = equipe.map((doc) => ({ url: `${BASE_URL}/equipe/${doc.slug}` }));
  const grupoRoutes = grupos.map((doc) => ({ url: `${BASE_URL}/equipe/grupos/${doc.slug}` }));
  const categoriaRoutes = categoriaIndex.map((categoria) => ({ url: `${BASE_URL}/categorias/${categoria.slug}` }));

  return [...staticRoutes, ...produtoRoutes, ...equipeRoutes, ...grupoRoutes, ...categoriaRoutes];
}
