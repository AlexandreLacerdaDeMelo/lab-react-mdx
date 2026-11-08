"use client";

import { useEffect, useRef, useState } from "react";

export default function ChapterIndex({ chapters }) {
  const [activeId, setActiveId] = useState(chapters?.[0]?.id);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!chapters || chapters.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    observerRef.current = observer;

    chapters.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [chapters]);

  if (!chapters || chapters.length === 0) return null;

  return (
    <details className="chapter-index" open>
      <summary>Índice</summary>
      <nav aria-label="Capítulos da história">
        <ul>
          {chapters.map(({ id, heading }) => (
            <li key={id}>
              <a href={`#${id}`} aria-current={activeId === id ? "true" : undefined}>
                {heading}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
