export const AREAS = [
  { key: "all", labelEn: "All Areas", labelAr: "كل المناطق", lat: 0, lng: 0 },
  { key: "New Cairo", labelEn: "New Cairo", labelAr: "القاهرة الجديدة", lat: 30.0300, lng: 31.4700 },
  { key: "Tagamoa", labelEn: "Tagamoa", labelAr: "التجمع الخامس", lat: 30.0074, lng: 31.4913 },
  { key: "Rehab", labelEn: "Rehab City", labelAr: "الرحاب", lat: 30.0588, lng: 31.4913 },
  { key: "Shorouk", labelEn: "Shorouk City", labelAr: "الشروق", lat: 30.1127, lng: 31.6100 },
  { key: "Sheikh Zayed", labelEn: "Sheikh Zayed", labelAr: "الشيخ زايد", lat: 30.0600, lng: 30.9800 },
  { key: "6th of October", labelEn: "6th of October", labelAr: "6 أكتوبر", lat: 29.9700, lng: 30.9200 },
  { key: "Maadi", labelEn: "Maadi", labelAr: "المعادي", lat: 29.9600, lng: 31.2500 },
  { key: "Nasr City", labelEn: "Nasr City", labelAr: "مدينة نصر", lat: 30.0700, lng: 31.3400 },
  { key: "Heliopolis", labelEn: "Heliopolis", labelAr: "مصر الجديدة", lat: 30.0900, lng: 31.3200 },
  { key: "Zamalek", labelEn: "Zamalek", labelAr: "الزمالك", lat: 30.0609, lng: 31.2194 },
  { key: "Dokki", labelEn: "Dokki", labelAr: "الدقي", lat: 30.0385, lng: 31.2120 },
  { key: "Mohandessin", labelEn: "Mohandessin", labelAr: "المهندسين", lat: 30.0544, lng: 31.2005 },
  { key: "Mokattam", labelEn: "Mokattam", labelAr: "المقطم", lat: 30.0100, lng: 31.2900 },
  { key: "Downtown", labelEn: "Downtown Cairo", labelAr: "وسط البلد", lat: 30.0444, lng: 31.2357 },
  { key: "Obour", labelEn: "Obour City", labelAr: "العبور", lat: 30.2285, lng: 31.4748 },
] as const;

export type AreaKey = (typeof AREAS)[number]["key"];

export const LOBBY_LEVELS = [
  { key: "BEGINNER", labelEn: "Beginner", labelAr: "مبتدئ" },
  { key: "INTERMEDIATE", labelEn: "Intermediate", labelAr: "متوسط" },
  { key: "ADVANCED", labelEn: "Advanced", labelAr: "متقدم" },
  { key: "PRO", labelEn: "Pro", labelAr: "محترف" },
] as const;

export type LobbyLevelKey = (typeof LOBBY_LEVELS)[number]["key"];

export function calculateTier(gamesPlayed: number): "BRONZE" | "SILVER" | "GOLD" | "EMERALD" | "DIAMOND" | "MASTER" | "GRANDMASTER" {
  if (gamesPlayed >= 100) return "GRANDMASTER";
  if (gamesPlayed >= 50) return "MASTER";
  if (gamesPlayed >= 25) return "DIAMOND";
  if (gamesPlayed >= 10) return "EMERALD";
  if (gamesPlayed >= 5) return "GOLD";
  if (gamesPlayed >= 3) return "SILVER";
  return "BRONZE";
}

export type PlayerTier = "BRONZE" | "SILVER" | "GOLD" | "EMERALD" | "DIAMOND" | "MASTER" | "GRANDMASTER";

export const PLAYER_TIER_COLORS: Record<PlayerTier, string> = {
  BRONZE: "#cd7f32",
  SILVER: "#c0c0c0",
  GOLD: "#ffd700",
  EMERALD: "#50c878",
  DIAMOND: "#b9f2ff",
  MASTER: "#ff4655",
  GRANDMASTER: "#d4ff00",
};

export const LISTING_CATEGORY_COLORS: Record<string, string> = {
  RACKETS: "#c8ff00",
  SHOES: "#00d4ff",
  BAGS: "#ff6b35",
  BALLS: "#ffd700",
  APPAREL: "#ff006e",
  ACCESSORIES: "#a78bfa",
  OTHER: "#9ca3af",
};
