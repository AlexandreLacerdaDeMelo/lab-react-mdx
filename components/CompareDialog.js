"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompareDialog({ currentSlug, comparaveis }) {
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  const router = useRouter();
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onClose() {
      buttonRef.current?.focus();
    }
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  if (!comparaveis || comparaveis.length === 0) return null;

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function toggle(slug) {
    setSelected((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);
      if (current.length >= 2) return current;
      return [...current, slug];
    });
  }

  function compareWith(slug) {
    close();
    router.push(`/comparar?p=${currentSlug},${slug}`);
  }

  function compareSelected() {
    close();
    router.push(`/comparar?p=${[currentSlug, ...selected].join(",")}`);
  }

  return (
    <>
      <button type="button" ref={buttonRef} onClick={open} className="compare-trigger">
        Comparar
      </button>
      <dialog ref={dialogRef} className="compare-dialog" aria-labelledby="compare-dialog-title">
        <div className="idea-dialog-inner">
          <button type="button" className="idea-dialog-close" onClick={close} aria-label="Fechar">×</button>
          <h2 id="compare-dialog-title">Comparar com</h2>
          <ul className="compare-option-list">
            {comparaveis.map((produto) => (
              <li key={produto.slug} className="compare-option">
                {produto.image && <div className="frame"><img src={produto.image} alt={produto.alt || ""} /></div>}
                <span>{produto.name}</span>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.includes(produto.slug)}
                    disabled={!selected.includes(produto.slug) && selected.length >= 2}
                    onChange={() => toggle(produto.slug)}
                  />
                  Selecionar
                </label>
                <button type="button" onClick={() => compareWith(produto.slug)}>Comparar com este</button>
              </li>
            ))}
          </ul>
          {selected.length >= 1 && (
            <button type="button" onClick={compareSelected}>
              Comparar selecionados ({selected.length + 1})
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}
