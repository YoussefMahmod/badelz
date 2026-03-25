export type CoachTier = "NEW" | "RISING" | "POPULAR" | "PRO";

export function getCoachTier(heartCount: number): CoachTier {
  if (heartCount >= 50) return "PRO";
  if (heartCount >= 15) return "POPULAR";
  if (heartCount >= 5) return "RISING";
  return "NEW";
}

export interface TierFlameConfig {
  colorHex: string;
  glowColor: string;
  particleCount: number;
  duration: number; // seconds per particle cycle
  ringGlow: string;
}

export const COACH_TIER_CONFIG: Record<
  CoachTier,
  {
    labelKey: string;
    color: string;
    bg: string;
    border: string;
    flame: TierFlameConfig | null;
  }
> = {
  NEW: {
    labelKey: "coach.tierNew",
    color: "text-white/60",
    bg: "bg-white/10",
    border: "border-white/20",
    flame: null,
  },
  RISING: {
    labelKey: "coach.tierRising",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    flame: {
      colorHex: "#60a5fa",
      glowColor: "rgba(96,165,250,0.6)",
      particleCount: 6,
      duration: 2.2,
      ringGlow: "0 0 12px rgba(96,165,250,0.3), 0 0 25px rgba(96,165,250,0.1)",
    },
  },
  POPULAR: {
    labelKey: "coach.tierPopular",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    flame: {
      colorHex: "#c084fc",
      glowColor: "rgba(192,132,252,0.6)",
      particleCount: 8,
      duration: 1.6,
      ringGlow: "0 0 15px rgba(192,132,252,0.35), 0 0 30px rgba(192,132,252,0.12)",
    },
  },
  PRO: {
    labelKey: "coach.tierPro",
    color: "text-[#c8ff00]",
    bg: "bg-[#c8ff00]/10",
    border: "border-[#c8ff00]/20",
    flame: {
      colorHex: "#c8ff00",
      glowColor: "rgba(200,255,0,0.6)",
      particleCount: 12,
      duration: 1.2,
      ringGlow: "0 0 20px rgba(200,255,0,0.4), 0 0 40px rgba(200,255,0,0.15)",
    },
  },
};
