"use client";

import { useState } from "react";
import { areaLabel, areaOptions, areaColorVar } from "@/lib/areas.mjs";

export default function TeamFilter({ pessoas }) {
  const [active, setActive] = useState(null);
  const areas = areaOptions();

  function apply(area) {
    setActive(area);
    (pessoas || []).forEach(({ slug, area: personArea }) => {
      const el = document.querySelector(`[data-slug="${slug}"]`);
      if (!el) return;
      el.style.display = !area || personArea === area ? "" : "none";
    });
  }

  return (
    <div className="legend" role="group" aria-label="Filtrar equipe por área">
      <button type="button" className="filter-chip" aria-pressed={active === null} onClick={() => apply(null)}>
        Todas
      </button>
      {areas.map((area) => (
        <button
          key={area}
          type="button"
          className="filter-chip legend-item"
          aria-pressed={active === area}
          style={{ "--current-area-color": areaColorVar(area) }}
          onClick={() => apply(active === area ? null : area)}
        >
          {areaLabel(area)}
        </button>
      ))}
    </div>
  );
}
