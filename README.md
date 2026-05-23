# 🔮 Mystic Tarot — AI Reading

AI tarot reading app built with Next.js + Claude AI. Pilih 3 kartu, pilih topik, dan dapatkan pembacaan personal dari AI.

## Flow
1. **Pilih 3 Kartu** — 22 kartu tertutup ditampilkan, klik untuk memilih. Kartu akan terbuka dan secara random bisa jadi upright (↑) atau reversed (↓).
2. **Pilih Topik** — Cinta, Karir, Pertemanan, atau topik sendiri.
3. **Pembacaan AI** — Claude (Mystic) membacakan ketiga kartu dalam konteks topik yang dipilih.
4. **QnA** — Tanya apapun tentang bacaanmu.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set API Key
```bash
cp .env.example .env.local
# Edit .env.local → masukkan ANTHROPIC_API_KEY dari console.anthropic.com
```

### 3. Patch gambar kartu (sekali saja)
```bash
node scripts/patch-images.mjs
```

### 4. Run
```bash
npm run dev   # dev → localhost:3000
npm run build && npm start   # production
```

## Tech Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + Framer Motion (card flip 3D animation)
- Claude Sonnet 4.6 (AI tarot reader)
- 78 kartu tarot dengan makna lengkap
- Gambar dari thetarotlady.com via Jetpack CDN
