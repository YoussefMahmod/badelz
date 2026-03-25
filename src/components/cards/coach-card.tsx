"use client";

import { Heart, MapPin } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { CardShell } from "./card-shell";
import { getCoachTier, COACH_TIER_CONFIG } from "@/lib/coach-tiers";

interface CoachData {
  id: string;
  name: string;
  nameAr?: string | null;
  photo?: string | null;
  areas: string[];
  areasAr?: string[];
  pricePerHour?: number | string | null;
  experience?: string | null;
  heartCount?: number;
}

interface CoachCardProps {
  coach: CoachData;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function TierBadge({ heartCount }: { heartCount: number }) {
  const { t } = useTranslation();
  const tier = getCoachTier(heartCount);
  const config = COACH_TIER_CONFIG[tier];

  return (
    <span
      className={`${config.bg} ${config.color} border ${config.border} text-[10px] font-semibold px-2 py-0.5 rounded-full`}
    >
      {t(config.labelKey as Parameters<typeof t>[0])}
    </span>
  );
}

// 4-point star clip path
const STAR_CLIP = "polygon(50% 0%, 61% 35%, 100% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 0% 35%, 39% 35%)";

function Avatar({
  photo,
  name,
  displayName,
  size,
  heartCount = 0,
}: {
  photo?: string | null;
  name: string;
  displayName: string;
  size: "sm" | "md" | "lg";
  heartCount?: number;
}) {
  const outerSizes = { sm: 48, md: 56, lg: 92 };
  const innerSizes = { sm: 40, md: 48, lg: 80 };
  const fontSize = { sm: "text-xs", md: "text-sm", lg: "text-lg" };
  const starSizes = { sm: 6, md: 7, lg: 10 };

  const tier = getCoachTier(heartCount);
  const tierConfig = COACH_TIER_CONFIG[tier];
  const sparkle = tierConfig.sparkle;

  const outer = outerSizes[size];
  const inner = innerSizes[size];
  const starSize = starSizes[size];

  // No sparkles for NEW tier
  if (!sparkle) {
    return (
      <div
        className={`shrink-0 rounded-full flex items-center justify-center font-bold overflow-hidden border-2 border-white/20 ${fontSize[size]}`}
        style={{
          width: inner,
          height: inner,
          background: "linear-gradient(135deg, rgba(200,255,0,0.12), rgba(200,255,0,0.03))",
          color: "#c8ff00",
        }}
      >
        {photo ? (
          <img src={photo} alt={displayName} className="w-full h-full rounded-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
    );
  }

  // Dynamic speed: more hearts = faster twinkle
  const dynamicDuration = (() => {
    const ranges: Record<string, [number, number]> = { RISING: [5, 14], POPULAR: [15, 49], PRO: [50, 150] };
    const range = ranges[tier];
    if (!range) return sparkle.duration;
    const [min, max] = range;
    const intensity = Math.min(1, (heartCount - min) / (max - min));
    return sparkle.duration - intensity * sparkle.duration * 0.3;
  })();

  // Generate sparkles evenly around the circumference
  const sparkles = Array.from({ length: sparkle.sparkleCount }, (_, i) => {
    const angle = (i / sparkle.sparkleCount) * Math.PI * 2 - Math.PI / 2;
    const radius = outer / 2;
    const x = Math.cos(angle) * radius + outer / 2;
    const y = Math.sin(angle) * radius + outer / 2;
    const delay = (i / sparkle.sparkleCount) * dynamicDuration;
    const useAlt = i % 2 === 0;
    return { x, y, delay, useAlt };
  });

  return (
    <div
      className="shrink-0 relative flex items-center justify-center"
      style={{ width: outer, height: outer }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: sparkle.glow }}
      />

      {/* Tier-colored ring border */}
      <div
        className="absolute rounded-full"
        style={{
          inset: (outer - inner) / 2 - 2,
          border: `2px solid ${sparkle.borderColor}`,
        }}
      />

      {/* Twinkling star sparkles */}
      {sparkles.map((s, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: s.x - starSize / 2,
            top: s.y - starSize / 2,
            width: starSize,
            height: starSize,
            background: sparkle.colorHex,
            clipPath: STAR_CLIP,
            animation: `${s.useAlt ? "sparkle-twinkle-alt" : "sparkle-twinkle"} ${dynamicDuration.toFixed(1)}s ease-in-out infinite`,
            animationDelay: `${s.delay.toFixed(2)}s`,
          }}
        />
      ))}

      {/* Avatar content */}
      <div
        className={`relative rounded-full flex items-center justify-center font-bold overflow-hidden z-10 ${fontSize[size]}`}
        style={{
          width: inner,
          height: inner,
          background: "linear-gradient(135deg, rgba(200,255,0,0.08), rgba(200,255,0,0.02))",
          color: "#c8ff00",
        }}
      >
        {photo ? (
          <img src={photo} alt={displayName} className="w-full h-full rounded-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
    </div>
  );
}

export { type CoachData };

export function CoachCard({
  coach,
  size = "md",
  interactive = true,
  onClick,
}: CoachCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const displayName = locale === "ar" && coach.nameAr ? coach.nameAr : coach.name;
  const secondaryName = locale === "ar" && coach.nameAr ? coach.name : coach.nameAr;
  const displayAreas =
    locale === "ar" && coach.areasAr?.length ? coach.areasAr : coach.areas;
  const hearts = coach.heartCount ?? 0;
  const price = coach.pricePerHour != null ? Number(coach.pricePerHour) : null;

  // ── SM: Compact (discover feed) ──
  if (size === "sm") {
    return (
      <CardShell accentColor="#c8ff00" size="sm" interactive={interactive} onClick={onClick}>
        <div className="flex flex-col items-center justify-center h-full p-2 gap-1.5">
          <Avatar photo={coach.photo} name={coach.name} displayName={displayName} size="sm" heartCount={hearts} />
          <p className="text-white font-bold text-xs text-center leading-tight line-clamp-1">
            {displayName}
          </p>
          {price && (
            <p className="text-[#c8ff00] text-[10px] font-bold">{price} {t("common.egp")}</p>
          )}
        </div>
      </CardShell>
    );
  }

  // ── MD: Horizontal card (browse page) ──
  if (size === "md") {
    const infoParts: string[] = [];
    if (coach.experience) infoParts.push(coach.experience);
    if (price) infoParts.push(`${price} ${t("common.egp")}${t("common.perHour")}`);

    return (
      <div
        onClick={onClick}
        data-card-shell=""
        className={`relative rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4 transition-all duration-200 ${
          interactive ? "cursor-pointer hover:bg-white/[0.07] hover:border-white/[0.15] active:scale-[0.99]" : ""
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar photo={coach.photo} name={coach.name} displayName={displayName} size="md" heartCount={hearts} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name row + heart */}
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h3 className="text-sm font-bold text-white/90 truncate">{displayName}</h3>
              {hearts > 0 && (
                <span className="flex items-center gap-1 shrink-0 text-rose-400/80">
                  <Heart size={12} className="fill-rose-400/80" />
                  <span className="text-xs font-medium">{hearts}</span>
                </span>
              )}
            </div>

            {/* Secondary name */}
            {secondaryName && (
              <p className="text-white/35 text-xs mb-2 truncate">{secondaryName}</p>
            )}

            {/* Tier badge */}
            <div className="mb-2">
              <TierBadge heartCount={hearts} />
            </div>

            {/* Stats line: experience · price */}
            {infoParts.length > 0 && (
              <p className="text-white/50 text-xs mb-1.5" dir="auto">
                {infoParts.join(" · ")}
              </p>
            )}

            {/* Areas */}
            {displayAreas.length > 0 && (
              <div className="flex items-center gap-1 text-white/30">
                <MapPin size={10} className="shrink-0" />
                <p className="text-[11px] truncate">{displayAreas.join(" · ")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── LG: Vertical card (profile & dashboard) ──
  return (
    <CardShell accentColor="#c8ff00" size="lg" interactive={interactive} onClick={onClick}>
      <div className="flex flex-col h-full p-4">
        {/* Avatar + Name */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-2">
          <Avatar photo={coach.photo} name={coach.name} displayName={displayName} size="lg" heartCount={hearts} />

          <div className="text-center">
            <p className="text-base font-bold text-white leading-tight">{displayName}</p>
            {secondaryName && (
              <p className="text-white/40 text-xs mt-0.5">{secondaryName}</p>
            )}
          </div>

          {/* Tier + hearts inline */}
          <div className="flex items-center gap-2">
            <TierBadge heartCount={hearts} />
            {hearts > 0 && (
              <span className="flex items-center gap-1 text-rose-400/70">
                <Heart size={11} className="fill-rose-400/70" />
                <span className="text-xs font-medium">{hearts}</span>
              </span>
            )}
          </div>

          {/* Price */}
          {price && (
            <p className="text-[#c8ff00] font-bold text-lg">
              {price} <span className="text-sm font-normal text-white/40">{t("common.egp")}{t("common.perHour")}</span>
            </p>
          )}
        </div>

        {/* Areas */}
        {displayAreas.length > 0 && (
          <div className="flex items-center justify-center gap-1 text-white/40 pt-2 border-t border-white/5">
            <MapPin size={11} />
            <p className="text-xs truncate">{displayAreas.join(" · ")}</p>
          </div>
        )}
      </div>
    </CardShell>
  );
}
