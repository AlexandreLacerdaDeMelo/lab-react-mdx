import { saveIdea } from "@/lib/ideas-storage.mjs";

const ALLOWED_TYPES = new Set(["Filme", "Vídeo", "Animação"]);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".webp", ".mp4"]);
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
]);
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_FILES = 3;
const MAX_DESCRIPTION = 2000;
const MAX_TITULO = 160;

// Limite simples de requisições por IP, em memória — reinicia a cada
// deploy/restart, o que é aceitável como primeira barreira contra spam.
const requestLog = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip) {
  const now = Date.now();

  // Limpeza oportunista: evita que `requestLog` cresça sem limite com IPs
  // que não voltam a fazer requisição.
  for (const [loggedIp, timestamps] of requestLog) {
    if (!timestamps.some((t) => now - t < WINDOW_MS)) requestLog.delete(loggedIp);
  }

  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > MAX_REQUESTS_PER_WINDOW;
}

function extensionOf(filename) {
  const match = /\.[a-zA-Z0-9]+$/.exec(filename || "");
  return match ? match[0].toLowerCase() : "";
}

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(ip)) {
    return Response.json({ ok: false, error: "Muitas tentativas em pouco tempo. Aguarde um momento e tente de novo." }, { status: 429 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Não foi possível ler o formulário enviado." }, { status: 400 });
  }

  // Campo isca: só bots preenchem um campo escondido via CSS.
  if (formData.get("website")) {
    return Response.json({ ok: true, id: "ignored" });
  }

  const tipo = (formData.get("tipo") || "").toString().trim();
  const titulo = (formData.get("titulo") || "").toString().trim();
  const descricao = (formData.get("descricao") || "").toString().trim();
  const nome = (formData.get("nome") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const telefone = (formData.get("telefone") || "").toString().trim();
  const consentimento = formData.get("consentimento");

  const errors = [];
  if (!ALLOWED_TYPES.has(tipo)) errors.push("Selecione o tipo da ideia.");
  if (!titulo || titulo.length > MAX_TITULO) errors.push("Título inválido ou muito longo.");
  if (!descricao || descricao.length > MAX_DESCRIPTION) errors.push("Descrição inválida ou muito longa.");
  if (!nome || nome.length > 120) errors.push("Nome inválido.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) errors.push("E-mail inválido.");
  if (telefone && telefone.length > 40) errors.push("Telefone inválido.");
  if (!consentimento) errors.push("É necessário concordar com o uso dos dados para contato.");

  const rawFiles = formData.getAll("anexos").filter((entry) => typeof entry === "object" && "size" in entry && entry.size > 0);
  if (rawFiles.length > MAX_FILES) errors.push(`Envie no máximo ${MAX_FILES} arquivos.`);

  const files = [];
  for (const file of rawFiles.slice(0, MAX_FILES)) {
    const ext = extensionOf(file.name);
    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME.has(file.type)) {
      errors.push(`O arquivo "${file.name}" tem um formato não aceito.`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`O arquivo "${file.name}" passa de 15 MB.`);
      continue;
    }
    files.push({ name: file.name, buffer: Buffer.from(await file.arrayBuffer()) });
  }

  if (errors.length > 0) {
    return Response.json({ ok: false, error: errors[0], errors }, { status: 400 });
  }

  try {
    const result = await saveIdea({ data: { tipo, titulo, descricao, nome, email, telefone }, files });
    return Response.json({ ok: true, id: result.id });
  } catch {
    return Response.json(
      { ok: false, error: "Não foi possível salvar sua ideia agora. Tente de novo ou escreva para contato@aurorastudio.com.br." },
      { status: 500 }
    );
  }
}
