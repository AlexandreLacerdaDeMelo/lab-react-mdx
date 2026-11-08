"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, isCoarsePointer, isNarrowViewport } from "@/lib/mediaGuards.client.js";

const AMPLITUDE = 50; // px — deslocamento máximo aproximado do fundo
const SMOOTHING = 0.08; // fator de interpolação por quadro (menor = mais suave)

export default function ParallaxBackground({ children }) {
  const wrapperRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || isCoarsePointer() || isNarrowViewport()) return;

    const el = wrapperRef.current;
    if (!el) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function loop() {
      currentX += (targetX - currentX) * SMOOTHING;
      currentY += (targetY - currentY) * SMOOTHING;
      el.style.setProperty("--px", `${currentX.toFixed(2)}px`);
      el.style.setProperty("--py", `${currentY.toFixed(2)}px`);
      el.style.setProperty("--hx", `${(-currentX * 0.6).toFixed(2)}px`);
      el.style.setProperty("--hy", `${(-currentY * 0.6).toFixed(2)}px`);

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        frameRef.current = requestAnimationFrame(loop);
      } else {
        frameRef.current = null;
      }
    }

    function ensureLoop() {
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(loop);
    }

    function onPointerMove(event) {
      const ratioX = event.clientX / window.innerWidth - 0.5;
      const ratioY = event.clientY / window.innerHeight - 0.5;
      targetX = ratioX * AMPLITUDE * 2;
      targetY = ratioY * AMPLITUDE * 2;
      ensureLoop();
    }

    window.addEventListener("pointermove", onPointerMove);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="home-bg">
      {children}
      <div className="home-halo" aria-hidden="true" />
    </div>
  );
}
