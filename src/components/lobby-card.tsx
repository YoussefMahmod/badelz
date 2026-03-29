"use client";

import { MapPin, Calendar, Clock, Users, Gauge } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation, useLocale } from "@/i18n";
import { formatDateShort, formatTime } from "@/lib/format";
import { LOBBY_LEVELS } from "@/lib/constants";

const MAX_PLAYERS = 4;

interface LobbyPlayer {
  position: number;
  playerName: string;
}

interface LobbyCardProps {
  lobby: {
    lobbyCode: string;
    area: string;
    areaAr?: string | null;
    date: string;
    startTime?: string | null;
    priceRange?: string | null;
    level?: string | null;
    hostName: string;
    status: "OPEN" | "FULL" | "CANCELLED" | "EXPIRED";
    players?: LobbyPlayer[];
    playerCount?: number;
    spotsLeft?: number;
  };
}

export function LobbyCard({ lobby }: LobbyCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();

  const areaName = locale === "ar" && lobby.areaAr ? lobby.areaAr : lobby.area;
  const levelObj = lobby.level ? LOBBY_LEVELS.find((l) => l.key === lobby.level) : null;
  const levelLabel = levelObj ? (locale === "ar" ? levelObj.labelAr : levelObj.labelEn) : null;
  const playerCount = lobby.playerCount ?? lobby.players?.length ?? 0;
  const spotsLeft = lobby.spotsLeft ?? (MAX_PLAYERS - playerCount);
  const isFull = spotsLeft <= 0;
  const dateStr = formatDateShort(lobby.date, locale === "ar" ? "ar-EG" : "en-US");

  return (
    <div
      onClick={() => router.push(`/lobby/${lobby.lobbyCode}`)}
      className="cursor-pointer rounded-sm bg-[#1a1a1a] border-s-[3px] border-s-[#ff4d4d] p-3 transition-colors duration-200 hover:bg-[#222] active:scale-[0.97] transition-transform duration-75"
    >
      {/* Area name + level badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={14} className="shrink-0 text-[#666]" />
          <h3 className="text-sm font-bold text-white truncate">{areaName}</h3>
          {levelLabel && (
            <span className="shrink-0 flex items-center gap-0.5 rounded-sm bg-[#222] px-2 py-0.5 text-[10px] font-semibold text-[#999]">
              <Gauge size={10} />
              {levelLabel}
            </span>
          )}
        </div>
        {lobby.priceRange && (
          <span className="shrink-0 text-sm font-bold text-[#d4ff00] font-[family-name:var(--font-display-en)]">
            ~{lobby.priceRange} {locale === "ar" ? "ج.م" : "EGP"}
          </span>
        )}
      </div>

      {/* Date + time */}
      <div className="flex items-center gap-2.5 mb-2 text-[#999] text-xs">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{dateStr}</span>
        </div>
        {lobby.startTime && (
          <>
            <div className="h-3 w-px bg-[#333]" />
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{formatTime(lobby.startTime)}</span>
            </div>
          </>
        )}
      </div>

      {/* Host name */}
      <p className="text-xs text-[#666] mb-2">
        {t("lobby.hostedBy", { name: lobby.hostName })}
      </p>

      {/* Bottom row: spots + player circles */}
      <div className="flex items-center justify-between">
        {/* Spots indicator */}
        <div className="flex items-center gap-1.5">
          {!isFull && (
            <div className="h-2 w-2 rounded-full bg-[#ff4d4d] animate-pulse" />
          )}
          <span
            className={`text-xs font-semibold font-[family-name:var(--font-display-en)] ${
              isFull ? "text-[#666]" : "text-[#ff4d4d]"
            }`}
          >
            {isFull
              ? t("lobby.full")
              : t("lobby.spotsLeft", { count: spotsLeft })}
          </span>
        </div>

        {/* Player circles */}
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_PLAYERS }).map((_, i) => {
            const filled = i < playerCount;
            const player = lobby.players?.[i];
            return (
              <div
                key={i}
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  filled
                    ? "bg-[#ff4d4d] text-[#0d0d0d]"
                    : "border border-dashed border-[#333] text-[#666]"
                }`}
              >
                {filled
                  ? (player?.playerName?.charAt(0).toUpperCase() ?? "✓")
                  : "?"}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
