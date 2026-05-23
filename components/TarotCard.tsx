"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { TarotCard } from "@/lib/types";

interface Props {
  card: TarotCard;
  isSelected: boolean;
  isRevealed: boolean;
  isReversed?: boolean;
  selectionOrder?: number; // 1, 2, or 3
  onClick: () => void;
  disabled?: boolean;
}

/** The mystical card back pattern (SVG) */
function CardBack() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl"
      style={{ background: "var(--gradient-card-back)" }}
    >
      {/* Inner border */}
      <div
        className="absolute inset-[3px] rounded-[10px] border"
        style={{ borderColor: "var(--card-inner-border)" }}
      />
      {/* Ornament center */}
      <svg viewBox="0 0 80 120" className="w-16 h-24 opacity-40" fill="none">
        <circle cx="40" cy="60" r="22" className="card-svg-primary" fill="none" strokeWidth="0.8" />
        <circle cx="40" cy="60" r="16" className="card-svg-primary" fill="none" strokeWidth="0.5" />
        <line x1="40" y1="8" x2="40" y2="112" className="card-svg-primary" fill="none" strokeWidth="0.5" />
        <line x1="8" y1="60" x2="72" y2="60" className="card-svg-primary" fill="none" strokeWidth="0.5" />
        <polygon points="40,38 47,55 40,50 33,55" className="card-svg-accent" fill="none" strokeWidth="0.6" />
        <circle cx="40" cy="60" r="3" className="card-svg-primary" opacity="0.6" stroke="none" />
        <circle cx="40" cy="8" r="2" className="card-svg-accent" opacity="0.5" stroke="none" />
        <circle cx="40" cy="112" r="2" className="card-svg-accent" opacity="0.5" stroke="none" />
        <circle cx="8" cy="60" r="2" className="card-svg-accent" opacity="0.5" stroke="none" />
        <circle cx="72" cy="60" r="2" className="card-svg-accent" opacity="0.5" stroke="none" />
      </svg>
      {/* Corner ornaments */}
      {["top-2 left-2", "top-2 right-2 rotate-90", "bottom-2 right-2 rotate-180", "bottom-2 left-2 -rotate-90"].map(
        (pos, i) => (
          <svg key={i} viewBox="0 0 16 16" className={`absolute ${pos} w-4 h-4 opacity-25`} fill="none">
            <path d="M1 1 L8 1 L1 8" className="card-svg-primary" strokeWidth="1" fill="none" />
          </svg>
        )
      )}
    </div>
  );
}

/** Shown after the card is revealed */
function CardFront({ card, reversed }: { card: TarotCard; reversed?: boolean }) {
  return (
    <div
      className="absolute inset-0 rounded-xl overflow-hidden flex flex-col"
      style={{ background: "var(--gradient-card-front)" }}
    >
      <div
        className="absolute inset-[2px] rounded-[10px] border"
        style={{ borderColor: "var(--card-inner-border)" }}
      />

      {/* Card image — only this rotates when reversed */}
      <div
        className="relative flex-1 min-h-0"
        style={{ transform: reversed ? "rotate(180deg)" : undefined }}
      >
        {card.image ? (
          <Image
            src={card.image}
            alt={card.name}
            fill
            className="object-cover"
            sizes="200px"
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "var(--gradient-card-noimg)" }}
          >
            <span className="text-4xl">{getSuitSymbol(card)}</span>
          </div>
        )}
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Card name — always upright and readable */}
      <div className="relative px-2 py-2 text-center shrink-0">
        <p
          className="text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: "var(--accent-light)" }}
        >
          {card.name}
        </p>
        {reversed && (
          <span className="text-[8px] tracking-widest" style={{ color: "var(--gold)" }}>
            ↓ REVERSED
          </span>
        )}
      </div>
    </div>
  );
}

function getSuitSymbol(card: TarotCard): string {
  if (card.arcana === "major") return "✦";
  const symbols: Record<string, string> = {
    wands: "🔥", cups: "🌊", swords: "⚡", pentacles: "🌿",
  };
  return card.suit ? (symbols[card.suit] ?? "✦") : "✦";
}

export default function TarotCardComponent({
  card,
  isSelected,
  isRevealed,
  isReversed,
  selectionOrder,
  onClick,
  disabled,
}: Props) {
  return (
    <motion.div
      className="card-scene relative cursor-pointer select-none"
      style={{ width: "100%", paddingBottom: "160%", position: "relative" }}
      whileHover={!disabled && !isSelected ? { scale: 1.05, y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={!disabled ? onClick : undefined}
    >
      {/* Selection badge */}
      {isSelected && selectionOrder && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            border: "1.5px solid #c4b5fd",
            color: "white",
            boxShadow: "0 0 12px rgba(124,58,237,0.6)",
          }}
        >
          {selectionOrder}
        </motion.div>
      )}

      {/* Card container */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: "12px",
          boxShadow: isSelected
            ? "0 0 0 2px #7c3aed, 0 0 24px rgba(124,58,237,0.4)"
            : "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <div className={`card-flip${isRevealed ? " flipped" : ""}`}>
          <div className="card-face card-back-face">
            <CardBack />
          </div>
          <div className="card-face card-front-face">
            <CardFront card={card} reversed={isReversed} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
