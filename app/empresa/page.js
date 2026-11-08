import Logo from "@/components/Logo";
import EditorialContent from "@/components/EditorialContent";
import ChapterIndex from "@/components/ChapterIndex";
import { getContent } from "@/lib/content.mjs";
import { parseSections } from "@/lib/sections.js";
import { slugify } from "@/lib/slugify.mjs";

export async function generateMetadata() {
  const doc = await getContent("paginas", "empresa");
  return doc
    ? { title: "Empresa", description: doc.frontmatter.lead }
    : { title: "Empresa" };
}

export default async function EmpresaPage() {
  const doc = await getContent("paginas", "empresa");

  if (!doc) {
    return (
      <article>
        <p className="eyebrow">Empresa</p>
        <h1>Nossa história está sendo preparada</h1>
        <p>Em breve você encontrará aqui a trajetória completa da Aurora.</p>
      </article>
    );
  }

  const sections = parseSections(doc.content, { level: 2 });
  const chapters = sections.map((section) => ({ id: slugify(section.heading), heading: section.heading }));

  return (
    <article>
      <div className="empresa-hero">
        <Logo variant="icon" titleId="logo-empresa" size={64} />
        <div>
          <p className="eyebrow">Empresa</p>
          <h1>{doc.frontmatter.title}</h1>
          <p className="lead">{doc.frontmatter.lead}</p>
        </div>
      </div>

      <div className="empresa-layout">
        <ChapterIndex chapters={chapters} />
        <div className="timeline">
          {sections.map((section, index) => (
            <section key={chapters[index].id} id={chapters[index].id} className="timeline-chapter">
              <h2>{section.heading}</h2>
              <EditorialContent source={section.raw} />
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
