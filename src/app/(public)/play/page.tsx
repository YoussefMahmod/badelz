"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, Users, Crown, Gauge, Zap, MapPin, Navigation, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { LobbyCard } from "@/components/lobby-card";
import { useTranslation, useLocale } from "@/i18n";
import { AREAS, LOBBY_LEVELS } from "@/lib/constants";
import { getNext7Days, toDateString, formatDateShort, formatTime } from "@/lib/format";
import { getNearestArea, haversine } from "@/lib/geolocation";
import { getPlayerPreferences, setPlayerPreferences } from "@/lib/player-preferences";
import { buildPlayBroadcastLink } from "@/lib/whatsapp";

const MAX_PLAYERS = 4;

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
  level?: string | null;
  hostName: string;
  status: "OPEN" | "FULL" | "CANCELLED" | "EXPIRED";
  players: LobbyPlayer[];
  playerCount?: number;
  spotsLeft?: number;
}

export default function PlayPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [allLobbies, setAllLobbies] = useState<LobbyData[]>([]);
  const [loading, setLoading] = useState(true);

  // Location state
  const [detectedArea, setDetectedArea] = useState<string | null>(null);
  const [showLocationToast, setShowLocationToast] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const locationDetected = useRef(false);

  const next7Days = useMemo(() => getNext7Days(), []);
  const todayStr = useMemo(() => toDateString(new Date()), []);

  // Read deep link params and preferences on mount
  useEffect(() => {
    const urlArea = searchParams.get("area");
    const urlDate = searchParams.get("date");

    if (urlArea) {
      const validArea = AREAS.find((a) => a.key === urlArea);
      if (validArea) setSelectedArea(urlArea);
    }
    if (urlDate) {
      setSelectedDate(urlDate);
    }

    // Load saved preferences if no URL params
    if (!urlArea) {
      const prefs = getPlayerPreferences();
      if (prefs.detectedArea) {
        setDetectedArea(prefs.detectedArea);
      }
    }
  }, [searchParams]);

  // Auto-detect location on first visit
  useEffect(() => {
    if (locationDetected.current) return;
    locationDetected.current = true;

    const prefs = getPlayerPreferences();
    if (prefs.detectedArea) {
      setDetectedArea(prefs.detectedArea);
      return;
    }

    getNearestArea().then((area) => {
      if (area) {
        setDetectedArea(area);
        setShowLocationToast(true);
        setPlayerPreferences({ detectedArea: area });
      }
    });
  }, []);

  // Fetch lobbies
  const fetchLobbies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedArea !== "all") params.set("area", selectedArea);
      if (selectedLevel) params.set("level", selectedLevel);
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
  }, [selectedArea, selectedLevel, selectedDate]);

  // Fetch all lobbies count (for "X lobbies in other areas" message)
  const fetchAllLobbies = useCallback(async () => {
    if (selectedArea === "all") return;
    try {
      const res = await fetch("/api/lobbies?limit=50");
      const json = await res.json();
      if (res.ok && json.data) {
        setAllLobbies(json.data);
      }
    } catch {
      // silent
    }
  }, [selectedArea]);

  useEffect(() => {
    fetchLobbies();
  }, [fetchLobbies]);

  useEffect(() => {
    if (selectedArea !== "all" && lobbies.length === 0 && !loading) {
      fetchAllLobbies();
    }
  }, [selectedArea, lobbies.length, loading, fetchAllLobbies]);

  // Sort lobbies by proximity when we have a detected area
  const sortedLobbies = useMemo(() => {
    if (!detectedArea || selectedArea !== "all") return lobbies;

    const targetArea = AREAS.find((a) => a.key === detectedArea);
    if (!targetArea) return lobbies;

    return [...lobbies].sort((a, b) => {
      const areaA = AREAS.find((ar) => ar.key === a.area);
      const areaB = AREAS.find((ar) => ar.key === b.area);
      if (!areaA || !areaB) return 0;

      const distA = haversine(targetArea.lat, targetArea.lng, areaA.lat, areaA.lng);
      const distB = haversine(targetArea.lat, targetArea.lng, areaB.lat, areaB.lng);
      return distA - distB;
    });
  }, [lobbies, detectedArea, selectedArea]);

  // Hot lobbies: 3/4 players, today or tomorrow
  const hotLobbies = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = toDateString(tomorrow);

    return sortedLobbies.filter((l) => {
      const count = l.playerCount ?? l.players?.length ?? 0;
      const spots = l.spotsLeft ?? (MAX_PLAYERS - count);
      return spots === 1 && (l.date === todayStr || l.date === tomorrowStr);
    });
  }, [sortedLobbies, todayStr]);

  // Other lobbies count in different areas
  const otherAreasCount = useMemo(() => {
    if (selectedArea === "all") return 0;
    return allLobbies.filter((l) => l.area !== selectedArea).length;
  }, [allLobbies, selectedArea]);

  // Handle Near Me chip tap
  const handleNearMe = async () => {
    setDetectingLocation(true);
    const area = await getNearestArea();
    setDetectingLocation(false);
    if (area) {
      setDetectedArea(area);
      setSelectedArea(area);
      setPlayerPreferences({ detectedArea: area });
      setShowLocationToast(false);
    }
  };

  // Handle Quick Match tap
  const handleQuickMatch = async () => {
    setSelectedDate(todayStr);
    setSelectedLevel(null);

    if (detectedArea) {
      setSelectedArea(detectedArea);
    } else {
      setDetectingLocation(true);
      const area = await getNearestArea();
      setDetectingLocation(false);
      if (area) {
        setDetectedArea(area);
        setSelectedArea(area);
        setPlayerPreferences({ detectedArea: area });
      }
    }
  };

  const formatDayChip = (date: Date) => {
    const dayName = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
      weekday: "short",
    }).format(date);
    const dayNum = date.getDate();
    return { dayName, dayNum };
  };

  const getAreaLabel = (key: string) => {
    const area = AREAS.find((a) => a.key === key);
    if (!area) return key;
    return locale === "ar" ? area.labelAr : area.labelEn;
  };

  const skeletons = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-sm overflow-hidden animate-pulse bg-[#1a1a1a] border border-[#333] p-4"
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

        {/* Location Detection Toast */}
        {showLocationToast && detectedArea && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-sm bg-[#222] border border-[#333] px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <Navigation size={14} className="shrink-0 text-[#d4ff00]" />
              <span className="text-sm text-[#999] truncate">
                {t("nearMe.detected", { area: getAreaLabel(detectedArea) })}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedArea(detectedArea);
                setShowLocationToast(false);
              }}
              className="shrink-0 text-sm font-bold text-[#d4ff00] active:scale-[0.97] transition-transform duration-75 cursor-pointer"
            >
              {t("nearMe.showNearby")}
            </button>
          </div>
        )}

        {/* Quick Match Hero */}
        <div className="mb-5 rounded-sm bg-[#1a1a1a] border-s-[3px] border-s-[#d4ff00] p-5">
          <h2 className="text-xl font-bold text-white mb-1">
            {t("quickMatch.title")}
          </h2>
          <p className="text-sm text-[#999] mb-4">
            {t("quickMatch.subtitle")}
          </p>
          <button
            onClick={handleQuickMatch}
            disabled={detectingLocation}
            className="w-full flex items-center justify-center gap-2 rounded-sm bg-[#d4ff00] py-3.5 text-sm font-bold text-[#0d0d0d] active:scale-[0.97] transition-transform duration-75 cursor-pointer disabled:opacity-60"
          >
            <Zap size={18} strokeWidth={2.5} />
            {detectingLocation ? t("nearMe.detecting") : t("quickMatch.button")}
          </button>
        </div>

        {/* Hot Lobbies */}
        {hotLobbies.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-[#ff4d4d] animate-pulse" />
              <h3 className="text-sm font-bold text-white">
                {t("hotLobbies.title")} 🔥
              </h3>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {hotLobbies.map((lobby) => {
                const areaName = locale === "ar" && lobby.areaAr ? lobby.areaAr : lobby.area;
                const dateStr = formatDateShort(lobby.date, locale === "ar" ? "ar-EG" : "en-US");
                const levelObj = lobby.level ? LOBBY_LEVELS.find((l) => l.key === lobby.level) : null;
                const levelLabel = levelObj ? (locale === "ar" ? levelObj.labelAr : levelObj.labelEn) : null;
                const playerCount = lobby.playerCount ?? lobby.players?.length ?? 0;

                return (
                  <Link
                    key={lobby.lobbyCode}
                    href={`/lobby/${lobby.lobbyCode}`}
                    className="shrink-0 w-[200px] rounded-sm bg-[#1a1a1a] border-s-[3px] border-s-[#ff4d4d] p-3 active:scale-[0.97] transition-transform duration-75"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white truncate">{areaName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#999] mb-2">
                      <Calendar size={10} />
                      <span>{dateStr}</span>
                      {lobby.startTime && (
                        <>
                          <span className="text-[#333]">|</span>
                          <Clock size={10} />
                          <span>{formatTime(lobby.startTime)}</span>
                        </>
                      )}
                    </div>
                    {levelLabel && (
                      <span className="inline-flex items-center gap-0.5 rounded-sm bg-[#222] px-2 py-0.5 text-[10px] font-semibold text-[#999] mb-2">
                        <Gauge size={10} />
                        {levelLabel}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: MAX_PLAYERS }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              i < playerCount
                                ? "bg-[#d4ff00] text-[#0d0d0d]"
                                : "border border-dashed border-[#333] text-[#666]"
                            }`}
                          >
                            {i < playerCount ? "✓" : "?"}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#ff4d4d] animate-pulse" />
                      <span className="text-xs font-semibold text-[#ff4d4d]">
                        {t("hotLobbies.need1")}
                      </span>
                      {lobby.priceRange && (
                        <span className="ms-auto text-xs font-bold text-[#d4ff00]">
                          ~{lobby.priceRange} {locale === "ar" ? "ج.م" : "EGP"}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Date chips */}
        <div className="relative flex gap-2 overflow-x-auto hide-scrollbar pb-4">
          <button
            onClick={() => setSelectedDate(null)}
            className={`shrink-0 relative flex flex-col items-center rounded-sm px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              selectedDate === null
                ? "bg-[#d4ff00] text-[#0d0d0d] shadow-sm"
                : "border border-[#333] text-[#999] hover:text-white hover:bg-[#222]"
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
                className={`shrink-0 relative flex flex-col items-center rounded-sm px-4 py-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#d4ff00] text-[#0d0d0d] shadow-sm"
                    : "border border-[#333] text-[#999] hover:text-white hover:bg-[#222]"
                }`}
              >
                <span className="text-[10px] font-medium">{dayName}</span>
                <span className="text-base font-bold">{dayNum}</span>
              </button>
            );
          })}
        </div>

        {/* Area chips */}
        <div className="relative flex gap-2 overflow-x-auto hide-scrollbar pb-5">
          {/* All areas chip */}
          <button
            onClick={() => setSelectedArea("all")}
            className={`shrink-0 relative flex items-center gap-1.5 rounded-sm px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              selectedArea === "all"
                ? "bg-[#d4ff00] text-[#0d0d0d] shadow-sm"
                : "border border-[#333] text-[#999] hover:text-white hover:bg-[#222]"
            }`}
          >
            {locale === "ar" ? "كل المناطق" : "All Areas"}
          </button>

          {/* Near Me chip */}
          <button
            onClick={handleNearMe}
            disabled={detectingLocation}
            className={`shrink-0 relative flex items-center gap-1.5 rounded-sm px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              detectingLocation
                ? "border border-[#d4ff00]/30 text-[#d4ff00]/50"
                : "border border-[#d4ff00]/30 text-[#d4ff00] hover:bg-[#d4ff00]/10"
            }`}
          >
            <Navigation size={12} />
            {detectingLocation ? t("nearMe.detecting") : t("nearMe.chipLabel")}
          </button>

          {/* Area chips */}
          {AREAS.filter((a) => a.key !== "all").map((area) => {
            const isSelected = selectedArea === area.key;
            const label = locale === "ar" ? area.labelAr : area.labelEn;
            return (
              <button
                key={area.key}
                onClick={() => setSelectedArea(area.key)}
                className={`shrink-0 relative flex items-center gap-1.5 rounded-sm px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#d4ff00] text-[#0d0d0d] shadow-sm"
                    : "border border-[#333] text-[#999] hover:text-white hover:bg-[#222]"
                }`}
              >
                <MapPin size={12} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Level filter chips */}
        <div className="relative flex gap-2 overflow-x-auto hide-scrollbar pb-5">
          <button
            onClick={() => setSelectedLevel(null)}
            className={`shrink-0 relative flex items-center gap-1.5 rounded-sm px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              selectedLevel === null
                ? "bg-[#d4ff00] text-[#0d0d0d] shadow-sm"
                : "border border-[#333] text-[#999] hover:text-white hover:bg-[#222]"
            }`}
          >
            <Gauge size={12} />
            {t("lobby.anyLevel")}
          </button>

          {LOBBY_LEVELS.map((lvl) => {
            const isSelected = selectedLevel === lvl.key;
            const label = locale === "ar" ? lvl.labelAr : lvl.labelEn;
            return (
              <button
                key={lvl.key}
                onClick={() => setSelectedLevel(isSelected ? null : lvl.key)}
                className={`shrink-0 relative flex items-center gap-1.5 rounded-sm px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#d4ff00] text-[#0d0d0d] shadow-sm"
                    : "border border-[#333] text-[#999] hover:text-white hover:bg-[#222]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Player ranks link */}
        <div className="mb-5">
          <Link
            href="/players"
            className="flex items-center gap-3 rounded-sm bg-[#1a1a1a] border border-[#333] px-4 py-3 transition-all hover:bg-[#1a1a1a] hover:border-[#d4ff00]/20 group cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#d4ff00]/10">
              <Crown size={18} className="text-[#d4ff00]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                {t("player.viewRanks")}
              </p>
              <p className="text-xs text-[#666]">
                {t("player.seeRanks")}
              </p>
            </div>
            <div className="text-[#666] group-hover:text-[#d4ff00] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {skeletons}
          </div>
        ) : sortedLobbies.length === 0 ? (
          /* Enhanced Empty State */
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-sm bg-[#1a1a1a] border border-[#333] text-[#666]">
              <Users size={28} />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-[#999]">
              {selectedArea !== "all"
                ? t("quickMatch.noResults", { area: getAreaLabel(selectedArea) })
                : t("lobby.noLobbies")}
            </h3>
            {otherAreasCount > 0 && selectedArea !== "all" && (
              <p className="mb-4 text-sm text-[#666]">
                {t("quickMatch.noResultsOther", { count: otherAreasCount })}
              </p>
            )}
            {!otherAreasCount && (
              <p className="mb-6 max-w-xs text-sm text-[#666]">
                {t("lobby.noLobbiesDesc")}
              </p>
            )}
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={() => router.push("/play/create")}
                className="w-full rounded-sm bg-[#d4ff00] px-6 py-3 text-sm font-bold text-[#0d0d0d] cursor-pointer active:scale-[0.97] transition-transform duration-75"
              >
                {selectedArea !== "all"
                  ? t("quickMatch.createInArea", { area: getAreaLabel(selectedArea) })
                  : t("lobby.createLobby")}
              </button>
              {selectedArea !== "all" && otherAreasCount > 0 && (
                <button
                  onClick={() => setSelectedArea("all")}
                  className="w-full rounded-sm border border-[#333] px-6 py-3 text-sm font-semibold text-[#999] cursor-pointer active:scale-[0.97] transition-transform duration-75 hover:text-white hover:bg-[#222]"
                >
                  {t("quickMatch.showAll")}
                </button>
              )}
              {/* WhatsApp Broadcast */}
              <a
                href={buildPlayBroadcastLink({
                  area: selectedArea !== "all" ? selectedArea : detectedArea || undefined,
                  areaAr: selectedArea !== "all"
                    ? AREAS.find((a) => a.key === selectedArea)?.labelAr
                    : detectedArea
                      ? AREAS.find((a) => a.key === detectedArea)?.labelAr
                      : undefined,
                  date: selectedDate || todayStr,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-sm bg-[#25D366] px-6 py-3 text-sm font-bold text-white cursor-pointer active:scale-[0.97] transition-transform duration-75"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t("quickMatch.shareWhatsApp")}
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-[#999] mb-3">
              {t("lobby.openCount", { count: sortedLobbies.length })}
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {sortedLobbies.map((lobby) => (
                  <LobbyCard key={lobby.lobbyCode} lobby={lobby} />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Floating create CTA */}
      <Link
        href="/play/create"
        className="fixed bottom-24 end-4 z-40 flex items-center gap-2 rounded-sm bg-[#d4ff00] px-5 py-3.5 text-sm font-bold text-[#0d0d0d] transition-all active:scale-95"
      >
        <Plus size={18} strokeWidth={2.5} />
        {t("lobby.createLobby")}
      </Link>
    </MainLayout>
  );
}
