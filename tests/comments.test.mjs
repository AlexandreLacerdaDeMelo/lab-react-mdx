import { test } from "node:test";
import assert from "node:assert/strict";
import { createCommentStore, list, add, remove } from "../lib/comments.mjs";

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key),
  };
}

test("lista vazia quando nada foi salvo ainda", () => {
  const store = createCommentStore(fakeStorage());
  assert.deepEqual(list(store, "produtos/camera-compacta"), []);
});

test("add valida campos vazios", () => {
  const store = createCommentStore(fakeStorage());
  const result = add(store, "produtos/camera-compacta", { name: "", text: "" });
  assert.equal(result.ok, false);
  assert.deepEqual(list(store, "produtos/camera-compacta"), []);
});

test("add valida tamanho máximo do comentário", () => {
  const store = createCommentStore(fakeStorage());
  const result = add(store, "produtos/camera-compacta", { name: "Ana", text: "x".repeat(501) });
  assert.equal(result.ok, false);
});

test("add grava e list recupera na mesma chave", () => {
  const store = createCommentStore(fakeStorage());
  add(store, "produtos/camera-compacta", { name: "Ana", text: "Ótima câmera." });
  const comments = list(store, "produtos/camera-compacta");
  assert.equal(comments.length, 1);
  assert.equal(comments[0].name, "Ana");
  assert.equal(comments[0].text, "Ótima câmera.");
});

test("chaves diferentes ficam isoladas", () => {
  const store = createCommentStore(fakeStorage());
  add(store, "produtos/camera-compacta", { name: "Ana", text: "Comentário A." });
  add(store, "equipe/marina-costa", { name: "Bruno", text: "Comentário B." });
  assert.equal(list(store, "produtos/camera-compacta").length, 1);
  assert.equal(list(store, "equipe/marina-costa").length, 1);
});

test("remove tira só o comentário indicado", () => {
  const store = createCommentStore(fakeStorage());
  add(store, "produtos/camera-compacta", { name: "Ana", text: "Primeiro." });
  add(store, "produtos/camera-compacta", { name: "Ana", text: "Segundo." });
  const [first] = list(store, "produtos/camera-compacta");
  remove(store, "produtos/camera-compacta", first.id);
  const restantes = list(store, "produtos/camera-compacta");
  assert.equal(restantes.length, 1);
  assert.equal(restantes[0].text, "Segundo.");
});

test("add aceita campos extras (ex.: nota/título/uso de uma avaliação) e os grava junto", () => {
  const store = createCommentStore(fakeStorage());
  const result = add(store, "produtos/camera-compacta", { name: "Ana", text: "Muito boa", rating: 5, title: "Recomendo", uso: "vlog" });
  assert.equal(result.ok, true);
  assert.equal(result.comment.rating, 5);
  assert.equal(result.comment.title, "Recomendo");
  assert.equal(result.comment.uso, "vlog");
});

test("add respeita um limite de tamanho de texto configurável (ex.: recado de mural com 280)", () => {
  const store = createCommentStore(fakeStorage());
  const curto = add(store, "equipe/marina-costa", { name: "Ana", text: "x".repeat(280) }, { maxTextLength: 280 });
  assert.equal(curto.ok, true);
  const longo = add(store, "equipe/marina-costa", { name: "Ana", text: "x".repeat(281) }, { maxTextLength: 280 });
  assert.equal(longo.ok, false);
});

test("storage que lança erro não derruba list (fallback array vazio)", () => {
  const brokenStorage = {
    getItem: () => { throw new Error("indisponível"); },
    setItem: () => { throw new Error("indisponível"); },
  };
  const store = createCommentStore(brokenStorage);
  assert.deepEqual(list(store, "produtos/camera-compacta"), []);
  const result = add(store, "produtos/camera-compacta", { name: "Ana", text: "Oi" });
  assert.equal(result.ok, true);
});
