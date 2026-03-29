"use client";

import Image from "next/image";
import { Heart, MapPin, Sparkles } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
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
  isPioneerCoach?: boolean;
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
      className="bg-[#222] text-[#999] border border-[#333] text-[10px] font-semibold px-2 py-0.5 rounded-sm"
    >
      {t(config.labelKey as Parameters<typeof t>[0])}
    </span>
  );
}

function PioneerCoachBadge() {
  const { t } = useTranslation();
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-sm inline-flex items-center gap-1 bg-[#ffd700]/12 text-[#ffd700] border border-[#ffd700]/25"
    >
      <Sparkles size={9} className="text-[#ffd700]" />
      {t("coach.pioneerCoach")}
    </span>
  );
}

function Avatar({
  photo,
  name,
  displayName,
  size,
}: {
  photo?: string | null;
  name: string;
  displayName: string;
  size: "sm" | "md" | "lg";
  heartCount?: number;
}) {
  const sizes = { sm: 40, md: 48, lg: 80 };
  const fontSize = { sm: "text-xs", md: "text-sm", lg: "text-lg" };

  const dim = sizes[size];

  return (
    <div
      className={`relative shrink-0 rounded-full flex items-center justify-center font-bold overflow-hidden border-2 border-[#333] ${fontSize[size]}`}
      style={{
        width: dim,
        height: dim,
        background: "#222",
        color: "#d4ff00",
      }}
    >
      {photo ? (
        <Image src={photo} alt={displayName} fill sizes="64px" className="rounded-full object-cover" />
      ) : (
        getInitials(name)
      )}
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
      <div
        onClick={onClick}
        className="relative w-28 h-[156px] shrink-0 rounded-sm bg-[#1a1a1a] border-t-[3px] border-t-[#00c2ff] overflow-hidden cursor-pointer transition-colors duration-200 hover:bg-[#222] active:scale-[0.97] transition-transform duration-75"
      >
        <div className="flex flex-col items-center justify-center h-full p-2 gap-1.5">
          <Avatar photo={coach.photo} name={coach.name} displayName={displayName} size="sm" />
          <p className="text-white font-bold text-xs text-center leading-tight line-clamp-1">
            {displayName}
          </p>
          <TierBadge heartCount={hearts} />
          {coach.isPioneerCoach && <PioneerCoachBadge />}
          {price && (
            <p className="text-[10px] font-bold text-[#d4ff00] font-[family-name:var(--font-display-en)]">{price} {t("common.egp")}</p>
          )}
        </div>
      </div>
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
        className={`relative rounded-sm bg-[#1a1a1a] border-t-[3px] border-t-[#00c2ff] p-4 transition-colors duration-200 ${
          interactive ? "cursor-pointer hover:bg-[#222] active:scale-[0.97] transition-transform duration-75" : ""
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar photo={coach.photo} name={coach.name} displayName={displayName} size="md" />

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name row + heart */}
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h3 className="text-sm font-bold text-white truncate">{displayName}</h3>
              {hearts > 0 && (
                <span className="flex items-center gap-1 shrink-0 text-rose-400">
                  <Heart size={12} className="fill-rose-400" />
                  <span className="text-xs font-medium">{hearts}</span>
                </span>
              )}
            </div>

            {/* Secondary name */}
            {secondaryName && (
              <p className="text-[#666] text-xs mb-2 truncate">{secondaryName}</p>
            )}

            {/* Tier badge */}
            <div className="flex items-center gap-2 mb-2">
              <TierBadge heartCount={hearts} />
              {coach.isPioneerCoach && <PioneerCoachBadge />}
            </div>

            {/* Stats line: experience · price */}
            {infoParts.length > 0 && (
              <p className="text-[#999] text-xs mb-1.5" dir="auto">
                {infoParts.join(" · ")}
              </p>
            )}

            {/* Areas */}
            {displayAreas.length > 0 && (
              <div className="flex items-center gap-1 text-[#666]">
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
    <div
      onClick={interactive ? onClick : undefined}
      className={`relative rounded-sm bg-[#1a1a1a] border-t-[3px] border-t-[#00c2ff] ${
        interactive ? "cursor-pointer hover:bg-[#222] active:scale-[0.97] transition-transform duration-75" : ""
      }`}
    >
      <div className="flex flex-col h-full p-4">
        {/* Avatar + Name */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-2">
          <Avatar photo={coach.photo} name={coach.name} displayName={displayName} size="lg" />

          <div className="text-center">
            <p className="text-base font-bold text-white leading-tight">{displayName}</p>
            {secondaryName && (
              <p className="text-[#666] text-xs mt-0.5">{secondaryName}</p>
            )}
          </div>

          {/* Tier + hearts inline */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <TierBadge heartCount={hearts} />
            {coach.isPioneerCoach && <PioneerCoachBadge />}
            {hearts > 0 && (
              <span className="flex items-center gap-1 text-rose-400">
                <Heart size={11} className="fill-rose-400" />
                <span className="text-xs font-medium">{hearts}</span>
              </span>
            )}
          </div>

          {/* Price */}
          {price && (
            <p className="text-[#d4ff00] font-bold text-lg font-[family-name:var(--font-display-en)]">
              {price} <span className="text-sm font-normal text-[#666]">{t("common.egp")}{t("common.perHour")}</span>
            </p>
          )}
        </div>

        {/* Areas */}
        {displayAreas.length > 0 && (
          <div className="flex items-center justify-center gap-1 text-[#666] pt-2 border-t border-[#222]">
            <MapPin size={11} />
            <p className="text-xs truncate">{displayAreas.join(" · ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
