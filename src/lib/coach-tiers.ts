export type CoachTier = "NEW" | "RISING" | "POPULAR" | "PRO";

export function getCoachTier(heartCount: number): CoachTier {
  if (heartCount >= 50) return "PRO";
  if (heartCount >= 15) return "POPULAR";
  if (heartCount >= 5) return "RISING";
  return "NEW";
}

export interface TierSparkleConfig {
  colorHex: string;
  borderColor: string;
  sparkleCount: number;
  duration: number;
  glow: string;
}

export const COACH_TIER_CONFIG: Record<
  CoachTier,
  {
    labelKey: string;
    color: string;
    bg: string;
    border: string;
    colorHex: string;
    sparkle: TierSparkleConfig | null;
  }
> = {
  NEW: {
    labelKey: "coach.tierNew",
    color: "text-white/60",
    bg: "bg-white/10",
    border: "border-white/20",
    colorHex: "#9ca3af",
    sparkle: null,
  },
  RISING: {
    labelKey: "coach.tierRising",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    colorHex: "#60a5fa",
    sparkle: {
      colorHex: "#60a5fa",
      borderColor: "rgba(96,165,250,0.4)",
      sparkleCount: 4,
      duration: 2.5,
      glow: "0 0 10px rgba(96,165,250,0.2)",
    },
  },
  POPULAR: {
    labelKey: "coach.tierPopular",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    colorHex: "#c084fc",
    sparkle: {
      colorHex: "#c084fc",
      borderColor: "rgba(192,132,252,0.45)",
      sparkleCount: 6,
      duration: 2,
      glow: "0 0 14px rgba(192,132,252,0.25)",
    },
  },
  PRO: {
    labelKey: "coach.tierPro",
    color: "text-[#c8ff00]",
    bg: "bg-[#c8ff00]/10",
    border: "border-[#c8ff00]/20",
    colorHex: "#c8ff00",
    sparkle: {
      colorHex: "#c8ff00",
      borderColor: "rgba(200,255,0,0.5)",
      sparkleCount: 8,
      duration: 1.5,
      glow: "0 0 18px rgba(200,255,0,0.3)",
    },
  },
};
