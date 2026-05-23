"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Stars from "@/components/Stars";
import type { Topic, SelectedCard } from "@/lib/types";

const TOPICS: { id: Topic; label: string; icon: string; desc: string }[] = [
  {
    id: "love",
    label: "Cinta & Hubungan",
    icon: "♡",
    desc: "Romansa, pasangan, perasaan, dan koneksi emosional",
  },
  {
    id: "career",
    label: "Karir & Ambisi",
    icon: "◈",
    desc: "Pekerjaan, bisnis, tujuan profesional, dan finansial",
  },
  {
    id: "friendship",
    label: "Pertemanan",
    icon: "✦",
    desc: "Hubungan sosial, lingkaran pertemanan, dan komunitas",
  },
  {
    id: "custom",
    label: "Topik Sendiri",
    icon: "◯",
    desc: "Ceritakan sendiri apa yang ingin kamu ketahui",
  },
];

export default function TopicPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [customText, setCustomText] = useState("");
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("selectedCards");
    if (!raw) {
      router.replace("/");
      return;
    }
    setSelectedCards(JSON.parse(raw));
  }, [router]);

  const canContinue =
    selectedTopic !== null &&
    (selectedTopic !== "custom" || customText.trim().length > 2);

  const handleContinue = () => {
    if (!selectedTopic) return;
    sessionStorage.setItem("topic", selectedTopic);
    if (customText.trim()) {
      sessionStorage.setItem("customTopic", customText.trim());
    }
    router.push("/reading");
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Stars />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            ✦ Langkah 2 dari 3 ✦
          </p>
          <h1 className="text-3xl md:text-4xl font-light mb-3" style={{ color: "var(--text)" }}>
            Apa yang ingin{" "}
            <span style={{ color: "var(--accent-light)" }}>kamu ketahui?</span>
          </h1>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            Kartu-kartumu akan dibaca dalam konteks topik yang kamu pilih.
          </p>
        </motion.div>

        {/* Selected cards mini preview */}
        {selectedCards.length === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 mb-8"
          >
            {selectedCards.map((sc, i) => (
              <div
                key={i}
                className="px-3 py-1.5 rounded-lg text-xs border"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                  color: "var(--accent-light)",
                }}
              >
                {sc.card.name}
                {sc.reversed && (
                  <span style={{ color: "var(--gold)" }}> ↓</span>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Topic buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mb-6">
          {TOPICS.map(({ id, label, icon, desc }, i) => {
            const active = selectedTopic === id;
            return (
              <motion.button
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTopic(id)}
                className="text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer"
                style={{
                  background: active ? "var(--gradient-topic-active)" : "var(--bg-card)",
                  borderColor: active ? "var(--accent)" : "var(--border)",
                  boxShadow: active ? "0 0 20px var(--accent-glow)" : "none",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="text-xl mt-0.5"
                    style={{ color: active ? "var(--accent-light)" : "var(--text-muted)" }}
                  >
                    {icon}
                  </span>
                  <div>
                    <p
                      className="font-medium text-sm mb-1"
                      style={{ color: active ? "var(--text)" : "var(--text-secondary)" }}
                    >
                      {label}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {desc}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Custom input */}
        {selectedTopic === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="w-full max-w-lg mb-6"
          >
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Ceritakan situasimu atau pertanyaan yang ingin dijawab..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none border"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                color: "var(--text)",
                caretColor: "var(--accent-light)",
              }}
            />
            <p
              className="text-xs mt-1 text-right"
              style={{ color: customText.length > 2 ? "var(--text-muted)" : "var(--gold)" }}
            >
              {customText.length} karakter
            </p>
          </motion.div>
        )}

        {/* Continue */}
        <motion.button
          whileHover={canContinue ? { scale: 1.03 } : {}}
          whileTap={canContinue ? { scale: 0.97 } : {}}
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full max-w-lg py-3.5 rounded-xl font-medium text-sm tracking-wide transition-all duration-300"
          style={{
            background: canContinue
              ? "linear-gradient(135deg, #7c3aed, #a855f7)"
              : "var(--bg-disabled)",
            color: canContinue ? "white" : "var(--text-disabled)",
            boxShadow: canContinue ? "0 0 20px rgba(124,58,237,0.4)" : "none",
            cursor: canContinue ? "pointer" : "not-allowed",
          }}
        >
          {canContinue ? "Mulai Pembacaan →" : "Pilih topik dulu"}
        </motion.button>

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mt-4 text-xs transition-colors cursor-pointer"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-light)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          ← Kembali pilih kartu
        </button>
      </div>
    </main>
  );
}
