import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { listContent } from "@/lib/content.mjs";
import { buildCategoryIndex, productsForCategory } from "@/lib/categories.mjs";

export async function generateStaticParams() {
  const [produtos, categorias] = await Promise.all([listContent("produtos"), listContent("categorias")]);
  return buildCategoryIndex(produtos, categorias).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [produtos, categorias] = await Promise.all([listContent("produtos"), listContent("categorias")]);
  const categoria = buildCategoryIndex(produtos, categorias).find((c) => c.slug === slug);
  return categoria ? { title: categoria.name, description: categoria.description || undefined } : { title: "Categoria não encontrada" };
}

export default async function CategoriaPage({ params }) {
  const { slug } = await params;
  const [produtos, categorias] = await Promise.all([listContent("produtos"), listContent("categorias")]);
  const categoria = buildCategoryIndex(produtos, categorias).find((c) => c.slug === slug);
  if (!categoria) notFound();

  const produtosDaCategoria = productsForCategory(produtos, slug);

  return (
    <article>
      <p className="eyebrow">Categoria</p>
      {categoria.image && <div className="frame"><img src={categoria.image} alt={categoria.alt || ""} /></div>}
      <h1>{categoria.name}</h1>
      {categoria.description && <p className="lead">{categoria.description}</p>}
      {produtosDaCategoria.length ? (
        <ul className="grid">
          {produtosDaCategoria.map((doc) => (
            <ProductCard key={doc.slug} slug={doc.slug} frontmatter={doc.frontmatter} />
          ))}
        </ul>
      ) : (
        <p>Nenhum produto cadastrado nesta categoria no momento.</p>
      )}
      <p><Link href="/produtos">Ver todos os produtos</Link></p>
    </article>
  );
}
