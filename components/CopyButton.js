"use client";

import { useState } from "react";

export default function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard indisponível — sem feedback, sem crash.
    }
  }

  return (
    <span className="copy-button">
      <button type="button" onClick={onCopy} aria-label={`Copiar ${label}`}>
        Copiar
      </button>
      <span aria-live="polite" className="visually-hidden">{copied ? "Copiado" : ""}</span>
      {copied && <span aria-hidden="true" className="copy-confirm">Copiado</span>}
    </span>
  );
}
