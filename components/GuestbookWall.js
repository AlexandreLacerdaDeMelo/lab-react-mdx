"use client";

import { useEffect, useRef, useState } from "react";
import { createCommentStore, list, add } from "@/lib/comments.mjs";

const MAX_RECADO = 280;

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, value),
  };
}

export default function GuestbookWall({ colecao, slug }) {
  const key = `${colecao}/${slug}`;
  const [store, setStore] = useState(null);
  const [recados, setRecados] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const thankYouTimeout = useRef(null);

  useEffect(() => () => clearTimeout(thankYouTimeout.current), []);

  useEffect(() => {
    let storage;
    try {
      storage = window.localStorage;
      storage.getItem(key);
    } catch {
      storage = memoryStorage();
    }
    const newStore = createCommentStore(storage);
    setStore(newStore);
    setRecados(list(newStore, key));
  }, [key]);

  function onSubmit(event) {
    event.preventDefault();
    if (!store) return;

    const result = add(store, key, { name, text }, { maxTextLength: MAX_RECADO });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);
    setName("");
    setText("");
    setRecados(list(store, key));
    setJustSubmitted(true);
    clearTimeout(thankYouTimeout.current);
    thankYouTimeout.current = setTimeout(() => setJustSubmitted(false), 4000);
  }

  return (
    <section className="comments">
      <h2>Mural de recados</h2>
      <p className="lead">Adicione um recado sobre nosso parceiro.</p>

      {recados.length > 0 && (
        <ul className="guestbook-wall">
          {recados.map((recado) => (
            <li className="guestbook-note" key={recado.id}>
              <p>{recado.text}</p>
              <p className="eyebrow">{recado.name} · {new Date(recado.createdAt).toLocaleDateString("pt-BR")}</p>
            </li>
          ))}
        </ul>
      )}

      <form className="comment-form" onSubmit={onSubmit}>
        {justSubmitted && <p className="comment-thanks" role="status">Obrigado pelo feedback!</p>}
        {error && <p role="alert">{error}</p>}
        <label>
          Nome
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required />
        </label>
        <label>
          Recado
          <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={MAX_RECADO} required />
          <span className="idea-counter">{text.length}/{MAX_RECADO}</span>
        </label>
        <button type="submit">Deixar recado</button>
      </form>
    </section>
  );
}
