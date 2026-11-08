import Link from "next/link";
import { notFound } from "next/navigation";
import EditorialContent from "@/components/EditorialContent";
import SpecSheet from "@/components/SpecSheet";
import AutoScrollBox from "@/components/AutoScrollBox";
import ProductCard from "@/components/ProductCard";
import GuestbookWall from "@/components/GuestbookWall";
import { getContent, listContent } from "@/lib/content.mjs";
import { parseSections, findSpecSection, stripSection } from "@/lib/sections.js";
import { areaLabel } from "@/lib/areas.mjs";

const PERFIL_HEADING = "Perfil rápido";

export async function generateStaticParams() {
  return (await listContent("equipe")).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = await getContent("equipe", slug);
  return doc
    ? { title: doc.frontmatter.name, description: doc.frontmatter.position }
    : { title: "Integrante não encontrado" };
}

export default async function Page({ params }) {
  const { slug } = await params;
  // "grupos" é um segmento de rota reservado por /equipe/grupos/[slug].
  if (slug === "grupos") notFound();

  const doc = await getContent("equipe", slug);
  if (!doc) notFound();

  const { name, position, secondary_position, area, group, image, alt } = doc.frontmatter;

  const grupos = await listContent("grupos");
  const grupoAtual = grupos.find((g) => g.slug === group);

  const sections = parseSections(doc.content);
  const perfil = findSpecSection(sections, PERFIL_HEADING);
  const corpo = perfil ? stripSection(doc.content, PERFIL_HEADING) : doc.content;

  const equipe = await listContent("equipe");
  const index = equipe.findIndex((item) => item.slug === slug);
  const proxima = equipe[(index + 1) % equipe.length];

  const produtos = await listContent("produtos");
  const produtosRelacionados = produtos.filter((p) => p.frontmatter.lead === slug);

  return (
    <article>
      <div className="person-detail-grid">
        {image && (
          <div className="frame-halo small">
            <div className="frame portrait"><img src={image} alt={alt || ""} /></div>
          </div>
        )}
        <div>
          <h1>{name}</h1>
          <p>
            <span className="badge">{position}</span>
            {grupoAtual && <span className="badge azure">{grupoAtual.frontmatter.name}</span>}
          </p>
          {secondary_position && <p className="meta">{secondary_position}</p>}
          <p className="area-label">{areaLabel(area)}</p>

          <AutoScrollBox label={`Biografia de ${name}`}>
            {perfil && <SpecSheet items={perfil.spec} />}
            <EditorialContent source={corpo} />
          </AutoScrollBox>
        </div>
      </div>

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

      <p>
        <Link href="/equipe">Voltar para equipe</Link>
        {grupoAtual && <> · <Link href={`/equipe/grupos/${grupoAtual.slug}`}>Ver grupo: {grupoAtual.frontmatter.name}</Link></>}
        {proxima && proxima.slug !== slug && <> · <Link href={`/equipe/${proxima.slug}`}>Próxima pessoa: {proxima.frontmatter.name}</Link></>}
      </p>

      <GuestbookWall colecao="equipe" slug={slug} />
    </article>
  );
}
