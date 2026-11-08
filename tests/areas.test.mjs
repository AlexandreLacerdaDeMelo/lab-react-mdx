import { test } from "node:test";
import assert from "node:assert/strict";
import { areaLabel, areaColorVar, areaOptions } from "../lib/areas.mjs";

test("areaLabel traduz os slugs conhecidos", () => {
  assert.equal(areaLabel("engenharia"), "Engenharia");
  assert.equal(areaLabel("lideranca"), "Liderança");
});

test("areaLabel cai num rótulo neutro para área desconhecida, sem lançar", () => {
  assert.equal(areaLabel("outra-coisa"), "Outras áreas");
  assert.equal(areaLabel(undefined), "Outras áreas");
});

test("areaColorVar retorna a variável CSS correta para cada área conhecida", () => {
  assert.equal(areaColorVar("comercial"), "var(--area-comercial)");
});

test("areaColorVar cai na cor neutra para área desconhecida ou ausente", () => {
  assert.equal(areaColorVar("outra-coisa"), "var(--area-neutra)");
  assert.equal(areaColorVar(undefined), "var(--area-neutra)");
});

test("areaOptions lista as cinco áreas com cor própria", () => {
  assert.deepEqual(areaOptions(), ["lideranca", "engenharia", "producao", "comercial", "qualidade"]);
});
