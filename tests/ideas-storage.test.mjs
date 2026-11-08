import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createIdeaStore } from "../lib/ideas-storage.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "lab-mdx-ideias-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return { root, ...createIdeaStore(root) };
}

test("saveIdea grava dados.json com os campos enviados e um id novo", async (t) => {
  const { root, saveIdea } = await fixture(t);
  const { id } = await saveIdea({ data: { tipo: "Filme", titulo: "Um título", descricao: "Uma descrição", nome: "Ana", email: "ana@example.com", telefone: "" }, files: [] });
  const raw = await readFile(path.join(root, "storage", "ideias", id, "dados.json"), "utf8");
  const record = JSON.parse(raw);
  assert.equal(record.titulo, "Um título");
  assert.equal(record.id, id);
  assert.ok(record.createdAt);
});

test("saveIdea grava os arquivos anexados com nome saneado", async (t) => {
  const { root, saveIdea } = await fixture(t);
  const { id, files } = await saveIdea({
    data: { tipo: "Vídeo", titulo: "T", descricao: "D", nome: "N", email: "n@example.com", telefone: "" },
    files: [{ name: "../../etc/passaporte com espaço.png", buffer: Buffer.from("fake-image") }],
  });
  assert.equal(files.length, 1);
  assert.doesNotMatch(files[0], /\.\./);
  const dirFiles = await readdir(path.join(root, "storage", "ideias", id));
  assert.ok(dirFiles.includes(files[0]));
  const content = await readFile(path.join(root, "storage", "ideias", id, files[0]));
  assert.equal(content.toString(), "fake-image");
});

test("cada chamada gera uma pasta com id diferente", async (t) => {
  const { saveIdea } = await fixture(t);
  const a = await saveIdea({ data: { tipo: "Filme", titulo: "A", descricao: "D", nome: "N", email: "n@example.com", telefone: "" }, files: [] });
  const b = await saveIdea({ data: { tipo: "Filme", titulo: "B", descricao: "D", nome: "N", email: "n@example.com", telefone: "" }, files: [] });
  assert.notEqual(a.id, b.id);
});

test("sem arquivos, a lista salva fica vazia sem lançar", async (t) => {
  const { saveIdea } = await fixture(t);
  const { files } = await saveIdea({ data: { tipo: "Animação", titulo: "A", descricao: "D", nome: "N", email: "n@example.com", telefone: "" }, files: [] });
  assert.deepEqual(files, []);
});
