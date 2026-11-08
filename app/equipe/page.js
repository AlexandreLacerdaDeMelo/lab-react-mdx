import Link from "next/link";
import TeamListItem from "@/components/TeamListItem";
import TeamFilter from "@/components/TeamFilter";
import { listContent } from "@/lib/content.mjs";

export const metadata = {
  title: "Equipe",
  description: "Quem produz e testa cada entrega da Aurora.",
};

export default async function EquipePage() {
  const equipe = await listContent("equipe");
  const grupos = await listContent("grupos");

  if (!equipe.length) {
    return (
      <article>
        <p className="eyebrow">Time</p>
        <h1>Equipe</h1>
        <p>Nenhum integrante cadastrado no momento.</p>
      </article>
    );
  }

  const grupoSlugs = new Set(grupos.map((g) => g.slug));
  const porGrupo = grupos.map((grupo) => ({
    grupo,
    membros: equipe.filter((pessoa) => pessoa.frontmatter.group === grupo.slug),
  }));
  const semGrupo = equipe.filter((pessoa) => !grupoSlugs.has(pessoa.frontmatter.group));
  const pessoasParaFiltro = equipe.map((doc) => ({ slug: doc.slug, area: doc.frontmatter.area }));

  return (
    <article>
      <p className="eyebrow">Time</p>
      <h1>Equipe</h1>
      <TeamFilter pessoas={pessoasParaFiltro} />

      {semGrupo.length > 0 && (
        <section className="group-section">
          <h2>Liderança e áreas centrais</h2>
          <ul className="team-list">
            {semGrupo.map((doc) => (
              <TeamListItem key={doc.slug} slug={doc.slug} frontmatter={doc.frontmatter} content={doc.content} />
            ))}
          </ul>
        </section>
      )}

      {porGrupo.map(({ grupo, membros }) => (
        <section className="group-section" key={grupo.slug}>
          <h2><Link href={`/equipe/grupos/${grupo.slug}`}>{grupo.frontmatter.name}</Link></h2>
          <p className="lead">{grupo.frontmatter.description}</p>
          {membros.length > 0 ? (
            <ul className="team-list">
              {membros.map((doc) => (
                <TeamListItem key={doc.slug} slug={doc.slug} frontmatter={doc.frontmatter} content={doc.content} />
              ))}
            </ul>
          ) : (
            <p>Nenhum integrante listado individualmente neste grupo no momento.</p>
          )}
        </section>
      ))}
    </article>
  );
}
