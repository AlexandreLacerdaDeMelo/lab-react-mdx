import Link from "next/link";
import { notFound } from "next/navigation";
import EditorialContent from "@/components/EditorialContent";
import SpecSheet from "@/components/SpecSheet";
import ProductReviews from "@/components/ProductReviews";
import CompareDialog from "@/components/CompareDialog";
import { getContent, listContent } from "@/lib/content.mjs";
import { parseSections, findSpecSection, stripSection } from "@/lib/sections.js";

const SPEC_HEADING = "Especificações técnicas";

export async function generateStaticParams() {
  return (await listContent("produtos")).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = await getContent("produtos", slug);
  return doc
    ? { title: doc.frontmatter.name, description: doc.frontmatter.description }
    : { title: "Produto não encontrado" };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const doc = await getContent("produtos", slug);
  if (!doc) notFound();

  const { name, category, image, alt, group, lead } = doc.frontmatter;

  const sections = parseSections(doc.content);
  const specs = findSpecSection(sections, SPEC_HEADING);
  const corpo = specs ? stripSection(doc.content, SPEC_HEADING) : doc.content;

  const [produtos, grupos, equipe] = await Promise.all([
    listContent("produtos"),
    listContent("grupos"),
    listContent("equipe"),
  ]);
  const index = produtos.findIndex((item) => item.slug === slug);
  const next = produtos[(index + 1) % produtos.length];
  const grupoResponsavel = grupos.find((g) => g.slug === group);
  const pessoaResponsavel = equipe.find((p) => p.slug === lead);
  const comparaveis = produtos
    .filter((p) => p.slug !== slug && p.frontmatter.category === category)
    .map((p) => ({ slug: p.slug, name: p.frontmatter.name, image: p.frontmatter.image, alt: p.frontmatter.alt }));

  return (
    <article>
      <p className="eyebrow">{category}</p>
      <h1>{name}</h1>
      {image && <div className="frame"><img src={image} alt={alt || ""} /></div>}
      <p>
        {grupoResponsavel && (
          <span className="badge azure">
            <Link href={`/equipe/grupos/${grupoResponsavel.slug}`}>{grupoResponsavel.frontmatter.name}</Link>
          </span>
        )}
        {pessoaResponsavel && (
          <span className="badge">
            <Link href={`/equipe/${pessoaResponsavel.slug}`}>{pessoaResponsavel.frontmatter.name}</Link>
          </span>
        )}
      </p>
      {specs && <SpecSheet items={specs.spec} />}
      <EditorialContent source={corpo} />
      <div>
        <CompareDialog currentSlug={slug} comparaveis={comparaveis} />
      </div>
      <p>
        <Link href="/produtos">Voltar para produtos</Link>
        {next && next.slug !== slug && (
          <> · <Link href={`/produtos/${next.slug}`}>Próximo produto: {next.frontmatter.name}</Link></>
        )}
      </p>
      <ProductReviews colecao="produtos" slug={slug} />
    </article>
  );
}
