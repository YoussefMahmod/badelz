"use client";

import Image from "next/image";
import { MapPin, Crown, Sparkles, Gamepad2 } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { CardShell } from "./card-shell";

type PlayerTier =
  | "BRONZE"
  | "GOLD"
  | "EMERALD"
  | "DIAMOND"
  | "MASTER"
  | "GRANDMASTER";
type ShellTier =
  | "bronze"
  | "gold"
  | "emerald"
  | "diamond"
  | "master"
  | "grandmaster";

interface PlayerCardProps {
  player: {
    name: string;
    nameAr?: string | null;
    phone?: string;
    area?: string | null;
    areaAr?: string | null;
    gamesPlayed: number;
    gamesWon: number;
    rating: number | string;
    tier: PlayerTier;
    avatar?: string | null;
  };
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  showStats?: boolean;
  isHost?: boolean;
}

const TIER_COLORS: Record<PlayerTier, string> = {
  BRONZE: "#cd7f32",
  GOLD: "#ffd700",
  EMERALD: "#50c878",
  DIAMOND: "#b9f2ff",
  MASTER: "#ff4655",
  GRANDMASTER: "#c8ff00",
};

/* Tiers that show a sparkle icon next to the badge label */
const TIERS_WITH_SPARKLE: Set<PlayerTier> = new Set([
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
]);

/* Badge pulsing glow animation via CSS */
const TIERS_WITH_BADGE_PULSE: Set<PlayerTier> = new Set([
  "MASTER",
  "GRANDMASTER",
]);

/* Avatar glow styles per tier */
const AVATAR_GLOW: Partial<Record<PlayerTier, React.CSSProperties>> = {
  GOLD: { boxShadow: "0 0 8px rgba(255,215,0,0.3)" },
  EMERALD: { boxShadow: "0 0 10px rgba(80,200,120,0.3)" },
  DIAMOND: {
    boxShadow: "0 0 12px rgba(185,242,255,0.4)",
    animation: "diamond-avatar-pulse 2s ease-in-out infinite",
  },
  MASTER: {
    boxShadow: "0 0 15px rgba(255,70,85,0.4)",
    animation: "master-avatar-flame 1.5s ease-in-out infinite",
  },
};

/* Avatar border width per tier */
const AVATAR_BORDER_WIDTH: Record<PlayerTier, number> = {
  BRONZE: 2,
  GOLD: 2,
  EMERALD: 3,
  DIAMOND: 3,
  MASTER: 4,
  GRANDMASTER: 3, // handled by conic wrapper
};

const AVATAR_CLS = {
  sm: "w-10 h-10 text-xs",
  md: "w-16 h-16 text-base",
  lg: "w-20 h-20 text-lg",
} as const;

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Avatar({
  src,
  name,
  size,
  color,
  tier,
}: {
  src?: string | null;
  name: string;
  size: "sm" | "md" | "lg";
  color: string;
  tier: PlayerTier;
}) {
  const avatarContent = src ? (
    <Image src={src} alt={name} fill sizes="80px" className="object-cover" />
  ) : (
    initials(name)
  );

  /* Grandmaster gets the rotating aurora border wrapper */
  if (tier === "GRANDMASTER") {
    return (
      <div
        className="rounded-full p-[3px]"
        style={{
          background:
            "conic-gradient(from var(--gm-aurora-angle, 0deg), #c8ff00, #00d4ff, #ff4655, #ffd700, #c8ff00)",
          animation: "gm-aurora-rotate 3s linear infinite",
        }}
      >
        <div
          className={`relative ${AVATAR_CLS[size]} rounded-full flex items-center justify-center font-bold overflow-hidden`}
          style={{ backgroundColor: "#0a0f1a", color }}
        >
          {avatarContent}
        </div>
      </div>
    );
  }

  const glowStyle = AVATAR_GLOW[tier] ?? {};
  const borderWidth = AVATAR_BORDER_WIDTH[tier];

  return (
    <div
      className={`relative ${AVATAR_CLS[size]} rounded-full flex items-center justify-center font-bold overflow-hidden`}
      style={{
        border: `${borderWidth}px solid ${color}`,
        backgroundColor: `${color}15`,
        color,
        ...glowStyle,
      }}
    >
      {avatarContent}
    </div>
  );
}

