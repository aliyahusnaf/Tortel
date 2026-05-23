export interface TarotCard {
  id: string;
  name: string;
  number: number;
  arcana: "major" | "minor";
  suit: "wands" | "cups" | "swords" | "pentacles" | null;
  image: string | null;
  upright_keywords: string[];
  reversed_keywords: string[];
  upright_meaning: string;
  reversed_meaning: string;
  upright_love: string;
  reversed_love: string;
  upright_career: string;
  reversed_career: string;
  upright_friendship: string;
  reversed_friendship: string;
}

export interface SelectedCard {
  card: TarotCard;
  reversed: boolean;
  position: 1 | 2 | 3;
}

export type Topic = "love" | "career" | "friendship" | "custom";

export interface ReadingState {
  selectedCards: SelectedCard[];
  topic: Topic;
  customTopic?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}
