"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/mediaGuards.client.js";

export default function TeamCarousel({ pessoas }) {
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil((pessoas?.length || 0) / 3));

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function onScroll() {
      const pageWidth = track.clientWidth;
      const current = pageWidth ? Math.round(track.scrollLeft / pageWidth) : 0;
      setPage(current);
    }

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  if (!pessoas || pessoas.length === 0) {
    return <p>Nenhuma pessoa em destaque no momento.</p>;
  }

  function goTo(targetPage) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: targetPage * track.clientWidth, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  return (
    <div className="carousel" role="region" aria-roledescription="carousel" aria-label="Equipe em destaque">
      <p className="visually-hidden" aria-live="polite">Página {page + 1} de {pageCount}</p>
      <div className="carousel-track" ref={trackRef}>
        {pessoas.map((pessoa) => (
          <div className="carousel-item" key={pessoa.slug}>
            <div className="frame portrait">
              {pessoa.image && <img src={pessoa.image} alt={pessoa.alt || ""} />}
            </div>
            <h3><Link href={`/equipe/${pessoa.slug}`}>{pessoa.name}</Link></h3>
            <p className="eyebrow">{pessoa.position}</p>
            {pessoa.summary && <p>{pessoa.summary}</p>}
          </div>
        ))}
      </div>
      <div className="carousel-controls">
        <button
          type="button"
          onClick={() => goTo(Math.max(0, page - 1))}
          disabled={page === 0}
          aria-label="Página anterior"
        >
          ‹
        </button>
        <div className="carousel-dots">
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              type="button"
              className="carousel-dot"
              aria-label={`Página ${index + 1}`}
              aria-current={index === page}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(Math.min(pageCount - 1, page + 1))}
          disabled={page === pageCount - 1}
          aria-label="Próxima página"
        >
          ›
        </button>
      </div>
    </div>
  );
}
