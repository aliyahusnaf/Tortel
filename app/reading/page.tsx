"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Stars from "@/components/Stars";
import type { Message, SelectedCard, Topic } from "@/lib/types";
import { getTopicLabel } from "@/lib/tarot";

const POSITION_LABELS = ["Akar / Masa Lalu", "Sekarang / Fokus", "Potensi / Masa Depan"];
const SUIT_SYMBOLS: Record<string, string> = {
  wands: "🔥", cups: "🌊", swords: "⚡", pentacles: "🌿",
};

function CardPreview({ sc, index }: { sc: SelectedCard; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="flex flex-col items-center gap-2"
    >
      {/* Card border stays upright; only image inside rotates */}
      <div
        className="relative rounded-lg overflow-hidden border flex flex-col"
        style={{
          width: 72,
          height: 112,
          borderColor: "var(--border)",
          background: "var(--gradient-card-front)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Image area — rotated when reversed */}
        <div
          className="relative flex-1 min-h-0"
          style={{ transform: sc.reversed ? "rotate(180deg)" : undefined }}
        >
          {sc.card.image ? (
            <Image src={sc.card.image} alt={sc.card.name} fill className="object-cover" unoptimized />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "var(--gradient-card-noimg)" }}
            >
              <span className="text-2xl">
                {sc.card.arcana === "major" ? "✦" : (SUIT_SYMBOLS[sc.card.suit ?? ""] ?? "✦")}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>
      </div>

      {/* Card label — always readable below */}
      <div className="text-center" style={{ width: 84 }}>
        <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>
          {POSITION_LABELS[index]}
        </p>
        <p className="text-[11px] font-medium leading-tight" style={{ color: "var(--text)" }}>
          {sc.card.name}
        </p>
        {sc.reversed && (
          <p className="text-[9px]" style={{ color: "var(--gold)" }}>↓ Terbalik</p>
        )}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--accent)" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return <strong key={i} style={{ color: "var(--accent-light)" }}>{p.slice(2, -2)}</strong>;
      }
      return p.split("\n").map((line, j, arr) => (
        <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
      ));
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${isUser ? "chat-user" : "chat-ai"}`}
        style={{
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        }}
      >
        {!isUser && (
          <p className="text-[9px] tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            ✦ Mystic
          </p>
        )}
        <div className="prose-tarot">{renderContent(msg.content)}</div>
      </div>
    </motion.div>
  );
}

export default function ReadingPage() {
  const router = useRouter();
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [topic, setTopic] = useState<Topic>("love");
  const [customTopic, setCustomTopic] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const rawCards = sessionStorage.getItem("selectedCards");
    const rawTopic = sessionStorage.getItem("topic") as Topic | null;
    const rawCustom = sessionStorage.getItem("customTopic") ?? undefined;

    if (!rawCards || !rawTopic) {
      router.replace("/");
      return;
    }

    const parsedCards: SelectedCard[] = JSON.parse(rawCards);
    setSelectedCards(parsedCards);
    setTopic(rawTopic);
    if (rawCustom) setCustomTopic(rawCustom);

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchInitialReading = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [],
            selectedCards: parsedCards,
            topic: rawTopic,
            customTopic: rawCustom,
            isInitial: true,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "API error");
        }

        const data = await res.json();
        if (data.content) {
          setMessages([{ role: "assistant", content: data.content }]);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setMessages([{
          role: "assistant",
          content: `Maaf, sepertinya ada gangguan koneksi ke alam astral 🌙\n\n_${msg}_\n\nCoba muat ulang halaman ini.`,
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialReading();
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || selectedCards.length === 0) return;

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          selectedCards,
          topic,
          customTopic,
          isInitial: false,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "API error");
      }

      const data = await res.json();
      if (data.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Koneksi terputus sebentar. Coba tanyakan lagi ya. _(${msg})_` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, selectedCards, topic, customTopic]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const QUICK_QUESTIONS = [
    "Kartu apa yang paling relevan buatku sekarang?",
    "Apa yang harus aku lakukan selanjutnya?",
    "Ada energi apa yang harus aku waspadai?",
  ];

  return (
    <main className="relative h-screen overflow-hidden flex flex-col">
      <Stars />

      <div className="relative z-10 flex flex-col h-full">
        {/* Top bar */}
        <div
          className="shrink-0 border-b px-4 py-3"
          style={{
            background: "var(--bg-topbar)",
            borderColor: "var(--border-subtle)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                ✦ Tortel
              </p>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {getTopicLabel(topic, customTopic)}
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-light)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Baca ulang ↺
            </button>
          </div>
        </div>

        {/* Cards spread */}
        {selectedCards.length === 3 && (
          <div
            className="shrink-0 border-b px-4 py-4"
            style={{ background: "var(--bg-spread)", borderColor: "var(--border-subtle)" }}
          >
            <div className="max-w-2xl mx-auto flex justify-center gap-6">
              {selectedCards.map((sc, i) => (
                <CardPreview key={i} sc={sc} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">

            {/* Placeholder saat loading initial */}
            {messages.length === 0 && isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="chat-ai rounded-2xl" style={{ borderRadius: "18px 18px 18px 4px" }}>
                  <p
                    className="text-[9px] tracking-widest uppercase px-4 pt-3 pb-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ✦ Mystic
                  </p>
                  <TypingDots />
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
            </AnimatePresence>

            {/* Typing indicator saat follow-up loading */}
            {isLoading && messages.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="chat-ai rounded-2xl" style={{ borderRadius: "18px 18px 18px 4px" }}>
                  <p
                    className="text-[9px] tracking-widest uppercase px-4 pt-3 pb-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ✦ Mystic
                  </p>
                  <TypingDots />
                </div>
              </motion.div>
            )}

            {/* Quick questions setelah initial reading */}
            {messages.length === 1 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-2 mt-1"
              >
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50); }}
                    className="text-xs px-3 py-2 rounded-full border transition-all cursor-pointer"
                    style={{ borderColor: "var(--border)", color: "var(--accent-light)", background: "transparent" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.background = "var(--accent-glow)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div
          className="shrink-0 border-t px-4 py-3"
          style={{
            background: "var(--bg-topbar)",
            borderColor: "var(--border-subtle)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="max-w-2xl mx-auto flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={messages.length === 0 ? "Menunggu pembacaan..." : "Tanyakan apapun tentang bacaanmu..."}
              disabled={isLoading && messages.length === 0}
              rows={1}
              className="flex-1 resize-none rounded-xl px-4 py-3 text-sm border"
              style={{
                background: "var(--bg-card)",
                borderColor: input ? "var(--accent)" : "var(--border)",
                color: "var(--text)",
                caretColor: "var(--accent-light)",
                maxHeight: 120,
                overflowY: "auto",
                transition: "border-color 0.2s",
                opacity: isLoading && messages.length === 0 ? 0.5 : 1,
              }}
            />
            <motion.button
              whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
              whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: input.trim() && !isLoading
                  ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                  : "var(--bg-disabled)",
                boxShadow: input.trim() && !isLoading
                  ? "0 0 16px rgba(124,58,237,0.4)"
                  : "none",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-none"
                stroke="currentColor"
                style={{ color: input.trim() && !isLoading ? "white" : "var(--text-disabled)" }}
              >
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </div>
          <p className="text-center text-[10px] mt-2" style={{ color: "var(--text-dim)" }}>
            Enter untuk kirim · Shift+Enter untuk baris baru
          </p>
        </div>
      </div>
    </main>
  );
}
