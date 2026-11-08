import { stripAccents } from "./slugify.mjs";

function normalize(value) {
  return stripAccents(value).toLowerCase().trim();
}

export function matchesQuery(entry, query) {
  const needle = normalize(query);
  if (!needle) return false;
  const haystack = normalize(
    [entry.title, entry.subtitle, entry.category, entry.description].filter(Boolean).join(" ")
  );
  return haystack.includes(needle);
}

// Com filtro de tipo/categoria ativo, uma consulta vazia já lista os
// resultados daquele filtro (busca "só com filtros"). Sem texto e sem
// filtro nenhum, não há nada para listar.
export function searchIndex(entries, query, { type, category } = {}) {
  const list = Array.isArray(entries) ? entries : [];
  const hasFilter = Boolean(type || category);
  const needle = (query || "").trim();

  if (!needle && !hasFilter) return [];

  return list.filter((entry) => {
    if (type && entry.type !== type) return false;
    if (category && entry.category !== category) return false;
    return needle ? matchesQuery(entry, query) : true;
  });
}
