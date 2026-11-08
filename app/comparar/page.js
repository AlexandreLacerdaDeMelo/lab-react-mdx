import Link from "next/link";
import { listContent } from "@/lib/content.mjs";
import { parseSections, findSpecSection } from "@/lib/sections.js";
import { validateSelection, buildComparisonRows } from "@/lib/compare.mjs";

const SPEC_HEADING = "Especificações técnicas";

export const metadata = { title: "Comparar produtos" };

export default async function CompararPage({ searchParams }) {
  const params = await searchParams;
  const raw = typeof params?.p === "string" ? params.p : "";
  const slugs = raw.split(",").map((s) => s.trim()).filter(Boolean);

  if (slugs.length === 0) {
    return (
      <article>
        <h1>Comparar produtos</h1>
        <p>Abra um produto e use o botão &ldquo;Comparar&rdquo; para escolher de 2 a 3 produtos da mesma categoria.</p>
        <p><Link href="/produtos">Ver produtos</Link></p>
      </article>
    );
  }

  const produtos = await listContent("produtos");
  const productsBySlug = new Map(
    produtos.map((doc) => [
      doc.slug,
      {
        slug: doc.slug,
        name: doc.frontmatter.name,
        category: doc.frontmatter.category,
        specSection: findSpecSection(parseSections(doc.content), SPEC_HEADING),
      },
    ])
  );

  const validation = validateSelection(slugs, productsBySlug);

  if (!validation.ok) {
    return (
      <article>
        <h1>Comparar produtos</h1>
        <p>{validation.message}</p>
        <p><Link href="/produtos">Voltar para produtos</Link></p>
      </article>
    );
  }

  const { category, rows } = buildComparisonRows(validation.products);

  return (
    <article>
      <p className="eyebrow">{category}</p>
      <h1>Comparar produtos</h1>
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th scope="col">Especificação</th>
              {validation.products.map((p) => <th scope="col" key={p.slug}>{p.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const distinctValues = new Set(row.values.values());
              const hasDiff = distinctValues.size > 1;
              return (
                <tr key={row.key}>
                  <th scope="row">{row.key}</th>
                  {validation.products.map((p) => (
                    <td key={p.slug} className={hasDiff ? "diff" : undefined}>
                      {row.values.get(p.slug) ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p><Link href="/produtos">Voltar para produtos</Link></p>
    </article>
  );
}
