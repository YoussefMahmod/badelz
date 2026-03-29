"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Users, MapPin, Crown } from "lucide-react";
import Link from "next/link";
import { MainLayout } from "@/components/main-layout";
import { EmptyState } from "@/components/empty-state";
import { useTranslation, useLocale } from "@/i18n";
import { AREAS } from "@/lib/constants";

/* ─── Tier system ─── */

type PlayerTier =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "EMERALD"
  | "DIAMOND"
  | "MASTER"
  | "GRANDMASTER";

interface PlayerData {
  id: string;
  name: string;
  nameAr?: string | null;
  phone: string;
  area?: string | null;
  areaAr?: string | null;
  avatar?: string | null;
  gamesPlayed: number;
  gamesWon: number;
  rating: number | string;
  tier: PlayerTier;
  createdAt: string;
}

const TIER_FILTERS: { key: string; color: string }[] = [
  { key: "ALL", color: "rgba(255,255,255,0.5)" },
  { key: "BRONZE", color: "#cd7f32" },
  { key: "SILVER", color: "#c0c0c0" },
  { key: "GOLD", color: "#ffd700" },
  { key: "EMERALD", color: "#50c878" },
  { key: "DIAMOND", color: "#b9f2ff" },
  { key: "MASTER", color: "#ff4655" },
  { key: "GRANDMASTER", color: "#d4ff00" },
];

const TIER_COLORS: Record<string, string> = {
  BRONZE: "#cd7f32",
  SILVER: "#c0c0c0",
  GOLD: "#ffd700",
  EMERALD: "#50c878",
  DIAMOND: "#b9f2ff",
  MASTER: "#ff4655",
  GRANDMASTER: "#d4ff00",
};

/* ─── Skeleton ─── */

function TableSkeleton() {
  return (
    <>
      <div className="grid grid-cols-[40px_44px_1fr_60px_70px] gap-1.5 px-4 py-2.5 bg-[#111] border-b-2 border-[#222] items-center">
        <div className="h-2 w-8 bg-[#222] mx-auto" />
        <div />
        <div className="h-2 w-16 bg-[#222]" />
        <div className="h-2 w-8 bg-[#222] mx-auto" />
        <div className="h-2 w-10 bg-[#222] mx-auto" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[40px_44px_1fr_60px_70px] gap-1.5 px-4 py-3 items-center border-b-2 border-[#161616] animate-pulse">
          <div className="h-5 w-5 bg-[#222] mx-auto rounded" />
          <div className="h-10 w-10 bg-[#222] rounded-full mx-auto" />
          <div className="space-y-1">
            <div className="h-3 w-24 bg-[#222] rounded" />
            <div className="h-2 w-16 bg-[#1a1a1a] rounded" />
          </div>
          <div className="h-4 w-6 bg-[#222] mx-auto rounded" />
          <div className="h-3 w-10 bg-[#222] mx-auto rounded" />
        </div>
      ))}
    </>
  );
}

/* ─── Main page ─── */

