"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, Crown, Gamepad2, Sparkles } from "lucide-react";
import Link from "next/link";
import { MainLayout } from "@/components/main-layout";
import { PlayerCard } from "@/components/cards/player-card";
import { EmptyState } from "@/components/empty-state";
import { useTranslation, useLocale } from "@/i18n";
import { AREAS } from "@/lib/constants";
import {
  fadeIn,
  slideUp,
  scaleIn,
  staggerDarkBento,
  darkBentoItem,
} from "@/lib/animations";

/* ─── Tier system ─── */

type PlayerTier =
  | "BRONZE"
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
  { key: "GOLD", color: "#ffd700" },
  { key: "EMERALD", color: "#50c878" },
  { key: "DIAMOND", color: "#b9f2ff" },
  { key: "MASTER", color: "#ff4655" },
  { key: "GRANDMASTER", color: "#c8ff00" },
];

const TIER_COLORS: Record<string, string> = {
  BRONZE: "#cd7f32",
  GOLD: "#ffd700",
  EMERALD: "#50c878",
  DIAMOND: "#b9f2ff",
  MASTER: "#ff4655",
  GRANDMASTER: "#c8ff00",
};

/* Rank badge colors for the podium */
const RANK_BADGE_COLORS = [
  { bg: "#ffd700", text: "#111827" }, // #1 gold
  { bg: "#c0c0c0", text: "#111827" }, // #2 silver
  { bg: "#cd7f32", text: "#111827" }, // #3 bronze
];

/* ─── Helpers ─── */

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ─── Sub-components ─── */

function PodiumRankBadge({ rank }: { rank: number }) {
  const colors = RANK_BADGE_COLORS[rank - 1];
  if (!colors) return null;

  return (
    <div
      className="absolute -top-3 start-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black shadow-lg"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {rank === 1 && <Crown size={12} />}
      <span>{rank}</span>
    </div>
  );
}

function ListAvatar({
  src,
  name,
  tierColor,
}: {
  src?: string | null;
  name: string;
  tierColor: string;
}) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 overflow-hidden shrink-0"
      style={{
        borderColor: tierColor,
        backgroundColor: `${tierColor}15`,
        color: tierColor,
      }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  );
}

function ListTierBadge({ tier, label }: { tier: string; label: string }) {
  const color = TIER_COLORS[tier] ?? "rgba(255,255,255,0.5)";
  const isHighTier = tier === "MASTER" || tier === "GRANDMASTER";

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0"
      style={{
        backgroundColor: `${color}20`,
        color,
        boxShadow: isHighTier ? `0 0 8px ${color}30` : undefined,
      }}
    >
      {isHighTier && <Sparkles size={8} />}
      {label}
    </span>
  );
}

/* ─── Skeleton components ─── */

function PodiumSkeleton() {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 md:gap-8 py-8">
      {/* #2 skeleton */}
      <div className="order-2 md:order-1 md:mt-12">
        <div className="w-56 card-ratio rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
      </div>
      {/* #1 skeleton */}
      <div className="order-1 md:order-2">
        <div className="w-72 card-ratio rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
      </div>
      {/* #3 skeleton */}
      <div className="order-3 md:mt-12">
        <div className="w-56 card-ratio rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
      </div>
    </div>
  );
}

function ListRowSkeleton({ index }: { index: number }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.03] animate-pulse"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="w-8 h-5 rounded dark-skeleton" />
      <div className="w-10 h-10 rounded-full dark-skeleton shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-28 rounded dark-skeleton" />
        <div className="h-3 w-16 rounded dark-skeleton" />
      </div>
      <div className="h-4 w-12 rounded dark-skeleton" />
      <div className="h-5 w-16 rounded-full dark-skeleton" />
    </div>
  );
}

/* ─── Main page ─── */

