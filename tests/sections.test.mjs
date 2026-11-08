import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSections, findSpecSection, stripSection } from "../lib/sections.js";

test("seção só com linhas chave:valor vira ficha técnica (spec)", () => {
  const body = "## Especificações técnicas\n- **Peso:** 320g\n- **Bateria:** 2h";
  const [section] = parseSections(body);
  assert.equal(section.kind, "spec");
  assert.deepEqual(section.spec, [
    { key: "Peso", value: "320g" },
    { key: "Bateria", value: "2h" },
  ]);
});

test("seção com uma linha fora do padrão cai inteira para prosa", () => {
  const body = "## Especificações técnicas\n- **Peso:** 320g\nUm parágrafo solto aqui.";
  const [section] = parseSections(body);
  assert.equal(section.kind, "prose");
});

test("heading ausente: findSpecSection retorna null", () => {
  const sections = parseSections("## Outra coisa\n- **A:** b");
  assert.equal(findSpecSection(sections, "Especificações técnicas"), null);
});

test("seção vazia (heading sem corpo) vira prosa vazia, sem erro", () => {
  const body = "## Vazia\n## Próxima\n- **A:** b";
  const [vazia] = parseSections(body);
  assert.equal(vazia.kind, "prose");
  assert.equal(vazia.raw, "");
});

test("tabela GFM literal não bate com o padrão e cai para prosa", () => {
  const body = "## Especificações técnicas\n| Chave | Valor |\n| --- | --- |\n| Peso | 320g |";
  const [section] = parseSections(body);
  assert.equal(section.kind, "prose");
});

test("busca de heading é tolerante a maiúsculas/minúsculas e espaços", () => {
  const sections = parseSections("##   Especificações Técnicas   \n- **A:** b");
  assert.equal(findSpecSection(sections, "especificações técnicas").kind, "spec");
});

test("múltiplas seções mantêm a ordem do documento", () => {
  const body = "## Um\n- **A:** 1\n## Dois\nTexto solto.";
  const sections = parseSections(body);
  assert.deepEqual(sections.map((s) => s.heading), ["Um", "Dois"]);
});

test("entrada vazia ou nula nunca lança erro", () => {
  assert.deepEqual(parseSections(""), []);
  assert.deepEqual(parseSections(null), []);
  assert.deepEqual(parseSections(undefined), []);
  assert.equal(stripSection(null, "Qualquer"), "");
});

test("stripSection remove só a seção indicada, preservando o resto", () => {
  const body = "Abertura.\n\n## Especificações técnicas\n- **A:** 1\n\n## Outra\nFica aqui.";
  const resultado = stripSection(body, "Especificações técnicas");
  assert.doesNotMatch(resultado, /Especificações técnicas/);
  assert.match(resultado, /Abertura\./);
  assert.match(resultado, /Fica aqui\./);
});
