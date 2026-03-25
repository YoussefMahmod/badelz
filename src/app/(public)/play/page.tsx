"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { LobbyCard } from "@/components/lobby-card";
import { EmptyState } from "@/components/empty-state";
import { useTranslation, useLocale } from "@/i18n";
import { AREAS } from "@/lib/constants";
import { getNext7Days, toDateString } from "@/lib/format";
import { revealUp } from "@/lib/animations";
import { MapPin } from "lucide-react";

interface LobbyPlayer {
  position: number;
  playerName: string;
}

interface LobbyData {
  lobbyCode: string;
  area: string;
  areaAr?: string | null;
  date: string;
  startTime?: string | null;
  priceRange?: string | null;
  hostName: string;
  status: "OPEN" | "FULL" | "CANCELLED" | "EXPIRED";
  players: LobbyPlayer[];
}

export default function PlayPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();

  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [loading, setLoading] = useState(true);

  const next7Days = useMemo(() => getNext7Days(), []);

  const fetchLobbies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedArea !== "all") params.set("area", selectedArea);
      if (selectedDate) params.set("date", selectedDate);

      const res = await fetch(`/api/lobbies?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setLobbies(json.data);
      } else {
        setLobbies([]);
      }
    } catch {
      setLobbies([]);
    } finally {
      setLoading(false);
    }
  }, [selectedArea, selectedDate]);

  useEffect(() => {
    fetchLobbies();
  }, [fetchLobbies]);

  const formatDayChip = (date: Date) => {
    const dayName = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
      weekday: "short",
    }).format(date);
    const dayNum = date.getDate();
    return { dayName, dayNum };
  };

  const skeletons = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden animate-pulse bg-white/5 border border-white/10 p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="h-5 w-2/3 rounded-lg dark-skeleton" />
            <div className="h-4 w-16 rounded-lg dark-skeleton" />
          </div>
          <div className="h-3 w-1/2 rounded-lg dark-skeleton mb-3" />
          <div className="h-3 w-1/3 rounded-lg dark-skeleton mb-3" />
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded-lg dark-skeleton" />
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-6 w-6 rounded-full dark-skeleton" />
              ))}
            </div>
          </div>
        </div>
      )),
    []
  );

  return (
    <MainLayout showNav navType="public">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold text-white mb-6"
        >
          {t("lobby.title")}
        </motion.h1>

        {/* Date chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative flex gap-2 overflow-x-auto hide-scrollbar pb-4"
        >
          {/* "All" chip */}
          <button
            onClick={() => setSelectedDate(null)}
            className={`shrink-0 relative flex flex-col items-center rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              selectedDate === null
                ? "bg-[#c8ff00] text-[#111827] shadow-sm"
                : "border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10"
            }`}
          >
            <span className="text-[10px]">&nbsp;</span>
            <span>{t("lobby.allDates")}</span>
          </button>

          {next7Days.map((date) => {
            const dateStr = toDateString(date);
            const isSelected = selectedDate === dateStr;
            const { dayName, dayNum } = formatDayChip(date);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`shrink-0 relative flex flex-col items-center rounded-2xl px-4 py-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#c8ff00] text-[#111827] shadow-sm"
                    : "border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10"
                }`}
              >
                <span className="text-[10px] font-medium">{dayName}</span>
                <span className="text-base font-bold">{dayNum}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Area chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative flex gap-2 overflow-x-auto hide-scrollbar pb-5"
        >
          {AREAS.map((area) => {
            const isSelected = selectedArea === area.key;
            const label = locale === "ar" ? area.labelAr : area.labelEn;
            return (
              <button
                key={area.key}
                onClick={() => setSelectedArea(area.key)}
                className={`shrink-0 relative flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "text-[#111827] shadow-sm"
                    : "border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="lobby-area-chip"
                    className="absolute inset-0 rounded-full bg-[#c8ff00]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {area.key !== "all" && <MapPin size={12} />}
                  {label}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Player ranks link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-5"
        >
          <Link
            href="/players"
            className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 transition-all hover:bg-white/8 hover:border-[#c8ff00]/20 group cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c8ff00]/10">
              <Crown size={18} className="text-[#c8ff00]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white/90">
                {t("player.viewRanks")}
              </p>
              <p className="text-xs text-white/40">
                {t("player.seeRanks")}
              </p>
            </div>
            <div className="text-white/30 group-hover:text-[#c8ff00] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {skeletons}
          </div>
        ) : lobbies.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title={t("lobby.noLobbies")}
            description={t("lobby.noLobbiesDesc")}
            action={{
              label: t("lobby.createLobby"),
              onClick: () => router.push("/play/create"),
            }}
          />
        ) : (
          <motion.div
            {...revealUp}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {lobbies.map((lobby) => (
                <LobbyCard key={lobby.lobbyCode} lobby={lobby} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Floating create CTA */}
      <Link
        href="/play/create"
        className="fixed bottom-24 end-4 z-40 flex items-center gap-2 rounded-full bg-[#c8ff00] px-5 py-3.5 text-sm font-bold text-[#111827] shadow-lg shadow-[#c8ff00]/20 transition-all hover:shadow-[0_0_30px_rgba(200,255,0,0.3)] active:scale-95"
      >
        <Plus size={18} strokeWidth={2.5} />
        {t("lobby.createLobby")}
      </Link>
    </MainLayout>
  );
}
