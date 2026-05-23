/**
 * Patches tarot-cards.json with known image URLs from thetarotlady.com
 * Run: node scripts/patch-images.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "../data/tarot-cards.json");
const BASE = "https://i0.wp.com/www.thetarotlady.com/wp-content/uploads";

// Known filenames from scraping thetarotlady.com/tarot-card-meanings/
// Pattern: i0.wp.com/www.thetarotlady.com/wp-content/uploads/2018/12/[name].jpg
const MAJOR = "2018/12";
const MINOR = "2018/12";

const IMAGE_MAP = {
  // ── Major Arcana (filenames verified from thetarotlady.com) ───────────────
  "the-fool":          `${BASE}/${MAJOR}/fool.jpg?w=300&ssl=1`,
  "the-magician":      `${BASE}/${MAJOR}/magician.jpg?w=300&ssl=1`,
  "the-high-priestess":`${BASE}/${MAJOR}/highpriestess.jpg?w=300&ssl=1`,
  "the-empress":       `${BASE}/${MAJOR}/empress.jpg?w=300&ssl=1`,
  "the-emperor":       `${BASE}/${MAJOR}/emperor.jpg?w=300&ssl=1`,
  "the-hierophant":    `${BASE}/${MAJOR}/heirophant.jpg?w=300&ssl=1`,  // site typo (missing r)
  "the-lovers":        `${BASE}/${MAJOR}/lovers.jpg?w=300&ssl=1`,
  "the-chariot":       `${BASE}/${MAJOR}/chariot.jpg?w=300&ssl=1`,
  "strength":          `${BASE}/${MAJOR}/strength.jpg?w=300&ssl=1`,
  "the-hermit":        `${BASE}/${MAJOR}/hermit.jpg?w=300&ssl=1`,
  "wheel-of-fortune":  `${BASE}/${MAJOR}/wheeloffortune.jpg?w=300&ssl=1`,
  "justice":           `${BASE}/${MAJOR}/justice.jpg?w=300&ssl=1`,
  "the-hanged-man":    `${BASE}/${MAJOR}/hangedman.jpg?w=300&ssl=1`,
  "death":             `${BASE}/${MAJOR}/death.jpg?w=300&ssl=1`,
  "temperance":        `${BASE}/${MAJOR}/temperance.jpg?w=300&ssl=1`,
  "the-devil":         `${BASE}/${MAJOR}/devil.jpg?w=300&ssl=1`,
  "the-tower":         `${BASE}/${MAJOR}/tower.jpg?w=300&ssl=1`,
  "the-star":          `${BASE}/${MAJOR}/star.jpg?w=300&ssl=1`,
  "the-moon":          `${BASE}/${MAJOR}/moon.jpg?w=300&ssl=1`,
  "the-sun":           `${BASE}/${MAJOR}/sun.jpg?w=300&ssl=1`,
  "judgement":         `${BASE}/${MAJOR}/judgment.jpg?w=300&ssl=1`,  // US spelling on site
  "the-world":         `${BASE}/${MAJOR}/world.jpg?w=300&ssl=1`,

  // ── Wands ─────────────────────────────────────────────────────────────────
  "ace-of-wands":      `${BASE}/${MINOR}/acewands.jpg?w=300&ssl=1`,
  "two-of-wands":      `${BASE}/${MINOR}/2wands.jpg?w=300&ssl=1`,
  "three-of-wands":    `${BASE}/${MINOR}/3wands.jpg?w=300&ssl=1`,
  "four-of-wands":     `${BASE}/${MINOR}/4wands.jpg?w=300&ssl=1`,
  "five-of-wands":     `${BASE}/${MINOR}/5wands.jpg?w=300&ssl=1`,
  "six-of-wands":      `${BASE}/${MINOR}/6wands.jpg?w=300&ssl=1`,
  "seven-of-wands":    `${BASE}/${MINOR}/7wands.jpg?w=300&ssl=1`,
  "eight-of-wands":    `${BASE}/${MINOR}/8wands.jpg?w=300&ssl=1`,
  "nine-of-wands":     `${BASE}/${MINOR}/9wands.jpg?w=300&ssl=1`,
  "ten-of-wands":      `${BASE}/${MINOR}/10wands.jpg?w=300&ssl=1`,
  "page-of-wands":     `${BASE}/${MINOR}/pagewands.jpg?w=300&ssl=1`,
  "knight-of-wands":   `${BASE}/${MINOR}/knightwands.jpg?w=300&ssl=1`,
  "queen-of-wands":    `${BASE}/${MINOR}/queenwands.jpg?w=300&ssl=1`,
  "king-of-wands":     `${BASE}/${MINOR}/kingwands.jpg?w=300&ssl=1`,

  // ── Cups ──────────────────────────────────────────────────────────────────
  "ace-of-cups":       `${BASE}/${MINOR}/acecups.jpg?w=300&ssl=1`,
  "two-of-cups":       `${BASE}/${MINOR}/2cups.jpg?w=300&ssl=1`,
  "three-of-cups":     `${BASE}/${MINOR}/3cups.jpg?w=300&ssl=1`,
  "four-of-cups":      `${BASE}/${MINOR}/4cups.jpg?w=300&ssl=1`,
  "five-of-cups":      `${BASE}/${MINOR}/5cups.jpg?w=300&ssl=1`,
  "six-of-cups":       `${BASE}/${MINOR}/6cups.jpg?w=300&ssl=1`,
  "seven-of-cups":     `${BASE}/${MINOR}/7cups.jpg?w=300&ssl=1`,
  "eight-of-cups":     `${BASE}/${MINOR}/8cups.jpg?w=300&ssl=1`,
  "nine-of-cups":      `${BASE}/${MINOR}/9cups.jpg?w=300&ssl=1`,
  "ten-of-cups":       `${BASE}/${MINOR}/10cups.jpg?w=300&ssl=1`,
  "page-of-cups":      `${BASE}/${MINOR}/pagecups.jpg?w=300&ssl=1`,
  "knight-of-cups":    `${BASE}/${MINOR}/knightcups.jpg?w=300&ssl=1`,
  "queen-of-cups":     `${BASE}/${MINOR}/queencups.jpg?w=300&ssl=1`,
  "king-of-cups":      `${BASE}/${MINOR}/kingcups.jpg?w=300&ssl=1`,

  // ── Swords ────────────────────────────────────────────────────────────────
  "ace-of-swords":     `${BASE}/${MINOR}/aceswords.jpg?w=300&ssl=1`,
  "two-of-swords":     `${BASE}/${MINOR}/2swords.jpg?w=300&ssl=1`,
  "three-of-swords":   `${BASE}/${MINOR}/3swords.jpg?w=300&ssl=1`,
  "four-of-swords":    `${BASE}/${MINOR}/4swords.jpg?w=300&ssl=1`,
  "five-of-swords":    `${BASE}/${MINOR}/5swords.jpg?w=300&ssl=1`,
  "six-of-swords":     `${BASE}/${MINOR}/6swords.jpg?w=300&ssl=1`,
  "seven-of-swords":   `${BASE}/${MINOR}/7swords.jpg?w=300&ssl=1`,
  "eight-of-swords":   `${BASE}/${MINOR}/8swords.jpg?w=300&ssl=1`,
  "nine-of-swords":    `${BASE}/${MINOR}/9swords.jpg?w=300&ssl=1`,
  "ten-of-swords":     `${BASE}/${MINOR}/10swords.jpg?w=300&ssl=1`,
  "page-of-swords":    `${BASE}/${MINOR}/pageswords.jpg?w=300&ssl=1`,
  "knight-of-swords":  `${BASE}/${MINOR}/knightswords.jpg?w=300&ssl=1`,
  "queen-of-swords":   `${BASE}/${MINOR}/queenswords.jpg?w=300&ssl=1`,
  "king-of-swords":    `${BASE}/${MINOR}/kingswords.jpg?w=300&ssl=1`,

  // ── Pentacles ─────────────────────────────────────────────────────────────
  "ace-of-pentacles":    `${BASE}/${MINOR}/acepent.jpg?w=300&ssl=1`,
  "two-of-pentacles":    `${BASE}/${MINOR}/2pent.jpg?w=300&ssl=1`,
  "three-of-pentacles":  `${BASE}/${MINOR}/3pent.jpg?w=300&ssl=1`,
  "four-of-pentacles":   `${BASE}/${MINOR}/4pent.jpg?w=300&ssl=1`,
  "five-of-pentacles":   `${BASE}/${MINOR}/5pent.jpg?w=300&ssl=1`,
  "six-of-pentacles":    `${BASE}/${MINOR}/6pent.jpg?w=300&ssl=1`,
  "seven-of-pentacles":  `${BASE}/${MINOR}/7pent.jpg?w=300&ssl=1`,
  "eight-of-pentacles":  `${BASE}/${MINOR}/8pent.jpg?w=300&ssl=1`,
  "nine-of-pentacles":   `${BASE}/${MINOR}/9pent.jpg?w=300&ssl=1`,
  "ten-of-pentacles":    `${BASE}/${MINOR}/10pent.jpg?w=300&ssl=1`,
  "page-of-pentacles":   `${BASE}/${MINOR}/pagepent.jpg?w=300&ssl=1`,
  "knight-of-pentacles": `${BASE}/${MINOR}/knightpent.jpg?w=300&ssl=1`,
  "queen-of-pentacles":  `${BASE}/${MINOR}/queenpent.jpg?w=300&ssl=1`,
  "king-of-pentacles":   `${BASE}/${MINOR}/kingpent.jpg?w=300&ssl=1`,
};

async function verifyUrl(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const cards = JSON.parse(readFileSync(dataPath, "utf-8"));
  let patched = 0;
  let verified = 0;
  let failed = 0;

  console.log(`\n🔮 Patching ${cards.length} cards...\n`);

  for (const card of cards) {
    const url = IMAGE_MAP[card.id];
    if (!url) {
      console.log(`⚠️  No URL for: ${card.id}`);
      continue;
    }

    process.stdout.write(`🔍 ${card.name}... `);
    const ok = await verifyUrl(url);
    if (ok) {
      card.image = url;
      patched++;
      verified++;
      console.log("✅");
    } else {
      console.log("❌ URL not reachable");
      failed++;
    }

    await new Promise((r) => setTimeout(r, 100));
  }

  writeFileSync(dataPath, JSON.stringify(cards, null, 2));
  console.log(`\n✨ Done! ${patched} images patched (${failed} failed)\n`);
}

main().catch(console.error);
