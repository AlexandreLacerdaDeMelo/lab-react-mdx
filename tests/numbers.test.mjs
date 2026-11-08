import { test } from "node:test";
import assert from "node:assert/strict";
import { toNumber, metricsFromSpec, parseMetricSection, metricsFromBody, computeVariation } from "../lib/numbers.mjs";

test("toNumber reconhece inteiro simples", () => {
  assert.deepEqual(toNumber("18000"), { value: 18000, unit: null });
});

test("toNumber reconhece porcentagem e hora", () => {
  assert.deepEqual(toNumber("32%"), { value: 32, unit: "%" });
  assert.deepEqual(toNumber("4h"), { value: 4, unit: "h" });
});

test("toNumber reconhece separador de milhar com ponto", () => {
  assert.deepEqual(toNumber("18.000"), { value: 18000, unit: null });
});

test("toNumber retorna null para texto não numérico, sem lançar", () => {
  assert.equal(toNumber("Itapema, SC"), null);
  assert.equal(toNumber(""), null);
  assert.equal(toNumber(undefined), null);
});

test("metricsFromSpec ignora entradas malformadas sem derrubar a lista", () => {
  const spec = { spec: [{ key: "Cidade", value: "Itapema, SC" }, { key: "Pessoas", value: "85" }] };
  assert.deepEqual(metricsFromSpec(spec), [{ label: "Pessoas", value: 85, unit: null }]);
});

test("metricsFromSpec em seção vazia/ausente retorna array vazio", () => {
  assert.deepEqual(metricsFromSpec(null), []);
  assert.deepEqual(metricsFromSpec({ spec: [] }), []);
});

test("parseMetricSection separa lista inicial, Destaque/Período e o parágrafo de leitura", () => {
  const raw = [
    "- **2023:** 14500",
    "- **2024:** 18000",
    "- **Destaque:** 18000",
    "- **Período:** 2019 a 2024",
    "",
    "A produção cresceu de forma constante.",
  ].join("\n");
  const resultado = parseMetricSection(raw);
  assert.deepEqual(resultado.data, [{ key: "2023", value: "14500" }, { key: "2024", value: "18000" }]);
  assert.deepEqual(resultado.highlight, { value: 18000, unit: null });
  assert.equal(resultado.period, "2019 a 2024");
  assert.equal(resultado.reading, "A produção cresceu de forma constante.");
});

test("parseMetricSection sem Destaque/Período nem leitura não lança", () => {
  const resultado = parseMetricSection("- **A:** 1\n- **B:** 2");
  assert.equal(resultado.highlight, null);
  assert.equal(resultado.period, null);
  assert.equal(resultado.reading, "");
});

test("parseMetricSection com entrada vazia retorna estrutura neutra", () => {
  assert.deepEqual(parseMetricSection(""), { data: [], highlight: null, period: null, reading: "" });
  assert.deepEqual(parseMetricSection(null), { data: [], highlight: null, period: null, reading: "" });
});

test("metricsFromBody monta os dados do gráfico a partir do título da seção", () => {
  const body = "## Time por área\n- **Liderança:** 4\n- **Engenharia:** 14\n\nTexto de leitura.";
  const resultado = metricsFromBody(body, "Time por área");
  assert.deepEqual(resultado.chart, [
    { label: "Liderança", value: 4, unit: null },
    { label: "Engenharia", value: 14, unit: null },
  ]);
  assert.equal(resultado.reading, "Texto de leitura.");
});

test("metricsFromBody com título inexistente retorna estrutura vazia sem lançar", () => {
  const resultado = metricsFromBody("## Outra seção\n- **A:** 1", "Time por área");
  assert.deepEqual(resultado.chart, []);
  assert.deepEqual(resultado.data, []);
});

test("computeVariation calcula a variação percentual entre os dois últimos pontos", () => {
  const chart = [{ label: "2023", value: 14500 }, { label: "2024", value: 18000 }];
  const variacao = computeVariation(chart);
  assert.ok(Math.abs(variacao - 24.14) < 0.1);
});

test("computeVariation retorna null com menos de dois pontos ou base zero", () => {
  assert.equal(computeVariation([]), null);
  assert.equal(computeVariation([{ value: 10 }]), null);
  assert.equal(computeVariation([{ value: 0 }, { value: 10 }]), null);
});
