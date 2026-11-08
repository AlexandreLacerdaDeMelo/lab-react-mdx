import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize } from "../lib/summary.mjs";

test("texto curto é retornado sem alteração", () => {
  assert.equal(summarize("Uma frase curta."), "Uma frase curta.");
});

test("corta no fim de uma frase quando há ponto final dentro do limite", () => {
  const texto = "Primeira frase bem direta. Segunda frase que ultrapassa bastante o limite de caracteres definido para o resumo.";
  assert.equal(summarize(texto, { maxChars: 40 }), "Primeira frase bem direta.");
});

test("sem ponto final no limite, corta na última palavra inteira e marca com elipse", () => {
  const texto = "Uma frase longa sem pontuação visível dentro da janela de corte definida para este teste específico";
  const resultado = summarize(texto, { maxChars: 40 });
  assert.ok(resultado.endsWith("…"));
  assert.ok(resultado.length <= 41);
  assert.ok(!resultado.includes("  "));
});

test("ignora título inicial e pega o primeiro parágrafo", () => {
  const texto = "## Título\n\nPrimeiro parágrafo real.\n\nSegundo parágrafo ignorado.";
  assert.equal(summarize(texto), "Primeiro parágrafo real.");
});

test("remove marcador de citação do início da linha", () => {
  assert.equal(summarize("> Uma citação curta."), "Uma citação curta.");
});

test("entrada vazia ou nula retorna string vazia", () => {
  assert.equal(summarize(""), "");
  assert.equal(summarize(null), "");
  assert.equal(summarize(undefined), "");
});
