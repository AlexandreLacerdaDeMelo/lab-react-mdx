"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, isCoarsePointer } from "@/lib/mediaGuards.client.js";

export default function AutoScrollBox({ children, label }) {
  const boxRef = useRef(null);
  const frameRef = useRef(null);
  const [scrollable, setScrollable] = useState(false);
  const [manualOnly, setManualOnly] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    setScrollable(el.scrollHeight > el.clientHeight);
    setManualOnly(prefersReducedMotion() || isCoarsePointer());
  }, []);

  useEffect(() => {
    if (manualOnly) return;
    const el = boxRef.current;
    if (!el) return;

    let autoScrolling = false;

    function step() {
      if (!autoScrolling) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        autoScrolling = false;
        frameRef.current = null;
        return;
      }
      el.scrollTop += 1;
      frameRef.current = requestAnimationFrame(step);
    }

    function start() {
      if (autoScrolling) return;
      autoScrolling = true;
      frameRef.current = requestAnimationFrame(step);
    }

    function stop() {
      autoScrolling = false;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    }

    el.addEventListener("pointerenter", start);
    el.addEventListener("pointerleave", stop);
    el.addEventListener("wheel", stop, { passive: true });
    el.addEventListener("touchstart", stop, { passive: true });
    el.addEventListener("keydown", stop);

    return () => {
      stop();
      el.removeEventListener("pointerenter", start);
      el.removeEventListener("pointerleave", stop);
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchstart", stop);
      el.removeEventListener("keydown", stop);
    };
  }, [manualOnly]);

  return (
    <div className="bio-box" ref={boxRef} tabIndex={0} role="region" aria-label={label}>
      {children}
      {scrollable && <p className="scroll-hint">Role para ver mais</p>}
    </div>
  );
}
