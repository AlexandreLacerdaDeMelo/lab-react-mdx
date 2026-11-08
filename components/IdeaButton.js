"use client";

import { useEffect, useRef, useState } from "react";

const TIPOS = ["Filme", "Vídeo", "Animação"];
const MAX_DESCRICAO = 2000;
const MAX_ARQUIVOS = 3;
const MAX_TAMANHO = 15 * 1024 * 1024;
const EXTENSOES_ACEITAS = ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.mp4";

function IdeaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="17" r="12" fill="none" stroke="var(--violet)" strokeWidth="3" />
      <path d="M14 29 h12 M16 33 h8" stroke="var(--azure)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="17" r="4" fill="var(--accent)" />
    </svg>
  );
}

export default function IdeaButton() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [arquivos, setArquivos] = useState([]);
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { rootMargin: "0px 0px -15% 0px" });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onClose() {
      setOpen(false);
      buttonRef.current?.focus();
    }
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  function openDialog() {
    setOpen(true);
    setStatus("idle");
    setErrorMessage(null);
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function onFileChange(event) {
    const selected = Array.from(event.target.files || []);
    if (selected.length > MAX_ARQUIVOS) {
      setErrorMessage(`Selecione no máximo ${MAX_ARQUIVOS} arquivos.`);
      event.target.value = "";
      setArquivos([]);
      return;
    }
    const tooBig = selected.find((file) => file.size > MAX_TAMANHO);
    if (tooBig) {
      setErrorMessage(`O arquivo "${tooBig.name}" passa de 15 MB. Envie um link na descrição se o material for maior.`);
      event.target.value = "";
      setArquivos([]);
      return;
    }
    setErrorMessage(null);
    setArquivos(selected);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const formData = new FormData(formRef.current);

    try {
      const response = await fetch("/api/ideias", { method: "POST", body: formData });
      const result = await response.json();
      if (response.ok && result.ok) {
        setStatus("success");
        formRef.current?.reset();
        setDescricao("");
        setArquivos([]);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Não foi possível enviar. Tente de novo.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Não foi possível enviar agora. Verifique sua conexão e tente de novo.");
    }
  }

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className={`idea-fab${hidden ? " idea-fab--hidden" : ""}`}
        onClick={openDialog}
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : 0}
      >
        <IdeaIcon />
        <span>Envie uma ideia</span>
      </button>

      <dialog ref={dialogRef} className="idea-dialog" aria-labelledby="idea-dialog-title">
        <div className="idea-dialog-inner">
          <button type="button" className="idea-dialog-close" onClick={closeDialog} aria-label="Fechar">
            ×
          </button>

          {status === "success" ? (
            <div className="idea-success">
              <h2 id="idea-dialog-title">Ideia recebida</h2>
              <p>Sua ideia foi registrada. Se ela for selecionada para investimento, nossa equipe entra em contato pelo e-mail informado.</p>
              <button type="button" onClick={closeDialog}>Fechar</button>
            </div>
          ) : (
            <>
              <h2 id="idea-dialog-title">Envie sua ideia</h2>
              <p className="meta">
                A Aurora recebe ideias de filmes, vídeos e animações. Algumas são escolhidas para receber
                investimento — nesses casos, nossa equipe entra em contato e produz o projeto com você. Não
                garantimos prazo nem seleção.
              </p>

              <form ref={formRef} onSubmit={onSubmit} className="idea-form" encType="multipart/form-data">
                <label className="idea-honeypot" aria-hidden="true">
                  Site
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>

                <fieldset>
                  <legend>Tipo</legend>
                  <div className="idea-radio-group">
                    {TIPOS.map((tipo) => (
                      <label key={tipo}>
                        <input type="radio" name="tipo" value={tipo} required /> {tipo}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label>
                  Título da ideia
                  <input type="text" name="titulo" maxLength={160} required />
                </label>

                <label>
                  Descrição
                  <textarea
                    name="descricao"
                    maxLength={MAX_DESCRICAO}
                    required
                    value={descricao}
                    onChange={(event) => setDescricao(event.target.value)}
                  />
                  <span className="idea-counter">{descricao.length}/{MAX_DESCRICAO}</span>
                </label>

                <label>
                  Nome
                  <input type="text" name="nome" maxLength={120} required />
                </label>

                <label>
                  E-mail
                  <input type="email" name="email" maxLength={160} required />
                </label>

                <label>
                  Telefone (opcional)
                  <input type="tel" name="telefone" maxLength={40} />
                </label>

                <label>
                  Anexos (até 3 arquivos, 15 MB cada — PDF, DOC/DOCX, TXT, PNG, JPG, WEBP ou MP4; se o material
                  for maior, envie um link na descrição)
                  <input type="file" name="anexos" accept={EXTENSOES_ACEITAS} multiple onChange={onFileChange} />
                </label>
                {arquivos.length > 0 && (
                  <ul className="idea-file-list">
                    {arquivos.map((file) => <li key={file.name}>{file.name}</li>)}
                  </ul>
                )}

                <label className="idea-consent">
                  <input type="checkbox" name="consentimento" value="sim" required />
                  Concordo em ser contatado pela Aurora sobre esta ideia e com o uso dos dados enviados para essa finalidade.
                </label>

                {errorMessage && <p role="alert" className="idea-error">{errorMessage}</p>}

                <button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Enviando…" : "Enviar ideia"}
                </button>
              </form>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
