const MAX_LENGTH = 500;

export function createCommentStore(storage) {
  return { storage };
}

function readAll(store, key) {
  try {
    const raw = store.storage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(store, key, comments) {
  try {
    store.storage.setItem(key, JSON.stringify(comments));
  } catch {
    // Armazenamento indisponível (modo privado, bloqueio) — segue sem persistir.
  }
}

export function list(store, key) {
  return readAll(store, key);
}

// `extra` carrega campos específicos de cada UI (nota/título/uso numa
// avaliação de produto, por exemplo) — o módulo de armazenamento em si não
// conhece esses campos, só grava e devolve o que recebeu.
export function add(store, key, { name, text, ...extra } = {}, { maxTextLength = MAX_LENGTH, maxNameLength = 80 } = {}) {
  const trimmedName = (name || "").trim();
  const trimmedText = (text || "").trim();

  if (!trimmedName || !trimmedText) {
    return { ok: false, error: "Preencha nome e comentário." };
  }
  if (trimmedName.length > maxNameLength) {
    return { ok: false, error: `Nome muito longo (máximo ${maxNameLength} caracteres).` };
  }
  if (trimmedText.length > maxTextLength) {
    return { ok: false, error: `Comentário muito longo (máximo ${maxTextLength} caracteres).` };
  }

  const comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: trimmedName,
    text: trimmedText,
    createdAt: new Date().toISOString(),
    ...extra,
  };

  const comments = [...readAll(store, key), comment];
  writeAll(store, key, comments);
  return { ok: true, comment };
}

export function remove(store, key, id) {
  const comments = readAll(store, key).filter((comment) => comment.id !== id);
  writeAll(store, key, comments);
}