export default function PlayersPage() {
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

  /* Derived data */
  const showPodium = selectedTier === "ALL";
  const podiumPlayers = useMemo(
    () => (showPodium ? players.slice(0, 3) : []),
    [players, showPodium]
  );
  const listPlayers = useMemo(
    () => (showPodium ? players.slice(3) : players),
    [players, showPodium]
  );
  const listStartRank = showPodium ? 4 : 1;

  const getTierLabel = (key: string) => {
    if (key === "ALL") return t("player.allTiers");
    return t(`player.${key.toLowerCase()}` as "player.bronze");
  };

  const getDisplayName = (player: PlayerData) =>
    locale === "ar" && player.nameAr ? player.nameAr : player.name;

  const getArea = (player: PlayerData) =>
    locale === "ar" && player.areaAr ? player.areaAr : player.area;

  return (
    <MainLayout showNav navType="public">
      <div className="mx-auto max-w-4xl px-4 py-6 pb-28">
        {/* ── Header ── */}
        <motion.div {...slideUp} className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white/90 mb-1">
            {t("player.leaderboard")}
          </h1>
          <p className="text-white/50 text-sm">{t("player.seeRanks")}</p>
        </motion.div>

        {/* ── Tier filter pills ── */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.1 }}
          className="relative flex gap-2 overflow-x-auto hide-scrollbar pb-3"
        >
          {TIER_FILTERS.map((tier) => {
            const isSelected = selectedTier === tier.key;
            return (
              <button
                key={tier.key}
                onClick={() => setSelectedTier(tier.key)}
                className="shrink-0 relative flex items-center rounded-full px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
                style={
                  isSelected
                    ? {
                        backgroundColor: tier.color,
                        color: "#111827",
                        boxShadow: `0 0 16px ${tier.color}40`,
                      }
                    : {
                        border: `1.5px solid ${tier.color}40`,
                        color: tier.color,
                      }
                }
              >
                {getTierLabel(tier.key)}
              </button>
            );
          })}
        </motion.div>

        {/* ── Area filter pills ── */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.2 }}
          className="relative flex gap-2 overflow-x-auto hide-scrollbar pb-6"
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
                    layoutId="players-area-chip"
                    className="absolute inset-0 rounded-full bg-[#c8ff00]"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
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

        {/* ── Content ── */}
        {loading ? (
          <>
            <PodiumSkeleton />
            <div className="space-y-2 mt-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ListRowSkeleton key={i} index={i} />
              ))}
            </div>
          </>
        ) : players.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title={t("common.noResults")}
            description={t("player.noCard")}
          />
        ) : (
          <>
            {/* ── Podium ── */}
            {showPodium && podiumPlayers.length > 0 && (
              <motion.div
                {...scaleIn}
                className="relative mb-10"
              >
                {/* Ambient glow behind #1 */}
                {podiumPlayers[0] && (
                  <div
                    className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${
                        TIER_COLORS[podiumPlayers[0].tier] ?? "#c8ff00"
                      }20 0%, transparent 70%)`,
                      filter: "blur(80px)",
                    }}
                  />
                )}

                {/* Mobile layout: #1 on top (large), #2 and #3 side by side below */}
                <div className="flex flex-col items-center gap-6 md:hidden">
                  {/* #1 */}
                  {podiumPlayers[0] && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    >
                      <Link
                        href={`/players/${podiumPlayers[0].id}`}
                        className="relative block cursor-pointer"
                      >
                        <PodiumRankBadge rank={1} />
                        <PlayerCard
                          player={{
                            name: podiumPlayers[0].name,
                            nameAr: podiumPlayers[0].nameAr,
                            area: podiumPlayers[0].area,
                            areaAr: podiumPlayers[0].areaAr,
                            gamesPlayed: podiumPlayers[0].gamesPlayed,
                            gamesWon: podiumPlayers[0].gamesWon,
                            rating: Number(podiumPlayers[0].rating),
                            tier: podiumPlayers[0].tier as "BRONZE" | "GOLD" | "DIAMOND",
                            avatar: podiumPlayers[0].avatar,
                          }}
                          size="lg"
                          interactive
                        />
                      </Link>
                    </motion.div>
                  )}

                  {/* #2 and #3 side by side */}
                  <div className="flex gap-4 justify-center">
                    {podiumPlayers[1] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Link
                          href={`/players/${podiumPlayers[1].id}`}
                          className="relative block cursor-pointer"
                        >
                          <PodiumRankBadge rank={2} />
                          <PlayerCard
                            player={{
                              name: podiumPlayers[1].name,
                              nameAr: podiumPlayers[1].nameAr,
                              area: podiumPlayers[1].area,
                              areaAr: podiumPlayers[1].areaAr,
                              gamesPlayed: podiumPlayers[1].gamesPlayed,
                              gamesWon: podiumPlayers[1].gamesWon,
                              rating: Number(podiumPlayers[1].rating),
                              tier: podiumPlayers[1].tier as "BRONZE" | "GOLD" | "DIAMOND",
                              avatar: podiumPlayers[1].avatar,
                            }}
                            size="md"
                            interactive
                          />
                        </Link>
                      </motion.div>
                    )}

                    {podiumPlayers[2] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.45 }}
                      >
                        <Link
                          href={`/players/${podiumPlayers[2].id}`}
                          className="relative block cursor-pointer"
                        >
                          <PodiumRankBadge rank={3} />
                          <PlayerCard
                            player={{
                              name: podiumPlayers[2].name,
                              nameAr: podiumPlayers[2].nameAr,
                              area: podiumPlayers[2].area,
                              areaAr: podiumPlayers[2].areaAr,
                              gamesPlayed: podiumPlayers[2].gamesPlayed,
                              gamesWon: podiumPlayers[2].gamesWon,
                              rating: Number(podiumPlayers[2].rating),
                              tier: podiumPlayers[2].tier as "BRONZE" | "GOLD" | "DIAMOND",
                              avatar: podiumPlayers[2].avatar,
                            }}
                            size="md"
                            interactive
                          />
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Desktop layout: #2, #1 (elevated), #3 in a row */}
                <div className="hidden md:flex items-end justify-center gap-8">
                  {/* #2 — lower */}
                  {podiumPlayers[1] && (
                    <motion.div
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-12"
                    >
                      <Link
                        href={`/players/${podiumPlayers[1].id}`}
                        className="relative block cursor-pointer"
                      >
                        <PodiumRankBadge rank={2} />
                        <PlayerCard
                          player={{
                            name: podiumPlayers[1].name,
                            nameAr: podiumPlayers[1].nameAr,
                            area: podiumPlayers[1].area,
                            areaAr: podiumPlayers[1].areaAr,
                            gamesPlayed: podiumPlayers[1].gamesPlayed,
                            gamesWon: podiumPlayers[1].gamesWon,
                            rating: Number(podiumPlayers[1].rating),
                            tier: podiumPlayers[1].tier as "BRONZE" | "GOLD" | "DIAMOND",
                            avatar: podiumPlayers[1].avatar,
                          }}
                          size="md"
                          interactive
                        />
                      </Link>
                    </motion.div>
                  )}

                  {/* #1 — elevated */}
                  {podiumPlayers[0] && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    >
                      <Link
                        href={`/players/${podiumPlayers[0].id}`}
                        className="relative block cursor-pointer"
                      >
                        <PodiumRankBadge rank={1} />
                        <PlayerCard
                          player={{
                            name: podiumPlayers[0].name,
                            nameAr: podiumPlayers[0].nameAr,
                            area: podiumPlayers[0].area,
                            areaAr: podiumPlayers[0].areaAr,
                            gamesPlayed: podiumPlayers[0].gamesPlayed,
                            gamesWon: podiumPlayers[0].gamesWon,
                            rating: Number(podiumPlayers[0].rating),
                            tier: podiumPlayers[0].tier as "BRONZE" | "GOLD" | "DIAMOND",
                            avatar: podiumPlayers[0].avatar,
                          }}
                          size="lg"
                          interactive
                        />
                      </Link>
                    </motion.div>
                  )}

                  {/* #3 — lower */}
                  {podiumPlayers[2] && (
                    <motion.div
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.45 }}
                      className="mt-12"
                    >
                      <Link
                        href={`/players/${podiumPlayers[2].id}`}
                        className="relative block cursor-pointer"
                      >
                        <PodiumRankBadge rank={3} />
                        <PlayerCard
                          player={{
                            name: podiumPlayers[2].name,
                            nameAr: podiumPlayers[2].nameAr,
                            area: podiumPlayers[2].area,
                            areaAr: podiumPlayers[2].areaAr,
                            gamesPlayed: podiumPlayers[2].gamesPlayed,
                            gamesWon: podiumPlayers[2].gamesWon,
                            rating: Number(podiumPlayers[2].rating),
                            tier: podiumPlayers[2].tier as "BRONZE" | "GOLD" | "DIAMOND",
                            avatar: podiumPlayers[2].avatar,
                          }}
                          size="md"
                          interactive
                        />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Ranked list ── */}
            {listPlayers.length > 0 && (
              <motion.div
                variants={staggerDarkBento}
                initial="initial"
                animate="animate"
                className="space-y-1.5"
              >
                <AnimatePresence mode="popLayout">
                  {listPlayers.map((player, index) => {
                    const rank = listStartRank + index;
                    const isTopTen = rank <= 10;
                    const tierColor =
                      TIER_COLORS[player.tier] ?? "rgba(255,255,255,0.5)";
                    const displayName = getDisplayName(player);
                    const area = getArea(player);

                    return (
                      <motion.div
                        key={player.id}
                        variants={darkBentoItem}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.03,
                        }}
                        layout
                      >
                        <Link
                          href={`/players/${player.id}`}
                          className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.03] border-b border-white/5 hover:bg-white/[0.06] transition-all duration-200 cursor-pointer group"
                        >
                          {/* Rank number */}
                          <span
                            className="w-8 text-center font-black text-sm tabular-nums shrink-0 font-[family-name:var(--font-display)]"
                            style={{
                              color: isTopTen ? "#c8ff00" : "rgba(255,255,255,0.3)",
                            }}
                          >
                            {rank}
                          </span>

                          {/* Avatar */}
                          <ListAvatar
                            src={player.avatar}
                            name={player.name}
                            tierColor={tierColor}
                          />

                          {/* Name + Area */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white/90 font-semibold text-sm truncate group-hover:text-white transition-colors">
                              {displayName}
                            </p>
                            {area && (
                              <p className="text-white/30 text-xs flex items-center gap-1 mt-0.5">
                                <MapPin size={10} className="shrink-0" />
                                <span className="truncate">{area}</span>
                              </p>
                            )}
                          </div>

                          {/* Games count */}
                          <div className="flex items-center gap-1.5 text-white/40 shrink-0">
                            <Gamepad2 size={13} />
                            <span className="text-xs font-semibold tabular-nums">
                              {player.gamesPlayed}
                            </span>
                          </div>

                          {/* Tier badge */}
                          <ListTierBadge
                            tier={player.tier}
                            label={getTierLabel(player.tier)}
                          />
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
