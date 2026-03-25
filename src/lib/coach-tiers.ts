export type CoachTier = "NEW" | "RISING" | "POPULAR" | "PRO";

export function getCoachTier(heartCount: number): CoachTier {
  if (heartCount >= 50) return "PRO";
  if (heartCount >= 15) return "POPULAR";
  if (heartCount >= 5) return "RISING";
  return "NEW";
}

export interface TierRingConfig {
  gradient: string;
  gradient2: string; // secondary counter-rotating layer
  duration: string;
  blur: number;
  blur2: number;
  glow: string;
}

export const COACH_TIER_CONFIG: Record<
  CoachTier,
  {
    labelKey: string;
    color: string;
    bg: string;
    border: string;
    ring: TierRingConfig | null;
  }
> = {
  NEW: {
    labelKey: "coach.tierNew",
    color: "text-white/60",
    bg: "bg-white/10",
    border: "border-white/20",
    ring: null,
  },
  RISING: {
    labelKey: "coach.tierRising",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    ring: {
      gradient: "conic-gradient(from 0deg, #60a5fa, #22d3ee, transparent, #3b82f6, transparent, #60a5fa)",
      gradient2: "conic-gradient(from 180deg, transparent, #22d3ee, transparent, #60a5fa, transparent)",
      duration: "3.5s",
      blur: 4,
      blur2: 6,
      glow: "0 0 15px rgba(96,165,250,0.5), 0 0 35px rgba(96,165,250,0.2), 0 0 60px rgba(96,165,250,0.08)",
    },
  },
  POPULAR: {
    labelKey: "coach.tierPopular",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    ring: {
      gradient: "conic-gradient(from 0deg, #c084fc, #f472b6, transparent, #a855f7, transparent, #c084fc)",
      gradient2: "conic-gradient(from 120deg, transparent, #e879f9, transparent, #818cf8, transparent)",
      duration: "3.2s",
      blur: 3,
      blur2: 5,
      glow: "0 0 12px rgba(192,132,252,0.4), 0 0 28px rgba(192,132,252,0.15)",
    },
  },
  PRO: {
    labelKey: "coach.tierPro",
    color: "text-[#c8ff00]",
    bg: "bg-[#c8ff00]/10",
    border: "border-[#c8ff00]/20",
    ring: {
      gradient: "conic-gradient(from 0deg, #c8ff00, #fbbf24, #c8ff00, #a3e635, transparent, #c8ff00)",
      gradient2: "conic-gradient(from 90deg, #fde047, transparent, #c8ff00, transparent, #fbbf24, #c8ff00)",
      duration: "1.8s",
      blur: 6,
      blur2: 10,
      glow: "0 0 25px rgba(200,255,0,0.8), 0 0 55px rgba(200,255,0,0.35), 0 0 90px rgba(200,255,0,0.15)",
    },
  },
};
