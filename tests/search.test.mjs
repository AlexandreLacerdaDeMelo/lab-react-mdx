import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesQuery, searchIndex } from "../lib/search.mjs";

const entries = [
  { type: "produto", slug: "camera-compacta", title: "Câmera compacta Aurora Flow", subtitle: "Captura", category: "Captura", description: "Câmera leve para captura no dia a dia." },
  { type: "pessoa", slug: "camila-ferraz", title: "Camila Ferraz", subtitle: "Engenheira de produto (ótica)", category: "engenharia", description: "Engenheira de produto (ótica)" },
];

test("busca ignora acentos e caixa", () => {
  assert.equal(matchesQuery(entries[0], "camera"), true);
  assert.equal(matchesQuery(entries[0], "CÂMERA"), true);
  assert.equal(matchesQuery(entries[0], "camara"), false);
});

test("busca vazia nunca casa nada", () => {
  assert.equal(matchesQuery(entries[0], ""), false);
  assert.equal(matchesQuery(entries[0], undefined), false);
});

test("searchIndex filtra por tipo e por texto", () => {
  const resultado = searchIndex(entries, "ca", { type: "pessoa" });
  assert.deepEqual(resultado.map((item) => item.slug), ["camila-ferraz"]);
});

test("searchIndex em lista vazia ou inválida retorna array vazio sem lançar", () => {
  assert.deepEqual(searchIndex([], "camera"), []);
  assert.deepEqual(searchIndex(undefined, "camera"), []);
});

test("searchIndex casa por categoria/descrição também", () => {
  const resultado = searchIndex(entries, "engenharia");
  assert.deepEqual(resultado.map((item) => item.slug), ["camila-ferraz"]);
});

test("searchIndex com filtro de tipo e consulta vazia lista pelo filtro (busca só com filtros)", () => {
  const resultado = searchIndex(entries, "", { type: "produto" });
  assert.deepEqual(resultado.map((item) => item.slug), ["camera-compacta"]);
});

test("searchIndex com filtro de categoria e consulta vazia lista pelo filtro", () => {
  const resultado = searchIndex(entries, "", { category: "Captura" });
  assert.deepEqual(resultado.map((item) => item.slug), ["camera-compacta"]);
});

test("searchIndex sem texto e sem filtro nenhum retorna vazio", () => {
  assert.deepEqual(searchIndex(entries, ""), []);
  assert.deepEqual(searchIndex(entries, "   "), []);
});
