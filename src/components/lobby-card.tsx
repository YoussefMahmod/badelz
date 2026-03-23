"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation, useLocale } from "@/i18n";
import { formatDateShort, formatTime } from "@/lib/format";
import { darkBentoItem } from "@/lib/animations";

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
  const playerCount = lobby.playerCount ?? lobby.players?.length ?? 0;
  const spotsLeft = lobby.spotsLeft ?? (MAX_PLAYERS - playerCount);
  const isFull = spotsLeft <= 0;
  const dateStr = formatDateShort(lobby.date, locale === "ar" ? "ar-EG" : "en-US");

  return (
    <motion.div
      {...darkBentoItem}
      whileTap={{ scale: 0.97 }}
      onClick={() => router.push(`/lobby/${lobby.lobbyCode}`)}
      className="cursor-pointer rounded-2xl bg-white/5 border border-white/10 p-4 transition-all hover:border-[#c8ff00]/20 hover:shadow-[0_0_30px_rgba(200,255,0,0.08)]"
    >
      {/* Area name */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={14} className="shrink-0 text-white/40" />
          <h3 className="text-base font-bold text-white truncate">{areaName}</h3>
        </div>
        {lobby.priceRange && (
          <span className="shrink-0 text-sm font-bold text-[#c8ff00]">
            ~{lobby.priceRange} {locale === "ar" ? "ج.م" : "EGP"}
          </span>
        )}
      </div>

      {/* Date + time */}
      <div className="flex items-center gap-3 mb-3 text-white/55 text-xs">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{dateStr}</span>
        </div>
        {lobby.startTime && (
          <>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{formatTime(lobby.startTime)}</span>
            </div>
          </>
        )}
      </div>

      {/* Host name */}
      <p className="text-xs text-white/40 mb-3">
        {t("lobby.hostedBy", { name: lobby.hostName })}
      </p>

      {/* Bottom row: spots + player circles */}
      <div className="flex items-center justify-between">
        {/* Spots indicator */}
        <div className="flex items-center gap-1.5">
          {!isFull && (
            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-[#c8ff00]"
            />
          )}
          <span
            className={`text-xs font-semibold ${
              isFull ? "text-white/40" : "text-[#c8ff00]"
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
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  filled
                    ? "bg-[#c8ff00] text-[#111827]"
                    : "border border-dashed border-white/20 text-white/20"
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
    </motion.div>
  );
}
