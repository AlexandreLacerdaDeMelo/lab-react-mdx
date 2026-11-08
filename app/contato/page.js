import CopyButton from "@/components/CopyButton";
import { getContent } from "@/lib/content.mjs";
import { parseSections, stripSection } from "@/lib/sections.js";
import EditorialContent from "@/components/EditorialContent";

const LINK_BUILDERS = {
  Email: (value) => `mailto:${value}`,
  Telefone: (value) => `tel:${value.replace(/[^\d+]/g, "")}`,
  WhatsApp: (value) => `https://wa.me/${value.replace(/[^\d]/g, "")}`,
};

const COPYABLE = new Set(["Email", "Telefone", "WhatsApp"]);

export async function generateMetadata() {
  const doc = await getContent("paginas", "contato");
  return doc
    ? { title: doc.frontmatter.title, description: doc.frontmatter.lead }
    : { title: "Contato" };
}

export default async function ContatoPage() {
  const doc = await getContent("paginas", "contato");

  if (!doc) {
    return (
      <article>
        <p className="eyebrow">Contato</p>
        <h1>Nossos canais de contato estão sendo atualizados</h1>
        <p>Volte em breve para encontrar as formas de falar com a gente.</p>
      </article>
    );
  }

  const sections = parseSections(doc.content, { level: 2 });
  const blocks = sections.filter((section) => section.kind === "spec");
  const headings = new Set(blocks.map((b) => b.heading));
  let resto = doc.content;
  headings.forEach((heading) => { resto = stripSection(resto, heading); });

  return (
    <article>
      <p className="eyebrow">Fale com a gente</p>
      <h1>{doc.frontmatter.title}</h1>
      <p className="lead">{doc.frontmatter.lead}</p>

      <div className="contact-grid">
        {blocks.map((block) => {
          const buildLink = LINK_BUILDERS[block.heading];
          const copyable = COPYABLE.has(block.heading);
          return (
            <div className="card contact-box" key={block.heading}>
              <h2>{block.heading}</h2>
              {block.spec.map(({ key, value }) => (
                <p key={key}>
                  <span className="eyebrow">{key}</span><br />
                  {buildLink ? <a href={buildLink(value)}>{value}</a> : value}
                  {copyable && <CopyButton value={value} label={key} />}
                </p>
              ))}
            </div>
          );
        })}
      </div>

      <EditorialContent source={resto} />
    </article>
  );
}
