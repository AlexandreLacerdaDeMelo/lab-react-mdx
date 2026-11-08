"use client";

import { useEffect, useRef, useState } from "react";
import { createCommentStore, list, add } from "@/lib/comments.mjs";
import { validateReview, averageRating, USOS } from "@/lib/reviews.mjs";

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, value),
  };
}

const USO_LABELS = {
  vlog: "Vlog",
  entrevista: "Entrevista",
  "estúdio": "Estúdio",
  eventos: "Eventos",
  outro: "Outro",
};

export default function ProductReviews({ colecao, slug }) {
  const key = `${colecao}/${slug}`;
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [uso, setUso] = useState("");
  const [errors, setErrors] = useState([]);
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
    setReviews(list(newStore, key));
  }, [key]);

  const media = averageRating(reviews);

  function onSubmit(event) {
    event.preventDefault();
    if (!store) return;

    const validationErrors = validateReview({ rating, title, uso });
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = add(store, key, { name, text: text || title, rating: Number(rating), title, uso });
    if (!result.ok) {
      setErrors([result.error]);
      return;
    }

    setErrors([]);
    setName("");
    setRating("");
    setTitle("");
    setText("");
    setUso("");
    setReviews(list(store, key));
    setJustSubmitted(true);
    clearTimeout(thankYouTimeout.current);
    thankYouTimeout.current = setTimeout(() => setJustSubmitted(false), 4000);
  }

  return (
    <section className="comments">
      <h2>Avaliações</h2>
      <p className="lead">Já usou este produto? Deixe um comentário sobre nosso produto.</p>

      {media !== null && (
        <p className="review-summary">
          <span aria-hidden="true">{"★".repeat(Math.round(media))}{"☆".repeat(5 - Math.round(media))}</span>
          <span>{media.toFixed(1)} de 5 ({reviews.length} avaliaç{reviews.length === 1 ? "ão" : "ões"})</span>
        </p>
      )}

      {reviews.length > 0 && (
        <ul className="comment-list">
          {reviews.map((review) => (
            <li className="comment-item" key={review.id}>
              <p className="eyebrow">
                <span aria-hidden="true">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                <span className="visually-hidden">{review.rating} de 5 estrelas</span>
                {" · "}{review.name} · {new Date(review.createdAt).toLocaleDateString("pt-BR")}
              </p>
              <p><strong>{review.title}</strong></p>
              {review.uso && <p className="meta">Uso: {USO_LABELS[review.uso] || review.uso}</p>}
              {review.text && review.text !== review.title && <p>{review.text}</p>}
            </li>
          ))}
        </ul>
      )}

      <form className="comment-form" onSubmit={onSubmit}>
        {justSubmitted && <p className="comment-thanks" role="status">Obrigado pelo feedback!</p>}
        {errors.length > 0 && errors.map((message) => <p role="alert" key={message}>{message}</p>)}

        <fieldset>
          <legend>Nota</legend>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value}>
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  checked={Number(rating) === value}
                  onChange={() => setRating(String(value))}
                />
                {value} estrela{value > 1 ? "s" : ""}
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Título
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} required />
        </label>

        <label>
          Comentário
          <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={500} />
        </label>

        <fieldset>
          <legend>Como você usa</legend>
          <div className="star-rating">
            {USOS.map((value) => (
              <label key={value}>
                <input type="radio" name="uso" value={value} checked={uso === value} onChange={() => setUso(value)} />
                {USO_LABELS[value]}
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Nome
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required />
        </label>

        <button type="submit">Enviar avaliação</button>
      </form>
    </section>
  );
}
