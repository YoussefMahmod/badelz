"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { PlayerCard } from "@/components/cards/player-card";
import { EmptyState } from "@/components/empty-state";
import { useTranslation, useLocale } from "@/i18n";
import { AREAS } from "@/lib/constants";
import { staggerItem } from "@/lib/animations";

type PlayerTier = "BRONZE" | "SILVER" | "GOLD" | "DIAMOND" | "ELITE";

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
}

const TIER_FILTERS: { key: string; color: string }[] = [
  { key: "ALL", color: "rgba(255,255,255,0.5)" },
  { key: "BRONZE", color: "#cd7f32" },
  { key: "SILVER", color: "#c0c0c0" },
  { key: "GOLD", color: "#ffd700" },
  { key: "DIAMOND", color: "#00d4ff" },
  { key: "ELITE", color: "#c8ff00" },
];

export default function PlayersPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();

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

  const skeletons = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex justify-center">
          <div className="w-56 rounded-2xl overflow-hidden animate-pulse">
            <div className="card-ratio bg-white/5 border border-white/10 rounded-2xl">
              <div className="p-3 h-full flex flex-col">
                <div className="flex justify-between mb-3">
                  <div className="h-5 w-10 rounded-lg dark-skeleton" />
                  <div className="h-5 w-16 rounded-full dark-skeleton" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  <div className="w-16 h-16 rounded-full dark-skeleton" />
                  <div className="h-4 w-24 rounded-lg dark-skeleton" />
                  <div className="h-3 w-16 rounded-lg dark-skeleton" />
                </div>
                <div className="h-12 rounded-lg dark-skeleton mb-2" />
                <div className="h-3 w-20 mx-auto rounded-lg dark-skeleton" />
              </div>
            </div>
          </div>
        </div>
      )),
    []
  );

  return (
    <MainLayout showNav navType="public">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
            {t("player.leaderboard")}
          </h1>
          <p className="text-white/50 text-sm">
            {t("player.seeRanks")}
          </p>
        </motion.div>

        {/* Tier filter chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative flex gap-2 overflow-x-auto hide-scrollbar pb-4"
        >
          {TIER_FILTERS.map((tier) => {
            const isSelected = selectedTier === tier.key;
            return (
              <button
                key={tier.key}
                onClick={() => setSelectedTier(tier.key)}
                className="shrink-0 relative flex items-center rounded-full px-4 py-2.5 text-xs font-bold transition-all"
                style={
                  isSelected
                    ? {
                        backgroundColor: tier.color,
                        color: tier.key === "SILVER" || tier.key === "GOLD" || tier.key === "ALL"
                          ? "#111827"
                          : "#111827",
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

        {/* Area filter chips */}
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
                className={`shrink-0 relative flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "text-[#111827] shadow-sm"
                    : "border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="players-area-chip"
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

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
            {skeletons}
          </div>
        ) : players.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title={t("common.noResults")}
            description={t("player.noCard")}
          />
        ) : (
          <motion.div
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center"
          >
            <AnimatePresence mode="popLayout">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  {...staggerItem}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  layout
                  onClick={() => router.push(`/players/${player.id}`)}
                  className="cursor-pointer"
                >
                  <PlayerCard
                    player={{
                      name: player.name,
                      nameAr: player.nameAr,
                      area: player.area,
                      areaAr: player.areaAr,
                      gamesPlayed: player.gamesPlayed,
                      gamesWon: player.gamesWon,
                      rating: Number(player.rating),
                      tier: player.tier,
                      avatar: player.avatar,
                    }}
                    size="md"
                    interactive
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
