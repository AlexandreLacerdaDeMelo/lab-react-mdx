import { test } from "node:test";
import assert from "node:assert/strict";
import { validateSelection, buildComparisonRows } from "../lib/compare.mjs";

const byCategory = new Map([
  ["camera-compacta", { slug: "camera-compacta", category: "Captura" }],
  ["microfone-shotgun", { slug: "microfone-shotgun", category: "Áudio" }],
  ["tripe-aurora-steady", { slug: "tripe-aurora-steady", category: "Suporte e movimento" }],
]);

test("validateSelection rejeita menos de 2 produtos", () => {
  const result = validateSelection(["camera-compacta"], byCategory);
  assert.equal(result.ok, false);
  assert.match(result.message, /pelo menos 2/);
});

test("validateSelection rejeita mais de 3 produtos", () => {
  const result = validateSelection(["a", "b", "c", "d"], byCategory);
  assert.equal(result.ok, false);
  assert.match(result.message, /no máximo 3/);
});

test("validateSelection rejeita slug inexistente", () => {
  const result = validateSelection(["camera-compacta", "nao-existe"], byCategory);
  assert.equal(result.ok, false);
  assert.match(result.message, /não encontrado/);
});

test("validateSelection rejeita categorias diferentes", () => {
  const result = validateSelection(["camera-compacta", "microfone-shotgun"], byCategory);
  assert.equal(result.ok, false);
  assert.match(result.message, /mesma categoria/);
});

test("validateSelection aceita 2-3 produtos da mesma categoria", () => {
  const result = validateSelection(["camera-compacta"], byCategory);
  assert.equal(result.ok, false);
});

test("buildComparisonRows alinha chaves e usa null para ausentes", () => {
  const products = [
    { slug: "a", category: "Captura", specSection: { spec: [{ key: "Peso", value: "320g" }, { key: "Bateria", value: "2h" }] } },
    { slug: "b", category: "Captura", specSection: { spec: [{ key: "Peso", value: "280g" }] } },
  ];
  const { rows } = buildComparisonRows(products);
  assert.deepEqual(rows, [
    { key: "Peso", values: new Map([["a", "320g"], ["b", "280g"]]) },
    { key: "Bateria", values: new Map([["a", "2h"], ["b", null]]) },
  ]);
});
