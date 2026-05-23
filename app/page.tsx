"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Stars from "@/components/Stars";
import TarotCardComponent from "@/components/TarotCard";
import { getShuffledDeck } from "@/lib/tarot";
import type { TarotCard } from "@/lib/types";

interface SelectedCardEntry {
  card: TarotCard;
  reversed: boolean;
  deckIndex: number;
}

export default function CardSelectionPage() {
  const router = useRouter();
  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selections, setSelections] = useState<SelectedCardEntry[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    setDeck(getShuffledDeck(22));
    setMounted(true);
  }, []);

  const maxSelected = 3;

  const handleCardClick = useCallback(
    (card: TarotCard, deckIndex: number) => {
      const alreadySelected = selections.find((s) => s.deckIndex === deckIndex);
      if (alreadySelected) return;
      if (selections.length >= maxSelected) return;

      const reversed = Math.random() < 0.35;
      setRevealedIndices((prev) => new Set([...prev, deckIndex]));
      setSelections((prev) => [...prev, { card, reversed, deckIndex }]);
    },
    [selections]
  );

  const getSelectionOrder = (deckIndex: number): number | undefined => {
    const i = selections.findIndex((s) => s.deckIndex === deckIndex);
    return i >= 0 ? i + 1 : undefined;
  };

  const handleContinue = () => {
    const payload = selections.map(({ card, reversed }, i) => ({
      card,
      reversed,
      position: (i + 1) as 1 | 2 | 3,
    }));
    sessionStorage.setItem("selectedCards", JSON.stringify(payload));
    router.push("/topic");
  };

  if (!mounted) {
    return (
      <main className="relative min-h-screen overflow-x-hidden">
        <Stars />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-4">
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
          >
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              ✦ Tortel ✦
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Mengocok kartu...</p>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Stars />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            ✦ Tortel ✦
          </p>
          <h1 className="text-3xl md:text-4xl font-light mb-3" style={{ color: "var(--text)", letterSpacing: "-0.01em" }}>
            Pilih{" "}
            <span style={{ color: "var(--accent-light)" }}>3 Kartu</span>
          </h1>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            Biarkan intuisimu memandu. Kartu yang memanggilmu — itulah yang perlu kamu dengar.
          </p>
        </motion.div>

        {/* Progress indicators */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border"
                animate={{
                  borderColor: selections.length >= n ? "#7c3aed" : "var(--border)",
                  background:
                    selections.length >= n
                      ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                      : "transparent",
                  color: selections.length >= n ? "#fff" : "var(--text-muted)",
                  boxShadow:
                    selections.length >= n
                      ? "0 0 12px rgba(124,58,237,0.5)"
                      : "none",
                }}
                transition={{ duration: 0.3 }}
              >
                {selections.length >= n ? "✓" : n}
              </motion.div>
              {n < 3 && (
                <div
                  className="w-6 h-px transition-colors duration-500"
                  style={{ background: selections.length > n ? "#7c3aed" : "var(--border)" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3 w-full max-w-3xl">
          {deck.map((card, i) => {
            const order = getSelectionOrder(i);
            const selected = order !== undefined;
            const revealed = revealedIndices.has(i);
            const selectedEntry = selections.find((s) => s.deckIndex === i);

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.4 }}
              >
                <TarotCardComponent
                  card={card}
                  isSelected={selected}
                  isRevealed={revealed}
                  isReversed={selectedEntry?.reversed}
                  selectionOrder={order}
                  onClick={() => handleCardClick(card, i)}
                  disabled={selections.length >= maxSelected && !selected}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Selection summary & continue */}
        <AnimatePresence>
          {selections.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="mt-10 w-full max-w-md"
            >
              <div
                className="rounded-2xl border p-4"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
              >
                <p className="text-xs tracking-widest uppercase mb-3 text-center" style={{ color: "var(--text-muted)" }}>
                  Kartu yang dipilih
                </p>
                <div className="flex gap-3 justify-center">
                  {selections.map(({ card, reversed }, i) => (
                    <div key={i} className="text-center flex-1 min-w-0">
                      <div className="text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>
                        #{i + 1}
                      </div>
                      <div className="text-xs font-medium truncate" style={{ color: "var(--text)" }}>
                        {card.name}
                      </div>
                      {reversed && (
                        <div className="text-[9px]" style={{ color: "var(--gold)" }}>
                          ↓ Terbalik
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selections.length === 3 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleContinue}
                  className="w-full mt-4 py-3.5 rounded-xl font-medium text-sm tracking-wide cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                    color: "white",
                    boxShadow: "0 0 20px rgba(124,58,237,0.4)",
                  }}
                >
                  Lanjut ke Pilih Topik →
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
