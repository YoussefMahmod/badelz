"use client";

import { Star, Clock, Banknote } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { CardShell } from "./card-shell";

interface CoachData {
  id: string;
  name: string;
  nameAr?: string | null;
  photo?: string | null;
  areas: string[];
  areasAr?: string[];
  pricePerHour?: number | string | null;
  experience?: string | null;
  rating?: number | string;
}

interface CoachCardProps {
  coach: CoachData;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
}

const AVATAR_SIZE = {
  sm: "w-10 h-10 text-xs",
  md: "w-16 h-16 text-base",
  lg: "w-20 h-20 text-lg",
} as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

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

  if (size === "sm") {
    return (
      <CardShell accentColor="#c8ff00" size="sm" interactive={interactive} onClick={onClick}>
        <div className="flex flex-col items-center justify-center h-full p-2 gap-1.5">
          {/* Pro badge */}
          <span className="bg-[#c8ff00] text-[#111827] text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
            {t("coach.proCoach")}
          </span>

          {/* Avatar */}
          <div
            className={`${AVATAR_SIZE.sm} rounded-full flex items-center justify-center font-bold border-2 border-[#c8ff00]`}
            style={{ backgroundColor: "rgba(200,255,0,0.1)", color: "#c8ff00" }}
          >
            {coach.photo ? (
              <img
                src={coach.photo}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(coach.name)
            )}
          </div>

          {/* Name */}
          <p className="text-white font-bold text-xs text-center leading-tight line-clamp-1">
            {displayName}
          </p>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell accentColor="#c8ff00" size={size} interactive={interactive} onClick={onClick}>
      <div className="flex flex-col h-full p-3">
        {/* Pro badge */}
        <div className="flex justify-center mb-1">
          <span className="bg-[#c8ff00] text-[#111827] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {t("coach.proCoach")}
          </span>
        </div>

        {/* Avatar + Name */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-1">
          <div
            className={`${AVATAR_SIZE[size]} rounded-full flex items-center justify-center font-bold border-2 border-[#c8ff00]`}
            style={{ backgroundColor: "rgba(200,255,0,0.1)", color: "#c8ff00" }}
          >
            {coach.photo ? (
              <img
                src={coach.photo}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(coach.name)
            )}
          </div>

          <div className="text-center">
            <p className={`text-white font-bold leading-tight ${size === "lg" ? "text-base" : "text-sm"}`}>
              {displayName}
            </p>
            {secondaryName && (
              <p className="text-white/40 text-xs mt-0.5">{secondaryName}</p>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="card-stat-bar rounded-lg mb-2">
          {coach.experience && (
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wide flex items-center justify-center gap-0.5">
                <Clock size={8} />
                {t("coach.yearsExp")}
              </p>
              <p className="text-white font-bold text-sm font-[family-name:var(--font-display)]">
                {coach.experience}
              </p>
            </div>
          )}
          {coach.rating != null && (
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wide flex items-center justify-center gap-0.5">
                <Star size={8} />
                {t("player.rating")}
              </p>
              <p className="text-white font-bold text-sm font-[family-name:var(--font-display)]">
                {coach.rating}
              </p>
            </div>
          )}
          {coach.pricePerHour != null && (
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wide flex items-center justify-center gap-0.5">
                <Banknote size={8} />
                {t("common.perHour")}
              </p>
              <p className="text-[#c8ff00] font-bold text-sm font-[family-name:var(--font-display)]">
                {coach.pricePerHour}
              </p>
            </div>
          )}
        </div>

        {/* Areas */}
        {displayAreas.length > 0 && (
          <p className="text-white/40 text-xs text-center line-clamp-1">
            {displayAreas.join(" \u00B7 ")}
          </p>
        )}
      </div>
    </CardShell>
  );
}
