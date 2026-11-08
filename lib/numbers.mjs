import { parseSections, SPEC_LINE_RE } from "./sections.js";

// Convenção de `/numeros`: cada seção `## Título` começa com uma lista
// `- **Chave:** valor` (os pontos de dados do gráfico) e pode terminar com
// duas chaves especiais — `Destaque` (número grande de resumo) e `Período`
// (texto livre, ex. "2019 a 2024") — seguidas de um ou mais parágrafos de
// leitura, que alimentam o painel de informações ao lado do gráfico. Uma
// linha que não é nem bullet nem está em branco encerra a fase de lista;
// tudo depois é tratado como prosa, mesmo que volte a parecer uma lista.
export function toNumber(rawValue) {
  if (typeof rawValue !== "string") return null;
  const match = rawValue.trim().match(/^([\d.,]+)\s*(%|h)?$/);
  if (!match) return null;
  const numeric = Number(match[1].replace(/\./g, "").replace(",", "."));
  if (Number.isNaN(numeric)) return null;
  return { value: numeric, unit: match[2] || null };
}

export function metricsFromSpec(specSection) {
  if (!specSection || !Array.isArray(specSection.spec)) return [];
  return specSection.spec
    .map(({ key, value }) => {
      const parsed = toNumber(value);
      return parsed ? { label: key, value: parsed.value, unit: parsed.unit } : null;
    })
    .filter(Boolean);
}

export function parseMetricSection(rawSection) {
  if (!rawSection) return { data: [], highlight: null, period: null, reading: "" };

  const lines = rawSection.split("\n");
  const metrics = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === "") { i++; continue; }
    const match = line.match(SPEC_LINE_RE);
    if (!match) break;
    metrics.push({ key: match[1].trim(), value: match[2].trim() });
    i++;
  }
  const reading = lines.slice(i).map((line) => line.trim()).filter(Boolean).join(" ");

  let highlight = null;
  let period = null;
  const data = [];
  for (const { key, value } of metrics) {
    const normalizedKey = key.trim().toLowerCase();
    if (normalizedKey === "destaque") highlight = toNumber(value);
    else if (normalizedKey === "período" || normalizedKey === "periodo") period = value;
    else data.push({ key, value });
  }

  return { data, highlight, period, reading };
}

export function metricsFromBody(body, heading) {
  const sections = parseSections(body, { level: 2 });
  const section = sections.find((s) => s.heading.trim().toLowerCase() === heading.trim().toLowerCase());
  if (!section) return { data: [], highlight: null, period: null, reading: "", chart: [] };

  const { data, highlight, period, reading } = parseMetricSection(section.raw);
  const chart = metricsFromSpec({ spec: data });
  return { data, highlight, period, reading, chart };
}

// Variação percentual entre os dois últimos pontos numéricos de uma série —
// usada no painel de informações ("variação em relação ao período anterior").
// Sem pelo menos dois valores numéricos válidos, retorna null sem lançar.
export function computeVariation(chart) {
  if (!Array.isArray(chart) || chart.length < 2) return null;
  const prev = chart[chart.length - 2].value;
  const last = chart[chart.length - 1].value;
  if (!prev) return null;
  return ((last - prev) / prev) * 100;
}
