import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCategoryIndex, productsForCategory } from "../lib/categories.mjs";

const produtos = [
  { slug: "camera-compacta", frontmatter: { category: "Câmeras" } },
  { slug: "camera-aurora-pulse", frontmatter: { category: "Câmeras" } },
  { slug: "microfone-shotgun", frontmatter: { category: "Áudio" } },
];

const categorias = [
  { slug: "cameras", frontmatter: { name: "Câmeras", description: "Descrição", image: "/img.svg", alt: "alt" } },
];

test("categoria com documento próprio usa os dados cadastrados e soma a contagem certa", () => {
  const index = buildCategoryIndex(produtos, categorias);
  const cameras = index.find((c) => c.slug === "cameras");
  assert.equal(cameras.name, "Câmeras");
  assert.equal(cameras.description, "Descrição");
  assert.equal(cameras.count, 2);
});

test("categoria sem documento próprio aparece derivada do nome do produto, sem erro", () => {
  const index = buildCategoryIndex(produtos, categorias);
  const audio = index.find((c) => c.slug === "audio");
  assert.ok(audio);
  assert.equal(audio.name, "Áudio");
  assert.equal(audio.description, null);
  assert.equal(audio.count, 1);
});

test("listas vazias ou ausentes não lançam", () => {
  assert.deepEqual(buildCategoryIndex([], []), []);
  assert.deepEqual(buildCategoryIndex(undefined, undefined), []);
});

test("productsForCategory filtra por slug normalizado", () => {
  const resultado = productsForCategory(produtos, "cameras");
  assert.deepEqual(resultado.map((p) => p.slug), ["camera-compacta", "camera-aurora-pulse"]);
});
