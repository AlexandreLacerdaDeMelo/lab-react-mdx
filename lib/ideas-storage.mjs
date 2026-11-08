import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

function sanitizeFilename(name) {
  const base = path.basename((name || "arquivo").toString());
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return safe || "arquivo";
}

// Interface isolada para trocar depois por e-mail/armazenamento de objetos
// sem mexer na rota ou no formulário — só este módulo conhece o disco.
export function createIdeaStore(root = process.cwd()) {
  async function saveIdea({ data, files }) {
    const id = crypto.randomUUID();
    const dir = path.join(root, "storage", "ideias", id);
    await mkdir(dir, { recursive: true });

    const savedFiles = [];
    for (const file of files || []) {
      const safeName = sanitizeFilename(file.name);
      const filePath = path.join(dir, safeName);
      // Defesa extra: garante que o caminho final ainda está dentro de `dir`.
      if (path.relative(dir, filePath).startsWith("..")) continue;
      await writeFile(filePath, file.buffer);
      savedFiles.push(safeName);
    }

    const record = { id, createdAt: new Date().toISOString(), ...data, files: savedFiles };
    await writeFile(path.join(dir, "dados.json"), JSON.stringify(record, null, 2));
    return { id, files: savedFiles };
  }

  return { saveIdea };
}

export const { saveIdea } = createIdeaStore();
