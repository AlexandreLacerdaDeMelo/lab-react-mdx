// Funções puras de string: dividem um corpo Markdown em seções por heading
// e reconhecem seções de "ficha técnica" no formato `- **Chave:** valor`.
// Sem remark-gfm (dependência não usada neste projeto), tabelas `| a | b |`
// não são compiladas pelo MDXRemote — por isso a ficha técnica usa listas.
export const SPEC_LINE_RE = /^-\s+\*\*(.+?):\*\*\s*(.+)$/;

function headingRegex(level) {
  return new RegExp(`^#{${level}}\\s+(.+)$`);
}

function finalizeSection(heading, bodyLines) {
  const raw = bodyLines.join("\n").trim();
  const nonBlank = bodyLines.map((line) => line.trim()).filter((line) => line !== "");
  const isSpec = nonBlank.length > 0 && nonBlank.every((line) => SPEC_LINE_RE.test(line));

  if (isSpec) {
    const spec = nonBlank.map((line) => {
      const [, key, value] = line.match(SPEC_LINE_RE);
      return { key: key.trim(), value: value.trim() };
    });
    return { heading, raw, kind: "spec", spec };
  }
  return { heading, raw, kind: "prose" };
}

export function parseSections(markdownBody, { level = 2 } = {}) {
  if (!markdownBody) return [];
  const headingRe = headingRegex(level);
  const sections = [];
  let current = null;

  for (const line of markdownBody.split("\n")) {
    const match = line.match(headingRe);
    if (match) {
      if (current) sections.push(finalizeSection(current.heading, current.bodyLines));
      current = { heading: match[1].trim(), bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    }
  }
  if (current) sections.push(finalizeSection(current.heading, current.bodyLines));

  return sections;
}

export function findSpecSection(sections, headingText) {
  if (!sections || !headingText) return null;
  const target = headingText.trim().toLowerCase();
  const found = sections.find((section) => section.heading.trim().toLowerCase() === target);
  return found && found.kind === "spec" ? found : null;
}

// Remove a seção reconhecida do corpo antes de renderizar o resto como Markdown normal,
// para a ficha técnica não aparecer duas vezes (uma como SpecSheet, outra como prosa).
export function stripSection(markdownBody, headingText, { level = 2 } = {}) {
  if (!markdownBody) return "";
  const headingRe = headingRegex(level);
  const target = headingText.trim().toLowerCase();
  const out = [];
  let skipping = false;

  for (const line of markdownBody.split("\n")) {
    const match = line.match(headingRe);
    if (match) {
      skipping = match[1].trim().toLowerCase() === target;
      if (skipping) continue;
    }
    if (!skipping) out.push(line);
  }

  return out.join("\n").trim();
}
