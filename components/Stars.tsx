"use client";

import { useEffect, useRef } from "react";

export default function Stars() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const count = 80;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      star.className = "star";
      const size = Math.random() * 2 + 0.5;
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        --dur: ${Math.random() * 4 + 2}s;
        --delay: ${Math.random() * 5}s;
        --max-opacity: ${Math.random() * 0.5 + 0.2};
      `;
      fragment.appendChild(star);
    }

    el.appendChild(fragment);
    return () => { el.innerHTML = ""; };
  }, []);

  return <div ref={containerRef} className="stars-bg" aria-hidden="true" />;
}
