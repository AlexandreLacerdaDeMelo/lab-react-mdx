import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { listContent } from "@/lib/content.mjs";
import { buildCategoryIndex, productsForCategory } from "@/lib/categories.mjs";

export const metadata = {
  title: "Produtos",
  description: "Equipamentos de captura testados em produção pela Aurora Studio.",
};

export default async function ProdutosPage() {
  const [produtos, categorias] = await Promise.all([listContent("produtos"), listContent("categorias")]);
  const categoriaIndex = buildCategoryIndex(produtos, categorias);

  return (
    <article>
      <p className="eyebrow">Catálogo</p>
      <h1>Produtos</h1>
      {produtos.length ? (
        categoriaIndex.map((categoria) => (
          <section className="group-section" key={categoria.slug}>
            <h2><Link href={`/categorias/${categoria.slug}`}>{categoria.name}</Link></h2>
            <ul className="grid">
              {productsForCategory(produtos, categoria.slug).map((doc) => (
                <ProductCard key={doc.slug} slug={doc.slug} frontmatter={doc.frontmatter} />
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p>Nenhum produto cadastrado no momento.</p>
      )}
    </article>
  );
}
