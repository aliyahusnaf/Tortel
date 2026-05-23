import type { TarotCard, SelectedCard, Topic } from "./types";
import cardsData from "@/data/tarot-cards.json";

export const ALL_CARDS: TarotCard[] = cardsData as TarotCard[];

export const MAJOR_ARCANA = ALL_CARDS.filter((c) => c.arcana === "major");
export const MINOR_ARCANA = ALL_CARDS.filter((c) => c.arcana === "minor");

/** Returns a shuffled subset of cards to display on the selection screen */
export function getShuffledDeck(count = 22): TarotCard[] {
  const shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getCardById(id: string): TarotCard | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}

export function getTopicLabel(topic: Topic, custom?: string): string {
  const labels: Record<Topic, string> = {
    love: "Love & Relationships",
    career: "Career & Ambition",
    friendship: "Friendship & Community",
    custom: custom ?? "General",
  };
  return labels[topic];
}

export function getMeaning(
  card: TarotCard,
  reversed: boolean,
  topic: Topic
): string {
  const prefix = reversed ? "reversed" : "upright";
  switch (topic) {
    case "love":
      return reversed ? card.reversed_love : card.upright_love;
    case "career":
      return reversed ? card.reversed_career : card.upright_career;
    case "friendship":
      return reversed ? card.reversed_friendship : card.upright_friendship;
    default:
      return reversed ? card.reversed_meaning : card.upright_meaning;
  }
}

export function buildReadingContext(
  selectedCards: SelectedCard[],
  topic: Topic,
  customTopic?: string
): string {
  const topicLabel = getTopicLabel(topic, customTopic);
  const positions = ["Past / Root", "Present / Focus", "Future / Outcome"];

  const cardContext = selectedCards
    .map((sc, i) => {
      const orientation = sc.reversed ? "Reversed ↓" : "Upright ↑";
      const meaning = getMeaning(sc.card, sc.reversed, topic);
      const keywords = sc.reversed
        ? sc.card.reversed_keywords
        : sc.card.upright_keywords;
      return `**Position ${i + 1} — ${positions[i]}**
Card: ${sc.card.name} (${orientation})
Keywords: ${keywords.join(", ")}
Meaning: ${meaning}`;
    })
    .join("\n\n");

  return `Topic: ${topicLabel}\n\n${cardContext}`;
}
