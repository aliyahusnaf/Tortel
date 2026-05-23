/**
 * Tarot card image scraper from thetarotlady.com
 * Run: node scripts/scrape-tarot.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "../data/tarot-cards.json");

const CARD_URLS = {
  "the-fool": "https://www.thetarotlady.com/the-fool/",
  "the-magician": "https://www.thetarotlady.com/the-magician/",
  "the-high-priestess": "https://www.thetarotlady.com/the-high-priestess/",
  "the-empress": "https://www.thetarotlady.com/the-empress/",
  "the-emperor": "https://www.thetarotlady.com/the-emperor/",
  "the-hierophant": "https://www.thetarotlady.com/the-hierophant/",
  "the-lovers": "https://www.thetarotlady.com/the-lovers/",
  "the-chariot": "https://www.thetarotlady.com/the-chariot/",
  "strength": "https://www.thetarotlady.com/strength/",
  "the-hermit": "https://www.thetarotlady.com/the-hermit/",
  "wheel-of-fortune": "https://www.thetarotlady.com/wheel-of-fortune/",
  "justice": "https://www.thetarotlady.com/justice/",
  "the-hanged-man": "https://www.thetarotlady.com/the-hanged-man/",
  "death": "https://www.thetarotlady.com/death/",
  "temperance": "https://www.thetarotlady.com/temperance/",
  "the-devil": "https://www.thetarotlady.com/the-devil/",
  "the-tower": "https://www.thetarotlady.com/the-tower/",
  "the-star": "https://www.thetarotlady.com/the-star/",
  "the-moon": "https://www.thetarotlady.com/the-moon/",
  "the-sun": "https://www.thetarotlady.com/the-sun/",
  "judgement": "https://www.thetarotlady.com/judgement/",
  "the-world": "https://www.thetarotlady.com/the-world/",
  "ace-of-wands": "https://www.thetarotlady.com/ace-of-wands/",
  "two-of-wands": "https://www.thetarotlady.com/two-of-wands/",
  "three-of-wands": "https://www.thetarotlady.com/three-of-wands/",
  "four-of-wands": "https://www.thetarotlady.com/four-of-wands/",
  "five-of-wands": "https://www.thetarotlady.com/five-of-wands/",
  "six-of-wands": "https://www.thetarotlady.com/six-of-wands/",
  "seven-of-wands": "https://www.thetarotlady.com/seven-of-wands/",
  "eight-of-wands": "https://www.thetarotlady.com/eight-of-wands/",
  "nine-of-wands": "https://www.thetarotlady.com/nine-of-wands/",
  "ten-of-wands": "https://www.thetarotlady.com/ten-of-wands/",
  "page-of-wands": "https://www.thetarotlady.com/page-of-wands/",
  "knight-of-wands": "https://www.thetarotlady.com/knight-of-wands/",
  "queen-of-wands": "https://www.thetarotlady.com/queen-of-wands/",
  "king-of-wands": "https://www.thetarotlady.com/king-of-wands/",
  "ace-of-cups": "https://www.thetarotlady.com/ace-of-cups/",
  "two-of-cups": "https://www.thetarotlady.com/two-of-cups/",
  "three-of-cups": "https://www.thetarotlady.com/three-of-cups/",
  "four-of-cups": "https://www.thetarotlady.com/four-of-cups/",
  "five-of-cups": "https://www.thetarotlady.com/five-of-cups/",
  "six-of-cups": "https://www.thetarotlady.com/six-of-cups/",
  "seven-of-cups": "https://www.thetarotlady.com/seven-of-cups/",
  "eight-of-cups": "https://www.thetarotlady.com/eight-of-cups/",
  "nine-of-cups": "https://www.thetarotlady.com/nine-of-cups/",
  "ten-of-cups": "https://www.thetarotlady.com/ten-of-cups/",
  "page-of-cups": "https://www.thetarotlady.com/page-of-cups/",
  "knight-of-cups": "https://www.thetarotlady.com/knight-of-cups/",
  "queen-of-cups": "https://www.thetarotlady.com/queen-of-cups/",
  "king-of-cups": "https://www.thetarotlady.com/king-of-cups/",
  "ace-of-swords": "https://www.thetarotlady.com/ace-of-swords/",
  "two-of-swords": "https://www.thetarotlady.com/two-of-swords/",
  "three-of-swords": "https://www.thetarotlady.com/three-of-swords/",
  "four-of-swords": "https://www.thetarotlady.com/four-of-swords/",
  "five-of-swords": "https://www.thetarotlady.com/five-of-swords/",
  "six-of-swords": "https://www.thetarotlady.com/six-of-swords/",
  "seven-of-swords": "https://www.thetarotlady.com/seven-of-swords/",
  "eight-of-swords": "https://www.thetarotlady.com/eight-of-swords/",
  "nine-of-swords": "https://www.thetarotlady.com/nine-of-swords/",
  "ten-of-swords": "https://www.thetarotlady.com/ten-of-swords/",
  "page-of-swords": "https://www.thetarotlady.com/page-of-swords/",
  "knight-of-swords": "https://www.thetarotlady.com/knight-of-swords/",
  "queen-of-swords": "https://www.thetarotlady.com/queen-of-swords/",
  "king-of-swords": "https://www.thetarotlady.com/king-of-swords/",
  "ace-of-pentacles": "https://www.thetarotlady.com/ace-of-pentacles/",
  "two-of-pentacles": "https://www.thetarotlady.com/two-of-pentacles/",
  "three-of-pentacles": "https://www.thetarotlady.com/three-of-pentacles/",
  "four-of-pentacles": "https://www.thetarotlady.com/four-of-pentacles/",
  "five-of-pentacles": "https://www.thetarotlady.com/five-of-pentacles/",
  "six-of-pentacles": "https://www.thetarotlady.com/six-of-pentacles/",
  "seven-of-pentacles": "https://www.thetarotlady.com/seven-of-pentacles/",
  "eight-of-pentacles": "https://www.thetarotlady.com/eight-of-pentacles/",
  "nine-of-pentacles": "https://www.thetarotlady.com/nine-of-pentacles/",
  "ten-of-pentacles": "https://www.thetarotlady.com/ten-of-pentacles/",
  "page-of-pentacles": "https://www.thetarotlady.com/page-of-pentacles/",
  "knight-of-pentacles": "https://www.thetarotlady.com/knight-of-pentacles/",
  "queen-of-pentacles": "https://www.thetarotlady.com/queen-of-pentacles/",
  "king-of-pentacles": "https://www.thetarotlady.com/king-of-pentacles/",
};

async function scrapeImageFromPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Jetpack CDN format used by thetarotlady.com
    const jetpackRegex = /https?:\/\/i[0-9]\.wp\.com\/www\.thetarotlady\.com\/wp-content\/uploads\/(\d{4}\/\d{2}\/[^"'\s?&]+\.(?:jpg|jpeg|png))/gi;
    const match = jetpackRegex.exec(html);
    if (match) {
      return `https://i0.wp.com/www.thetarotlady.com/wp-content/uploads/${match[1]}?w=400&ssl=1`;
    }

    // Fallback: direct wp-content URL
    const directRegex = /https?:\/\/www\.thetarotlady\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s?&]+\.(?:jpg|jpeg|png)/gi;
    const match2 = directRegex.exec(html);
    return match2 ? match2[0] : null;
  } catch {
    return null;
  }
}

async function main() {
  const cards = JSON.parse(readFileSync(dataPath, "utf-8"));
  let updated = 0;

  for (const card of cards) {
    if (card.image) {
      console.log(`⏭  ${card.name} — already has image`);
      continue;
    }

    const url = CARD_URLS[card.id];
    if (!url) {
      console.log(`⚠️  ${card.name} — no URL mapping`);
      continue;
    }

    process.stdout.write(`🔍 Scraping ${card.name}...`);
    const image = await scrapeImageFromPage(url);

    if (image) {
      card.image = image;
      updated++;
      console.log(` ✅ ${image.split("/").pop()}`);
    } else {
      console.log(` ❌ not found`);
    }

    // Polite delay between requests
    await new Promise((r) => setTimeout(r, 600));
  }

  writeFileSync(dataPath, JSON.stringify(cards, null, 2));
  console.log(`\n✨ Done! Updated ${updated} cards.`);
}

main().catch(console.error);
