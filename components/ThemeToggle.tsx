"use client";

import { useState, useEffect } from "react";

/** Self-contained dark/light toggle — reads & writes localStorage directly */
export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  // Sync with localStorage / inline FOUC script on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored !== "light";
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setDark(!dark);
  };

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      title={dark ? "Light mode" : "Dark mode"}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        /* Sun — switch to light */
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        /* Moon — switch to dark */
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