export default function PlayersClient() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const [selectedTier, setSelectedTier] = useState("ALL");
  const [selectedArea, setSelectedArea] = useState("all");
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTier !== "ALL") params.set("tier", selectedTier);
      if (selectedArea !== "all") params.set("area", selectedArea);
      params.set("limit", "40");

      const res = await fetch(`/api/players?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setPlayers(Array.isArray(json.data) ? json.data : []);
      } else {
        setPlayers([]);
      }
    } catch {
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTier, selectedArea]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const getTierLabel = (key: string) => {
    if (key === "ALL") return t("player.allTiers");
    return t(`player.${key.toLowerCase()}` as "player.bronze");
  };

  const maxGames = players[0]?.gamesPlayed || 1;

  return (
    <MainLayout showNav navType="public">
      <div className="mx-auto max-w-2xl pb-28 overflow-x-hidden">
        {/* ── Title block ── */}
        <div className="bg-[#111] px-5 py-5 border-b-[3px] border-b-[#d4ff00] text-center">
          <h1 className="font-[family-name:var(--font-display-en)] text-2xl uppercase tracking-wide">
            {t("player.leaderboard")}
          </h1>
          <p className="text-[#666] text-xs mt-1">{t("player.seeRanks")}</p>
        </div>

        {/* ── Tier filter pills ── */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-3">
          {TIER_FILTERS.map((tier) => {
            const isSelected = selectedTier === tier.key;
            return (
              <button
                key={tier.key}
                onClick={() => setSelectedTier(tier.key)}
                className="shrink-0 rounded-sm px-4 py-2.5 text-xs font-bold cursor-pointer active:scale-[0.97] transition-transform duration-75"
                style={
                  isSelected
                    ? { backgroundColor: tier.color, color: "#0d0d0d" }
                    : { border: `1.5px solid ${tier.color}40`, color: tier.color }
                }
              >
                {getTierLabel(tier.key)}
              </button>
            );
          })}
        </div>

        {/* ── Area filter pills ── */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 pb-4">
          {AREAS.map((area) => {
            const isSelected = selectedArea === area.key;
            const label = locale === "ar" ? area.labelAr : area.labelEn;
            return (
              <button
                key={area.key}
                onClick={() => setSelectedArea(area.key)}
                className={`shrink-0 flex items-center gap-1.5 rounded-sm px-4 py-2.5 text-xs font-semibold cursor-pointer active:scale-[0.97] transition-transform duration-75 ${
                  isSelected
                    ? "bg-[#d4ff00] text-[#0d0d0d]"
                    : "border border-[#333] text-[#999]"
                }`}
              >
                {area.key !== "all" && <MapPin size={12} />}
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <TableSkeleton />
        ) : players.length === 0 ? (
          <div className="px-4">
            <EmptyState
              icon={<Users size={28} />}
              title={t("common.noResults")}
              description={t("player.noCard")}
            />
          </div>
        ) : (
          <>
            {/* ── Table header ── */}
            <div className="grid grid-cols-[40px_44px_1fr_60px_70px] gap-1.5 px-4 py-2.5 bg-[#111] border-b-2 border-[#222] items-center">
              <span className="text-[9px] font-bold text-[#555] uppercase tracking-widest text-center">
                {locale === "ar" ? "#" : "RANK"}
              </span>
              <span />
              <span className="text-[9px] font-bold text-[#555] uppercase tracking-widest">
                {locale === "ar" ? "اللاعب" : "PLAYER"}
              </span>
              <span className="text-[9px] font-bold text-[#555] uppercase tracking-widest text-center">
                {locale === "ar" ? "ماتشات" : "GAMES"}
              </span>
              <span className="text-[9px] font-bold text-[#555] uppercase tracking-widest text-center">
                {locale === "ar" ? "المستوى" : "TIER"}
              </span>
            </div>

            {/* ── Player rows ── */}
            {players.map((player, i) => {
              const rank = i + 1;
              const tierColor = TIER_COLORS[player.tier] ?? "#9ca3af";
              const name = locale === "ar" && player.nameAr ? player.nameAr : player.name;
              const area = locale === "ar" && player.areaAr ? player.areaAr : player.area;
              const initials = player.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

              return (
                <Link
                  key={player.id || player.phone}
                  href={`/players/${player.id}`}
                  className={`grid grid-cols-[40px_44px_1fr_60px_70px] gap-1.5 px-4 py-3 items-center border-b-2 active:scale-[0.98] transition-transform duration-75 cursor-pointer ${
                    rank === 1 ? "bg-[#111] border-b-[#ffd700]" :
                    rank === 2 ? "bg-[#0f0f0f] border-b-[#c0c0c050]" :
                    rank === 3 ? "bg-[#0f0f0f] border-b-[#cd7f3250]" :
                    "bg-[#0d0d0d] border-b-[#161616]"
                  }`}
                >
                  {/* Rank */}
                  <div className="text-center">
                    {rank === 1 && <Crown size={14} className="mx-auto mb-0.5 text-[#ffd700]" />}
                    <span
                      className="font-[family-name:var(--font-display-en)] text-xl"
                      style={{
                        color: rank === 1 ? "#ffd700" : rank === 2 ? "#c0c0c0" : rank === 3 ? "#cd7f32" : rank <= 10 ? "#d4ff00" : "#444"
                      }}
                    >
                      {rank}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 overflow-hidden"
                    style={{ borderColor: tierColor, background: `${tierColor}10`, color: tierColor }}
                  >
                    {player.avatar ? (
                      <Image src={player.avatar} alt={name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* Name + Area */}
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#eee] truncate">{name}</p>
                    {area && (
                      <p className="text-[9px] text-[#555] truncate flex items-center gap-0.5">
                        <MapPin size={8} />
                        {area}
                      </p>
                    )}
                  </div>

                  {/* Games */}
                  <span className="font-[family-name:var(--font-display-en)] text-base text-center text-[#d4ff00]">
                    {player.gamesPlayed}
                  </span>

                  {/* Tier + Progress bar */}
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="text-[7px] font-extrabold uppercase tracking-wide px-1.5 py-0.5"
                      style={{ background: `${tierColor}20`, color: tierColor }}
                    >
                      {player.tier}
                    </span>
                    <div className="w-full h-[3px] bg-[#222] relative overflow-hidden">
                      <div
                        className="absolute top-0 end-0 h-full"
                        style={{
                          width: `${Math.max((player.gamesPlayed / maxGames) * 100, 1)}%`,
                          background: tierColor,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </MainLayout>
  );
}
