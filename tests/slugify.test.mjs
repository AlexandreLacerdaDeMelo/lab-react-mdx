import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, stripAccents } from "../lib/slugify.mjs";

test("stripAccents remove diacríticos sem alterar caixa", () => {
  assert.equal(stripAccents("Monitores e Acessórios"), "Monitores e Acessorios");
  assert.equal(stripAccents(""), "");
  assert.equal(stripAccents(null), "");
});

test("remove acentos e deixa minúsculo", () => {
  assert.equal(slugify("Monitores e acessórios"), "monitores-e-acessorios");
});

test("troca espaços e pontuação por hífen, sem hífen duplicado nas pontas", () => {
  assert.equal(slugify("  Áudio  "), "audio");
  assert.equal(slugify("Suporte & Movimento!"), "suporte-movimento");
});

test("entrada vazia ou nula retorna string vazia", () => {
  assert.equal(slugify(""), "");
  assert.equal(slugify(null), "");
  assert.equal(slugify(undefined), "");
});
