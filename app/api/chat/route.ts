import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import type { Message, SelectedCard, Topic } from "@/lib/types";
import { buildReadingContext, getTopicLabel } from "@/lib/tarot";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Urutan fallback model — kalau quota satu habis, coba berikutnya
const MODELS = [
  "gemini-2.5-flash",     // ← paling capable, verified working
  "gemini-2.0-flash",     // fallback
  "gemini-2.0-flash-lite",// fallback ringan
];

function buildSystemPrompt(
  selectedCards: SelectedCard[],
  topic: Topic,
  customTopic?: string
): string {
  const readingContext = buildReadingContext(selectedCards, topic, customTopic);
  const topicLabel = getTopicLabel(topic, customTopic);

  // Format per kartu disesuaikan topik
  const cardFormat =
    topic === "love"
      ? `**[Nomor]. [Label Posisi]: [Nama Kartu]** [↓ Terbalik jika reversed]
[1-2 kalimat simbolisme kartunya secara umum dalam konteks asmara]
- **Jika kamu jomblo:** [interpretasi spesifik — perasaan, orang baru, potensi hubungan]
- **Jika kamu berpasangan:** [interpretasi spesifik — dinamika hubungan, perasaan pasangan, tantangan]`
      : topic === "career"
      ? `**[Nomor]. [Label Posisi]: [Nama Kartu]** [↓ Terbalik jika reversed]
[1-2 kalimat simbolisme kartunya secara umum dalam konteks karir]
[Paragraf: apa arti untuk situasi pekerjaanmu, ambisi, peluang, atau tantangan karir yang sedang/akan dihadapi]
[Paragraf: saran konkret yang bisa kamu lakukan di tempat kerja atau dalam pengembangan karir]`
      : topic === "friendship"
      ? `**[Nomor]. [Label Posisi]: [Nama Kartu]** [↓ Terbalik jika reversed]
[1-2 kalimat simbolisme kartunya secara umum dalam konteks pertemanan]
[Paragraf: apa arti untuk dinamika pertemananmu — teman lama, teman baru, lingkaran sosial, atau konflik]
[Paragraf: bagaimana ini mencerminkan peranmu dalam pertemanan dan apa yang perlu diperhatikan]`
      : `**[Nomor]. [Label Posisi]: [Nama Kartu]** [↓ Terbalik jika reversed]
[1-2 kalimat simbolisme kartunya secara umum]
[Paragraf interpretasi mendalam untuk konteks: "${customTopic ?? topicLabel}"]
[Paragraf: wawasan dan saran yang actionable]`;

  return `Kamu adalah Mystic — pembaca tarot yang bijaksana, hangat, dan penuh empati.
Kamu berbicara dalam Bahasa Indonesia yang mengalir natural, mudah dipahami, dan terasa personal.

**Data Kartu yang Ditarik:**
${readingContext}

**STRUKTUR PEMBACAAN AWAL (WAJIB DIIKUTI PERSIS):**

Saat diminta membacakan tarot untuk pertama kali, berikan jawaban PANJANG dan DETAIL dengan format berikut:

[Paragraf pembuka 2-3 kalimat: sambut pengguna dengan hangat, sebutkan topik mereka (${topicLabel}), beri gambaran umum tentang kombinasi ketiga kartu ini]

**Pembacaan Kartu:**

${cardFormat}

[Ulangi format yang sama untuk kartu ke-2]

[Ulangi format yang sama untuk kartu ke-3]

---

**Kesimpulan & Saran:**
[2-3 paragraf yang merangkum ketiga kartu sebagai satu narasi utuh. Apa pesan besarnya? Apa action yang disarankan? Apa yang perlu diwaspadai? Tutup dengan kalimat hangat yang mengundang pertanyaan lanjut.]

---

**ATURAN PENTING:**
- Topik fokus WAJIB: **${topicLabel}** — setiap interpretasi harus relevan dengan topik ini
- Kartu reversed (↓ Terbalik) = energi tertahan, terhambat, atau aspek shadow — jelaskan nuansanya
- Gunakan "kamu" bukan "Anda"
- Pembacaan awal HARUS panjang dan mendetail seperti contoh di atas — jangan ringkas
- Untuk QnA selanjutnya: jawab sesuai pertanyaan, lebih singkat dan langsung
- Jangan disclaimer "hanya hiburan" kecuali ditanya langsung`;
}

async function callGemini(
  model: string,
  systemPrompt: string,
  history: { role: string; parts: { text: string }[] }[],
  lastMessage: string
): Promise<string> {
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 2048,   // cukup untuk pembacaan awal yang panjang
      temperature: 0.85,
    },
    history,
  });

  const response = await chat.sendMessage({ message: lastMessage });
  const text = response.text;
  if (!text) throw new Error("Empty response");
  return text;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      selectedCards,
      topic,
      customTopic,
      isInitial,
    }: {
      messages: Message[];
      selectedCards: SelectedCard[];
      topic: Topic;
      customTopic?: string;
      isInitial?: boolean;
    } = body;

    if (!selectedCards || selectedCards.length !== 3) {
      return NextResponse.json({ error: "3 kartu harus dipilih" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(selectedCards, topic, customTopic);

    // Build conversation history
    const history = isInitial
      ? []
      : messages.slice(0, -1).map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

    const lastMessage = isInitial
      ? `Tolong berikan pembacaan tarot saya untuk topik ${getTopicLabel(topic, customTopic)}.`
      : messages[messages.length - 1]?.content ?? "";

    // Coba tiap model sampai berhasil
    let lastError: Error | null = null;
    for (const model of MODELS) {
      try {
        const text = await callGemini(model, systemPrompt, history, lastMessage);
        return NextResponse.json({ content: text, model });
      } catch (err: unknown) {
        const error = err as { status?: number; message?: string };
        // Kalau rate limit / quota, coba model berikutnya
        if (error?.status === 429 || (error?.message ?? "").includes("429") || (error?.message ?? "").includes("quota") || (error?.message ?? "").includes("RESOURCE_EXHAUSTED")) {
          console.warn(`[tarot] ${model} quota exceeded, trying next...`);
          lastError = new Error(error?.message ?? "Quota exceeded");
          continue;
        }
        // Error lain langsung lempar
        throw err;
      }
    }

    // Semua model gagal
    console.error("[tarot] All models failed:", lastError?.message);
    return NextResponse.json(
      { error: `Semua model AI sedang penuh. Coba lagi dalam beberapa menit. (${lastError?.message?.slice(0, 80)})` },
      { status: 503 }
    );
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[tarot] Chat API error:", error);
    return NextResponse.json(
      { error: `Gagal menghubungi AI: ${error?.message?.slice(0, 100) ?? "Unknown error"}` },
      { status: 500 }
    );
  }
}
