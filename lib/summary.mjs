function firstParagraph(markdownBody) {
  if (!markdownBody) return "";
  const lines = markdownBody.split("\n");
  let i = 0;
  while (i < lines.length && (lines[i].trim() === "" || /^#{1,6}\s/.test(lines[i]))) i++;
  const block = [];
  while (i < lines.length && lines[i].trim() !== "") {
    block.push(lines[i].replace(/^>\s?/, ""));
    i++;
  }
  return block.join(" ").trim();
}

// Corta no fim de uma frase perto do limite; sem ponto final disponível, corta
// na última palavra inteira e marca com "…". Usado quando o frontmatter não
// tem `summary` — nunca corta uma palavra no meio.
export function summarize(markdownBody, { maxChars = 140 } = {}) {
  const paragraph = firstParagraph(markdownBody);
  if (!paragraph) return "";
  if (paragraph.length <= maxChars) return paragraph;

  const windowText = paragraph.slice(0, maxChars);
  const lastEnd = Math.max(windowText.lastIndexOf(". "), windowText.lastIndexOf("! "), windowText.lastIndexOf("? "));
  if (lastEnd > 0) return windowText.slice(0, lastEnd + 1).trim();

  const lastSpace = windowText.lastIndexOf(" ");
  const cut = lastSpace > 0 ? windowText.slice(0, lastSpace) : windowText;
  return `${cut.trim()}…`;
}
