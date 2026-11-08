import Link from "next/link";
import { notFound } from "next/navigation";
import EditorialContent from "@/components/EditorialContent";
import TeamListItem from "@/components/TeamListItem";
import SpecSheet from "@/components/SpecSheet";
import ProductCard from "@/components/ProductCard";
import GuestbookWall from "@/components/GuestbookWall";
import { getContent, listContent } from "@/lib/content.mjs";
import { parseSections, findSpecSection, stripSection } from "@/lib/sections.js";

const PERFIL_HEADING = "Perfil rápido";

export async function generateStaticParams() {
  return (await listContent("grupos")).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = await getContent("grupos", slug);
  return doc
    ? { title: doc.frontmatter.name, description: doc.frontmatter.description }
    : { title: "Grupo não encontrado" };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const doc = await getContent("grupos", slug);
  if (!doc) notFound();

  const { name, image, alt } = doc.frontmatter;
  const sections = parseSections(doc.content);
  const perfil = findSpecSection(sections, PERFIL_HEADING);
  const corpo = perfil ? stripSection(doc.content, PERFIL_HEADING) : doc.content;

  const equipe = await listContent("equipe");
  const membros = equipe.filter((pessoa) => pessoa.frontmatter.group === slug);

  const produtos = await listContent("produtos");
  const produtosRelacionados = produtos.filter((p) => p.frontmatter.group === slug);

  return (
    <article>
      <p className="eyebrow">Grupo</p>
      <h1>{name}</h1>
      {image && <div className="frame"><img src={image} alt={alt || ""} /></div>}
      {perfil && <SpecSheet items={perfil.spec} />}
      <EditorialContent source={corpo} />

      <section className="group-section">
        <h2>Integrantes</h2>
        {membros.length ? (
          <ul className="team-list">
            {membros.map((pessoa) => (
              <TeamListItem key={pessoa.slug} slug={pessoa.slug} frontmatter={pessoa.frontmatter} content={pessoa.content} />
            ))}
          </ul>
        ) : (
          <p>Nenhum integrante listado individualmente neste grupo no momento.</p>
        )}
      </section>

      {produtosRelacionados.length > 0 && (
        <section>
          <h2>Produtos em que atuou</h2>
          <ul className="grid">
            {produtosRelacionados.map((produto) => (
              <ProductCard key={produto.slug} slug={produto.slug} frontmatter={produto.frontmatter} />
            ))}
          </ul>
        </section>
      )}

      <p><Link href="/equipe">Voltar para equipe</Link></p>

      <GuestbookWall colecao="grupos" slug={slug} />
    </article>
  );
}
