"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Gamepad2, Trophy, Star, BarChart3, MapPin, CalendarDays, Share2, Search, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { PlayerCard } from "@/components/cards/player-card";
import { useTranslation, useLocale } from "@/i18n";
import { buildPlayerShareLink } from "@/lib/whatsapp";
import { scaleInGlow, slideUp } from "@/lib/animations";

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
  createdAt: string;
}

const TIER_COLORS: Record<PlayerTier, string> = {
  BRONZE: "#cd7f32",
  SILVER: "#c0c0c0",
  GOLD: "#ffd700",
  DIAMOND: "#00d4ff",
  ELITE: "#c8ff00",
};

export default function PlayerProfilePage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Phone lookup state
  const [phone, setPhone] = useState("");
  const [phoneSearching, setPhoneSearching] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const fetchPlayer = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/players/${id}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setPlayer(json.data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

  const winRate =
    player && player.gamesPlayed > 0
      ? Math.round((player.gamesWon / player.gamesPlayed) * 100)
      : 0;

  const tierLabel = player
    ? t(`player.${player.tier.toLowerCase()}` as "player.bronze")
    : "";

  const displayName =
    player && locale === "ar" && player.nameAr ? player.nameAr : player?.name ?? "";

  const area =
    player && locale === "ar" && player.areaAr ? player.areaAr : player?.area;

  const memberSince = player
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
      }).format(new Date(player.createdAt))
    : "";

  const handleShare = () => {
    if (!player) return;
    const link = buildPlayerShareLink({
      id: player.id,
      name: displayName,
      tier: tierLabel,
      gamesPlayed: player.gamesPlayed,
    });
    window.open(link, "_blank");
  };

  const handlePhoneSearch = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (!/^01[0125]\d{8}$/.test(cleaned)) {
      setPhoneError(locale === "ar" ? "رقم موبايل غلط" : "Invalid phone number");
      return;
    }

    setPhoneSearching(true);
    setPhoneError("");
    try {
      const res = await fetch(`/api/players?phone=${cleaned}`);
      const json = await res.json();
      if (res.ok && json.data && json.data.id) {
        router.push(`/players/${json.data.id}`);
      } else {
        setPhoneError(t("player.noCard"));
      }
    } catch {
      setPhoneError(t("common.error"));
    } finally {
      setPhoneSearching(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="w-72 card-ratio rounded-2xl animate-pulse bg-white/5 border border-white/10" />
      </div>
    );
  }

  // Error / not found state
  if (error || !player) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40">
          <Gamepad2 size={28} />
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">
          {t("common.noResults")}
        </h2>
        <p className="text-white/50 text-sm mb-6">{t("player.noCard")}</p>
        <button
          onClick={() => router.push("/players")}
          className="rounded-full bg-[#c8ff00] px-6 py-2.5 text-sm font-bold text-[#111827] transition-all hover:shadow-[0_0_20px_rgba(200,255,0,0.2)]"
        >
          {t("player.leaderboard")}
        </button>
      </div>
    );
  }

  const tierColor = TIER_COLORS[player.tier];

  return (
    <div className="min-h-screen gradient-mesh relative overflow-hidden">
      {/* Ambient glow behind the card */}
      <div
        className="absolute top-1/4 start-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ backgroundColor: tierColor }}
      />

      {/* Back button */}
      <div className="relative z-10 px-4 pt-4 flex justify-end">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          {t("common.back")}
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Hero card */}
      <motion.div
        {...scaleInGlow}
        className="flex justify-center px-4 pt-4 pb-8"
      >
        <div className="animate-float-slow">
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
            size="lg"
            interactive
          />
        </div>
      </motion.div>

      {/* Stats section */}
      <motion.div
        {...slideUp}
        className="relative z-10 mx-auto max-w-md px-4 pb-6"
      >
        <div className="glass-dark rounded-2xl p-5">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <StatItem
              icon={<Gamepad2 size={16} />}
              label={t("player.gamesPlayed")}
              value={String(player.gamesPlayed)}
              color={tierColor}
            />
          </div>

          {/* Tier badge */}
          <div className="flex items-center justify-center mb-4">
            <span
              className="rounded-full px-4 py-1.5 text-sm font-bold"
              style={{
                backgroundColor: `${tierColor}20`,
                color: tierColor,
                border: `1.5px solid ${tierColor}40`,
              }}
            >
              {tierLabel}
            </span>
          </div>

          {/* Area + member since */}
          <div className="border-t border-white/5 pt-4 space-y-2.5">
            {area && (
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <MapPin size={14} className="shrink-0" />
                <span>{area}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <CalendarDays size={14} className="shrink-0" />
              <span>
                {t("player.memberSince")} {memberSince}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 mx-auto max-w-md px-4 pb-6"
      >
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-[#c8ff00] py-3.5 text-sm font-bold text-[#111827] shadow-lg shadow-[#c8ff00]/20 transition-all hover:shadow-[0_0_30px_rgba(200,255,0,0.3)] active:scale-[0.98]"
        >
          <Share2 size={18} />
          {t("player.shareCard")}
        </button>
      </motion.div>

      {/* Phone lookup section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 mx-auto max-w-md px-4 pb-16"
      >
        <div className="glass-dark rounded-2xl p-5">
          <p className="text-white/60 text-sm text-center mb-1">
            {t("player.findCard")}
          </p>
          <p className="text-white/30 text-xs text-center mb-4">
            {t("player.enterPhone")}
          </p>

          <div className="flex gap-2">
            <input
              type="tel"
              inputMode="numeric"
              dir="ltr"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePhoneSearch();
              }}
              placeholder="01XXXXXXXXX"
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#c8ff00]/40 focus:ring-1 focus:ring-[#c8ff00]/20 transition-all"
              maxLength={11}
              aria-label={t("player.enterPhone")}
            />
            <button
              onClick={handlePhoneSearch}
              disabled={phoneSearching}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/15 hover:text-white transition-all disabled:opacity-50"
            >
              {phoneSearching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              <span className="hidden sm:inline">
                {phoneSearching ? t("player.searching") : t("player.searchCard")}
              </span>
            </button>
          </div>

          {phoneError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-center text-xs text-red-400"
            >
              {phoneError}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/** Small stat item for the stats grid */
function StatItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-white/40 text-[10px] uppercase tracking-wide truncate">
          {label}
        </p>
        <p className="text-white font-bold text-base font-[family-name:var(--font-display)]">
          {value}
        </p>
      </div>
    </div>
  );
}
