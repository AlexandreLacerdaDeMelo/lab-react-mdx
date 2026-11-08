import Link from "next/link";
import { buildSearchIndex } from "@/lib/searchIndex.server.mjs";
import { searchIndex } from "@/lib/search.mjs";

export const metadata = { title: "Busca" };

export default async function BuscaPage({ searchParams }) {
  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q : "";
  const tipo = typeof params?.tipo === "string" && params.tipo ? params.tipo : null;
  const categoria = typeof params?.categoria === "string" && params.categoria ? params.categoria : null;
  const hasFilter = Boolean(tipo || categoria);

  const index = await buildSearchIndex();
  const options = {};
  if (tipo) options.type = tipo;
  if (categoria) options.category = categoria;
  const results = query || hasFilter ? searchIndex(index, query, options) : [];

  const descricaoFiltro = [tipo === "produto" ? "Produtos" : tipo === "pessoa" ? "Equipe" : null, categoria]
    .filter(Boolean)
    .join(" · ");

  return (
    <article>
      <h1>Busca</h1>
      <p className="meta">
        {query
          ? `Resultados para "${query}"${descricaoFiltro ? ` em ${descricaoFiltro}` : ""}`
          : hasFilter
            ? `Resultados em ${descricaoFiltro}`
            : "Digite um termo ou escolha um filtro para buscar produtos ou equipe."}
      </p>
      {(query || hasFilter) && results.length === 0 ? (
        <p>Nenhum resultado encontrado.</p>
      ) : (
        <ul className="grid">
          {results.map((item) => (
            <li className="card" key={`${item.type}-${item.slug}`}>
              {item.image && <div className="frame"><img src={item.image} alt="" /></div>}
              <p className="eyebrow">{item.type === "produto" ? "Produto" : "Equipe"}</p>
              <h3>
                <Link href={`/${item.type === "produto" ? "produtos" : "equipe"}/${item.slug}`}>{item.title}</Link>
              </h3>
              <p>{item.subtitle}</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
