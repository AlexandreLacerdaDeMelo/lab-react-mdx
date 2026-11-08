import Link from "next/link";
import TeamCarousel from "@/components/TeamCarousel";
import ParallaxBackground from "@/components/ParallaxBackground";
import { getContent, listContent } from "@/lib/content.mjs";
import { parseSections } from "@/lib/sections.js";
import { buildCategoryIndex } from "@/lib/categories.mjs";

export default async function Home() {
  const empresa = await getContent("paginas", "empresa");
  const produtos = await listContent("produtos");
  const categorias = await listContent("categorias");
  const equipe = await listContent("equipe");

  const sections = empresa ? parseSections(empresa.content, { level: 2 }) : [];
  // Home mostra menos da metade dos capítulos de /empresa, nunca metade ou mais.
  const take = sections.length > 0 ? Math.max(1, Math.ceil(sections.length / 2) - 1) : 0;
  const boxes = sections.slice(0, take);

  const categoriaIndex = buildCategoryIndex(produtos, categorias);

  const destaques = equipe
    .filter((doc) => doc.frontmatter.featured === "yes")
    .map((doc) => ({
      slug: doc.slug,
      name: doc.frontmatter.name,
      position: doc.frontmatter.position,
      summary: doc.frontmatter.summary,
      image: doc.frontmatter.image,
      alt: doc.frontmatter.alt,
    }));

  return (
    <>
      <ParallaxBackground>
        <img
          src="/images/paginas/empresa/estudio-fotografico.jpg"
          alt=""
          aria-hidden="true"
          width={2000}
          height={1125}
          loading="eager"
          fetchPriority="high"
        />
      </ParallaxBackground>
      <div className="home-panel numbered-sections">
        <p className="eyebrow">Aurora Studio</p>
        <h1>Produção audiovisual e os equipamentos para fazer ela acontecer.</h1>

        <section id="empresa">
          <h2>Quem somos</h2>
          {empresa ? (
            <>
              <p className="lead">{empresa.frontmatter.lead}</p>
              {boxes.length ? (
                <ul className="insight-grid">
                  {boxes.map((box) => (
                    <li className="card insight-card" key={box.heading}>
                      <p className="eyebrow">{box.heading}</p>
                      <p>{box.raw}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p>
                <Link href="/empresa">Conheça a nossa história</Link>{" "}·{" "}
                <Link href="/numeros">Ver a Aurora em números</Link>
              </p>
            </>
          ) : (
            <p>Conteúdo da empresa ainda não cadastrado.</p>
          )}
        </section>

        <section aria-labelledby="equipe">
          <h2 id="equipe">Destaques da equipe</h2>
          <TeamCarousel pessoas={destaques} />
          <p><Link href="/equipe">Conhecer a equipe completa</Link></p>
        </section>

        <section aria-labelledby="tipos">
          <h2 id="tipos">Produtos por tipo</h2>
          {categoriaIndex.length ? (
            <ul className="grid">
              {categoriaIndex.map((categoria) => (
                <li className="card" key={categoria.slug}>
                  {categoria.image && <div className="frame"><img src={categoria.image} alt={categoria.alt || ""} /></div>}
                  <h3><Link href={`/categorias/${categoria.slug}`}>{categoria.name}</Link></h3>
                  {categoria.description && <p>{categoria.description}</p>}
                  <p className="meta">{categoria.count} produto{categoria.count === 1 ? "" : "s"}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum tipo de produto cadastrado no momento.</p>
          )}
          <p><Link href="/produtos">Ver todos os produtos</Link></p>
        </section>
      </div>
    </>
  );
}
