export const AREAS = [
  { key: "all", labelEn: "All Areas", labelAr: "كل المناطق" },
  { key: "New Cairo", labelEn: "New Cairo", labelAr: "القاهرة الجديدة" },
  { key: "Sheikh Zayed", labelEn: "Sheikh Zayed", labelAr: "الشيخ زايد" },
  { key: "Maadi", labelEn: "Maadi", labelAr: "المعادي" },
  { key: "Nasr City", labelEn: "Nasr City", labelAr: "مدينة نصر" },
  { key: "6th of October", labelEn: "6th of October", labelAr: "6 أكتوبر" },
  { key: "Heliopolis", labelEn: "Heliopolis", labelAr: "مصر الجديدة" },
] as const;

export type AreaKey = (typeof AREAS)[number]["key"];

export function calculateTier(gamesPlayed: number): "BRONZE" | "SILVER" | "GOLD" | "DIAMOND" | "ELITE" {
  if (gamesPlayed >= 50) return "ELITE";
  if (gamesPlayed >= 25) return "DIAMOND";
  if (gamesPlayed >= 10) return "GOLD";
  if (gamesPlayed >= 3) return "SILVER";
  return "BRONZE";
}

export const LISTING_CATEGORY_COLORS: Record<string, string> = {
  RACKETS: "#c8ff00",
  SHOES: "#00d4ff",
  BAGS: "#ff6b35",
  BALLS: "#ffd700",
  APPAREL: "#ff006e",
  ACCESSORIES: "#a78bfa",
  OTHER: "#9ca3af",
};
