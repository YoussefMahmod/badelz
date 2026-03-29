"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Gamepad2,
  Trophy,
  Star,
  BarChart3,
  MapPin,
  CalendarDays,
  Share2,
  Search,
  Loader2,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { PlayerCard } from "@/components/cards/player-card";
import { AuthNudge } from "@/components/auth-nudge";
import { useTranslation, useLocale } from "@/i18n";
import { buildPlayerShareLink } from "@/lib/whatsapp";

type PlayerTier = "BRONZE" | "SILVER" | "GOLD" | "EMERALD" | "DIAMOND" | "MASTER" | "GRANDMASTER";

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
  EMERALD: "#50c878",
  DIAMOND: "#b9f2ff",
  MASTER: "#ff4655",
  GRANDMASTER: "#d4ff00",
};

export default function MyCardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
          <div className="w-72 card-ratio rounded-sm animate-pulse bg-[#1a1a1a] border border-[#333]" />
        </div>
      }
    >
      <MyCardContent />
    </Suspense>
  );
}

function MyCardContent() {
  const { t } = useTranslation();
  const { locale, dir } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState("");
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [initializing, setInitializing] = useState(true);

  const fetchPlayer = useCallback(async (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (!/^01[0125]\d{8}$/.test(cleaned)) {
      setError(locale === "ar" ? "رقم موبايل غلط" : "Invalid phone number");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch(`/api/players?phone=${cleaned}`);
      const json = await res.json();
      if (res.ok && json.data && json.data.id) {
        setPlayer(json.data);
        if (typeof window !== "undefined") {
          localStorage.setItem("badelz-player-phone", cleaned);
        }
      } else {
        setPlayer(null);
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  // On mount: check query param, then localStorage
  useEffect(() => {
    const queryPhone = searchParams.get("phone");
    if (queryPhone) {
      setPhone(queryPhone);
      fetchPlayer(queryPhone).finally(() => setInitializing(false));
      return;
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("badelz-player-phone");
      if (stored) {
        setPhone(stored);
        fetchPlayer(stored).finally(() => setInitializing(false));
        return;
      }
    }

    setInitializing(false);
  }, [searchParams, fetchPlayer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlayer(phone);
  };

  const winRate =
    player && player.gamesPlayed > 0
      ? Math.round((player.gamesWon / player.gamesPlayed) * 100)
      : 0;

  const tierLabel = player
    ? t(`player.${player.tier.toLowerCase()}` as "player.bronze")
    : "";

  const displayName =
    player && locale === "ar" && player.nameAr
      ? player.nameAr
      : player?.name ?? "";

  const area =
    player && locale === "ar" && player.areaAr
      ? player.areaAr
      : player?.area;

  const memberSince = player
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
      }).format(new Date(player.createdAt))
    : "";

  const tierColor = player ? TIER_COLORS[player.tier] : "#d4ff00";

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

  // Initializing state (checking localStorage/query)
  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-72 card-ratio rounded-sm animate-pulse bg-[#1a1a1a] border border-[#333]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-1/4 start-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ backgroundColor: tierColor }}
      />

      {/* Back button */}
      <div className="relative z-10 px-4 pt-4 flex justify-end">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-sm bg-[#1a1a1a] border border-[#333] px-4 py-2 text-sm text-[#999] hover:text-white hover:bg-[#222] transition-all"
          aria-label={t("common.back")}
        >
          {t("common.back")}
          <ArrowRight size={16} className={dir === "ltr" ? "rotate-180" : ""} />
        </button>
      </div>

      {/* Loading state while searching */}
      {loading && (
        <div className="flex flex-col items-center justify-center px-6 pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-sm bg-[#1a1a1a] border border-[#333]">
              <Loader2 size={28} className="text-[#d4ff00] animate-spin" />
            </div>
            <p className="text-[#999] text-sm">{t("player.searching")}</p>
          </motion.div>
        </div>
      )}

      {/* Phone input form (no card loaded, no search in progress) */}
      {!loading && !player && !searched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center px-6 pt-16 pb-8"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-sm bg-[#1a1a1a] border border-[#333]">
            <CreditCard size={36} className="text-[#d4ff00]" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            {t("player.myCard")}
          </h1>
          <p className="text-[#999] text-sm text-center mb-8 max-w-xs">
            {t("player.findYourCard")}
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <input
              type="tel"
              inputMode="numeric"
              dir="ltr"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-sm bg-[#1a1a1a] border border-[#333] px-5 py-4 text-center text-lg text-white placeholder-white/30 outline-none focus:border-[#d4ff00]/40  transition-all font-[family-name:var(--font-display)]"
              maxLength={11}
              aria-label={t("player.enterPhone")}
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-xs text-red-400"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              
              className="w-full rounded-sm bg-[#d4ff00] py-4 text-base font-bold text-[#0d0d0d] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer active:scale-[0.97] transition-transform duration-75"
            >
              <Search size={18} />
              {t("player.searchCard")}
            </button>
          </form>
        </motion.div>
      )}

      {/* Phone input form (searched but not found) */}
      {!loading && !player && searched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center px-6 pt-16 pb-8"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-sm bg-[#1a1a1a] border border-[#333]">
            <Gamepad2 size={36} className="text-[#666]" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            {t("player.noCardYet")}
          </h2>
          <p className="text-[#999] text-sm text-center mb-8 max-w-xs">
            {t("player.noCardYetDesc")}
          </p>

          <Link
            href="/play"
            className="rounded-sm bg-[#d4ff00] px-8 py-3.5 text-sm font-bold text-[#0d0d0d] transition-all active:scale-[0.98] mb-6"
          >
            {t("player.noCardYetDesc")}
          </Link>

          {/* Try another number */}
          <button
            onClick={() => {
              setSearched(false);
              setPlayer(null);
              setPhone("");
            }}
            className="text-sm text-[#999] hover:text-[#999] transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white/60 cursor-pointer font-medium"
          >
            {t("player.findCard")}
          </button>
        </motion.div>
      )}

      {/* Card found */}
      {!loading && player && (
        <>
          {/* Hero card with float animation */}
          <div
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
          </div>

          {/* Stats section */}
          <div
            className="relative z-10 mx-auto max-w-md px-4 pb-6"
          >
            <div className="bg-[#0d0d0d]/80 border border-[#333] rounded-sm p-5">
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
              <div className="border-t border-[#222] pt-4 space-y-2.5">
                {area && (
                  <div className="flex items-center gap-2 text-[#999] text-sm">
                    <MapPin size={14} className="shrink-0" />
                    <span>{area}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[#999] text-sm">
                  <CalendarDays size={14} className="shrink-0" />
                  <span>
                    {t("player.memberSince")} {memberSince}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Share button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 mx-auto max-w-md px-4 pb-4"
          >
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 rounded-sm bg-[#d4ff00] py-3.5 text-sm font-bold text-[#0d0d0d] transition-all active:scale-[0.98]"
            >
              <Share2 size={18} />
              {t("player.shareCard")}
            </button>
          </motion.div>

          {/* Auth nudge for anonymous users */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="relative z-10 mx-auto max-w-md px-4 pb-4"
          >
            <AuthNudge
              title={t("nudge.claimCard")}
              description={t("nudge.claimCardDesc")}
              returnTo="/my-profile"
              prefillPhone={phone}
              prefillRole="PLAYER"
              variant="dark"
            />
          </motion.div>

          {/* View leaderboard link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative z-10 mx-auto max-w-md px-4 pb-16"
          >
            <Link
              href="/players"
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-[#333] py-3 text-sm font-semibold text-[#999] hover:text-white hover:bg-[#1a1a1a] hover:border-white/25 transition-all cursor-pointer"
            >
              {t("player.viewRanks")}
            </Link>
          </motion.div>
        </>
      )}
    </div>
  );
}

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
    <div className="flex items-center gap-3 rounded-sm bg-[#1a1a1a] p-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[#666] text-[10px] uppercase tracking-wide truncate">
          {label}
        </p>
        <p className="text-white font-bold text-base font-[family-name:var(--font-display)]">
          {value}
        </p>
      </div>
    </div>
  );
}
