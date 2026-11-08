import { test } from "node:test";
import assert from "node:assert/strict";
import { validateReview, averageRating } from "../lib/reviews.mjs";

test("validateReview exige nota entre 1 e 5", () => {
  assert.deepEqual(validateReview({ rating: 0, title: "Ótimo" }), ["Selecione uma nota de 1 a 5 estrelas."]);
  assert.deepEqual(validateReview({ rating: 6, title: "Ótimo" }), ["Selecione uma nota de 1 a 5 estrelas."]);
  assert.deepEqual(validateReview({ rating: "abc", title: "Ótimo" }), ["Selecione uma nota de 1 a 5 estrelas."]);
  assert.deepEqual(validateReview({ rating: 4, title: "Ótimo" }), []);
});

test("validateReview exige título", () => {
  assert.deepEqual(validateReview({ rating: 5, title: "" }), ["Informe um título curto."]);
  assert.deepEqual(validateReview({ rating: 5, title: "   " }), ["Informe um título curto."]);
});

test("validateReview valida o uso quando informado, mas aceita ausência", () => {
  assert.deepEqual(validateReview({ rating: 5, title: "Ótimo", uso: "vlog" }), []);
  assert.deepEqual(validateReview({ rating: 5, title: "Ótimo" }), []);
  assert.deepEqual(validateReview({ rating: 5, title: "Ótimo", uso: "qualquer-coisa" }), ["Selecione um uso válido."]);
});

test("averageRating retorna null sem nenhuma avaliação", () => {
  assert.equal(averageRating([]), null);
  assert.equal(averageRating(undefined), null);
});

test("averageRating calcula a média das notas", () => {
  assert.equal(averageRating([{ rating: 5 }, { rating: 3 }, { rating: 4 }]), 4);
});