function TierBadge({
  tier,
  tierKey,
  color,
  small,
}: {
  tier: string;
  tierKey: PlayerTier;
  color: string;
  small?: boolean;
}) {
  const showSparkle = TIERS_WITH_SPARKLE.has(tierKey);
  const hasPulse = TIERS_WITH_BADGE_PULSE.has(tierKey);

  return (
    <span
      className={[
        "font-bold rounded-full inline-flex items-center gap-1",
        small ? "text-[8px] px-2 py-0.5" : "text-xs px-3 py-1",
        hasPulse ? "badge-glow-pulse" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        backgroundColor: `${color}25`,
        color,
        boxShadow: `0 0 10px ${color}30`,
        ["--badge-glow" as string]: `${color}50`,
      }}
    >
      {showSparkle && <Sparkles size={small ? 8 : 10} style={{ color }} />}
      {tier}
    </span>
  );
}

function HostCrown({ size }: { size: "sm" | "md" | "lg" }) {
  return (
    <Crown
      className="absolute -top-2.5 start-1/2 -translate-x-1/2 z-10"
      size={size === "lg" ? 18 : size === "md" ? 14 : 12}
      style={{ color: "#ffd700" }}
      fill="#ffd700"
    />
  );
}

export function PlayerCard({
  player,
  size = "md",
  interactive = true,
  showStats = true,
  isHost = false,
}: PlayerCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const color = TIER_COLORS[player.tier];
  const shell = player.tier.toLowerCase() as ShellTier;
  const tierLabel = t(`player.${shell}`);
  const displayName =
    locale === "ar" && player.nameAr ? player.nameAr : player.name;
  const secondName =
    locale === "ar" && player.nameAr ? player.name : player.nameAr;
  const area =
    locale === "ar" && player.areaAr ? player.areaAr : player.area;

  if (size === "sm") {
    return (
      <CardShell tier={shell} size="sm" interactive={interactive}>
        <div className="flex flex-col items-center justify-center h-full p-2 gap-1.5">
          <TierBadge
            tier={tierLabel}
            tierKey={player.tier}
            color={color}
            small
          />
          <div className="relative">
            {isHost && <HostCrown size="sm" />}
            <Avatar
              src={player.avatar}
              name={player.name}
              size="sm"
              color={color}
              tier={player.tier}
            />
          </div>
          <p className="text-white font-bold text-xs text-center leading-tight line-clamp-1">
            {displayName}
          </p>
        </div>
      </CardShell>
    );
  }

  const nameCls = size === "lg" ? "text-base" : "text-sm";
  const statCls =
    "text-white font-bold text-sm font-[family-name:var(--font-display)]";
  const labelCls = "text-white/40 text-[10px] uppercase tracking-wide";

  return (
    <CardShell tier={shell} size={size} interactive={interactive}>
      <div className="flex flex-col h-full p-3">
        <div className="flex items-start justify-between">
          <span className="bg-white/10 rounded-lg px-2 py-1 text-white/70 text-[10px] font-bold font-[family-name:var(--font-display)]">
            {player.gamesPlayed}
          </span>
          <TierBadge
            tier={tierLabel}
            tierKey={player.tier}
            color={color}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-2">
          <div className="relative">
            {isHost && <HostCrown size={size} />}
            <Avatar
              src={player.avatar}
              name={player.name}
              size={size}
              color={color}
              tier={player.tier}
            />
          </div>
          <div className="text-center">
            <p className={`text-white font-bold leading-tight ${nameCls}`}>
              {displayName}
            </p>
            {secondName && (
              <p className="text-white/40 text-xs mt-0.5">{secondName}</p>
            )}
          </div>
        </div>

        {showStats && (
          <div className="flex items-center justify-center gap-2 mb-2 px-2">
            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5">
              <Gamepad2 size={12} className="text-white/40" />
              <span className={statCls}>{player.gamesPlayed}</span>
              <span className={labelCls}>{t("player.gamesPlayed")}</span>
            </div>
          </div>
        )}

        {area && (
          <div className="flex items-center justify-center gap-1 text-white/40 text-xs">
            <MapPin size={10} />
            <span>{area}</span>
          </div>
        )}
      </div>
    </CardShell>
  );
}
