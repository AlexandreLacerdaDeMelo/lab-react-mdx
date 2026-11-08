"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchIndex } from "@/lib/search.mjs";

const TYPE_LABELS = { produto: "Produtos", pessoa: "Equipe" };

function isTypingTarget(element) {
  if (!element) return false;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || element.isContentEditable;
}

export default function SearchBox({ index, categories }) {
  const router = useRouter();
  const listboxId = useId();
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const hasFilter = Boolean(typeFilter || categoryFilter);
  const results = useMemo(() => {
    const options = {};
    if (typeFilter) options.type = typeFilter;
    if (categoryFilter) options.category = categoryFilter;
    return searchIndex(index, query, options).slice(0, 8);
  }, [index, query, typeFilter, categoryFilter]);

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.key === "/" || (event.key === "k" && (event.metaKey || event.ctrlKey))) && !isTypingTarget(document.activeElement)) {
        event.preventDefault();
        inputRef.current?.focus();
      } else if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event) {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, typeFilter, categoryFilter]);

  function goToResult(item) {
    setOpen(false);
    router.push(`/${item.type === "produto" ? "produtos" : "equipe"}/${item.slug}`);
  }

  function onInputKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, -1));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) {
        event.preventDefault();
        goToResult(results[activeIndex]);
      }
    }
  }

  return (
    <div className="search-box" ref={boxRef}>
      <form action="/busca" method="get" role="search" className="search-form">
        <input
          ref={inputRef}
          name="q"
          type="search"
          placeholder="Buscar produtos ou equipe…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          autoComplete="off"
        />
        <input type="hidden" name="tipo" value={typeFilter || ""} />
        <input type="hidden" name="categoria" value={categoryFilter || ""} />
        <button
          type="button"
          className="filter-trigger"
          aria-expanded={open}
          onClick={() => {
            setOpen((value) => !value);
            inputRef.current?.focus();
          }}
        >
          Filtros
        </button>

        {open ? (
          <div className="search-panel">
            <div className="search-filters" role="group" aria-label="Filtrar resultados">
              <button
                type="button"
                className="filter-chip"
                aria-pressed={typeFilter === null}
                onClick={() => { setTypeFilter(null); setCategoryFilter(null); }}
              >
                Todas
              </button>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className="filter-chip"
                  aria-pressed={typeFilter === value}
                  onClick={() => setTypeFilter((current) => (current === value ? null : value))}
                >
                  {label}
                </button>
              ))}
              {typeFilter === "produto" && categories.length > 0 ? (
                <div className="search-filters" role="group" aria-label="Filtrar por categoria">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className="filter-chip"
                      aria-pressed={categoryFilter === category}
                      onClick={() => setCategoryFilter((current) => (current === category ? null : category))}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {query.trim() || hasFilter ? (
              <ul className="search-listbox" role="listbox" id={listboxId}>
                {results.length === 0 ? (
                  <li className="search-empty">Nenhum resultado ainda.</li>
                ) : (
                  results.map((item, resultIndex) => (
                    <li
                      key={`${item.type}-${item.slug}`}
                      role="option"
                      aria-selected={resultIndex === activeIndex}
                      className="search-option"
                    >
                      <button type="button" onMouseDown={(event) => { event.preventDefault(); goToResult(item); }}>
                        <span>{item.title}</span>
                        <span className="meta">{item.subtitle}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}
