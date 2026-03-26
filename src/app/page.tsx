"use client";

import { useState, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  Users,
  GraduationCap,
  ShoppingBag,
  Flame,
  MapPin,
  Calendar,
  Trophy,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { useAuth } from "@/lib/auth-context";
import { useTranslation, useLocale } from "@/i18n";
import { ListingCard, type ListingData } from "@/components/cards/listing-card";
import { CoachCard } from "@/components/cards/coach-card";
import { FeatureTour } from "@/components/feature-tour";
import { PLAYER_TIER_COLORS } from "@/lib/constants";

/* ─── Types ─── */
interface Venue {
  id: string;
  name: string;
  nameAr?: string | null;
  city: string;
  cityAr?: string | null;
  coverPhoto?: string | null;
  courts?: { pricePerHour: number | string }[];
}

interface Lobby {
  id: string;
  lobbyCode: string;
  area: string;
  areaAr?: string | null;
  date: string;
  players?: { id: string }[];
}

interface Coach {
  id: string;
  name: string;
  nameAr?: string | null;
  photo?: string | null;
  areas?: string[];
  areasAr?: string[];
  pricePerHour?: number | string | null;
  heartCount?: number;
}

interface Player {
  id: string;
  name: string;
  phone?: string;
  tier: string;
  gamesPlayed: number;
}

/* ─── Reusable Section Wrapper ─── */
function FeedSection({
  title,
  icon,
  href,
  liveIndicator,
  children,
}: {
  title: string;
  icon: ReactNode;
  href: string;
  liveIndicator?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-bold text-white/80">{title}</h2>
          {liveIndicator && (
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
        <Link
          href={href}
          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          {t("discover.seeAll")}
          <ArrowUpRight size={12} />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
        {children}
      </div>
    </motion.div>
  );
}

/* ─── Section Skeleton ─── */
function SectionSkeleton({ width = "w-56", height = "h-36" }: { width?: string; height?: string }) {
  return (
    <div className="mb-8">
      <div className="h-5 w-32 rounded bg-white/5 mb-3 animate-pulse" />
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`shrink-0 ${width} ${height} rounded-2xl bg-white/5 animate-pulse`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Discover Page ─── */
export default function DiscoverPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user } = useAuth();
  const router = useRouter();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [trending, setTrending] = useState<ListingData[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/venues?limit=6").then((r) => r.json()),
      fetch("/api/lobbies?area=all&limit=6").then((r) => r.json()),
      fetch("/api/market?trending=true").then((r) => r.json()),
      fetch("/api/coaches?limit=6&sort=newest").then((r) => r.json()),
      fetch("/api/players?limit=3").then((r) => r.json()),
    ]).then(([venuesRes, lobbiesRes, trendingRes, coachesRes, playersRes]) => {
      if (venuesRes.status === "fulfilled") setVenues(venuesRes.value.data || []);
      if (lobbiesRes.status === "fulfilled") setLobbies(lobbiesRes.value.data || []);
      if (trendingRes.status === "fulfilled") setTrending(trendingRes.value.data || []);
      if (coachesRes.status === "fulfilled") setCoaches(coachesRes.value.data || []);
      if (playersRes.status === "fulfilled") setPlayers(playersRes.value.data || []);
      setLoading(false);
    });
  }, []);

  const stagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <MainLayout navType="public">
      <FeatureTour />
      <div className="max-w-lg mx-auto px-4 pt-4 pb-28">
        {/* ─── Header ─── */}
        <motion.div className="mb-6" variants={fadeUp} initial="hidden" animate="show">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} className="text-emerald-400" />
            <h1 className="text-2xl font-bold text-white/90">
              {user
                ? t("discover.greeting", { name: user.name?.split(" ")[0] || "" })
                : t("nav.discover")}
            </h1>
          </div>
          {!user && (
            <p className="text-sm text-white/40">{t("discover.subtitle")}</p>
          )}
        </motion.div>

        {/* ─── Quick Actions ─── */}
        <motion.div
          className="flex gap-2.5 mb-8 overflow-x-auto scrollbar-hide"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.05 }}
        >
          <Link
            href="/browse"
            className="shrink-0 flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/15 transition-colors"
          >
            <Search size={16} />
            {t("discover.bookCourt")}
          </Link>
          <Link
            href="/play"
            className="shrink-0 flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
          >
            <Users size={16} />
            {t("discover.findPlayers")}
          </Link>
          <Link
            href="/market/sell"
            className="shrink-0 flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
          >
            <ShoppingBag size={16} />
            {t("discover.sellGear")}
          </Link>
        </motion.div>

        {/* ─── Loading Skeletons ─── */}
        {loading && (
          <motion.div variants={stagger} initial="hidden" animate="show">
            <SectionSkeleton />
            <SectionSkeleton width="w-48" height="h-28" />
            <SectionSkeleton />
            <SectionSkeleton width="w-44" height="h-40" />
            <SectionSkeleton width="w-40" height="h-36" />
          </motion.div>
        )}

        {/* ─── Section: Featured Courts ─── */}
        {!loading && venues.length > 0 && (
          <FeedSection
            title={t("discover.courtsNearYou")}
            icon={<Search size={16} className="text-emerald-400" />}
            href="/browse"
          >
            {venues.map((venue) => (
              <Link
                key={venue.id}
                href={`/venues/${venue.id}`}
                className="shrink-0 snap-start w-56 rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:-translate-y-1 transition-transform"
              >
                <div className="h-28 bg-white/5 relative">
                  {venue.coverPhoto ? (
                    <img
                      src={venue.coverPhoto}
                      alt={locale === "ar" && venue.nameAr ? venue.nameAr : venue.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <Search size={24} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-white/90 truncate">
                    {locale === "ar" && venue.nameAr ? venue.nameAr : venue.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={10} className="text-white/30" />
                    <span className="text-[10px] text-white/40">
                      {locale === "ar" && venue.cityAr ? venue.cityAr : venue.city}
                    </span>
                  </div>
                  {venue.courts?.[0] && (
                    <p className="text-xs font-bold text-emerald-400 mt-1.5">
                      {t("browse.priceFrom", { price: venue.courts[0].pricePerHour })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </FeedSection>
        )}

        {/* ─── Section: Active Lobbies ─── */}
        {!loading && lobbies.length > 0 && (
          <FeedSection
            title={t("discover.openGames")}
            icon={<Users size={16} className="text-emerald-400" />}
            href="/play"
            liveIndicator
          >
            {lobbies.map((lobby) => (
              <Link
                key={lobby.id}
                href={`/lobby/${lobby.lobbyCode}`}
                className="shrink-0 snap-start w-48 rounded-xl bg-white/5 border border-white/10 p-3.5 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={12} className="text-emerald-400" />
                  <span className="text-xs font-medium text-white/70">
                    {locale === "ar" && lobby.areaAr ? lobby.areaAr : lobby.area}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar size={12} className="text-white/30" />
                  <span className="text-xs text-white/40">
                    {new Date(lobby.date).toLocaleDateString(
                      locale === "ar" ? "ar-EG" : "en-US",
                      { weekday: "short", month: "short", day: "numeric" }
                    )}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  {t("lobby.spotsLeft", {
                    count: 4 - (lobby.players?.length || 1),
                  })}
                </div>
              </Link>
            ))}
          </FeedSection>
        )}

        {/* ─── Section: Trending Gear ─── */}
        {!loading && trending.length > 0 && (
          <FeedSection
            title={t("discover.hotInMarket")}
            icon={<Flame size={16} className="text-orange-400" />}
            href="/market"
          >
            {trending.map((item) => (
              <div
                key={item.id}
                className="shrink-0 snap-start w-56 cursor-pointer"
                onClick={() => router.push(`/market/${item.id}`)}
              >
                <ListingCard listing={item} variant="compact" />
              </div>
            ))}
          </FeedSection>
        )}

        {/* ─── Section: New Coaches ─── */}
        {!loading && coaches.length > 0 && (
          <FeedSection
            title={t("discover.newCoaches")}
            icon={<GraduationCap size={16} className="text-purple-400" />}
            href="/coaches"
          >
            {coaches.map((coach) => (
              <div key={coach.id} className="shrink-0 snap-start">
                <CoachCard
                  coach={{
                    id: coach.id,
                    name: coach.name,
                    nameAr: coach.nameAr,
                    photo: coach.photo,
                    areas: coach.areas ?? [],
                    areasAr: coach.areasAr,
                    pricePerHour: coach.pricePerHour ? Number(coach.pricePerHour) : null,
                    heartCount: coach.heartCount ?? 0,
                  }}
                  size="sm"
                  onClick={() => router.push(`/coaches/${coach.id}`)}
                />
              </div>
            ))}
          </FeedSection>
        )}

        {/* ─── Section: Top Players ─── */}
        {!loading && players.length > 0 && (
          <FeedSection
            title={t("discover.topPlayers")}
            icon={<Trophy size={16} className="text-amber-400" />}
            href="/players"
          >
            {players.map((player, i) => {
              const tierColor = PLAYER_TIER_COLORS[player.tier as keyof typeof PLAYER_TIER_COLORS] ?? "#9ca3af";
              return (
                <Link
                  key={player.id || player.phone}
                  href={`/players/${player.id}`}
                  className="relative shrink-0 snap-start w-28 h-[156px] rounded-2xl bg-white/[0.04] border border-white/[0.08] overflow-hidden hover:-translate-y-1 transition-all"
                  style={{ boxShadow: `0 0 15px ${tierColor}15` }}
                >
                  {/* Tier top stripe */}
                  <div
                    className="absolute top-0 inset-x-0 h-[3px]"
                    style={{ background: `linear-gradient(90deg, ${tierColor}, ${tierColor}40)` }}
                  />

                  {/* Rank pill */}
                  <div
                    className="absolute top-2 end-2 text-[9px] font-black px-1.5 py-0.5 rounded-md z-10"
                    style={{ background: `${tierColor}25`, color: tierColor }}
                  >
                    #{i + 1}
                  </div>

                  <div className="flex flex-col items-center justify-center h-full p-2 gap-1.5">
                    {/* Avatar circle */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
                      style={{
                        border: `2px solid ${tierColor}`,
                        background: `${tierColor}12`,
                        color: tierColor,
                      }}
                    >
                      {player.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                    </div>
                    <p className="text-xs font-bold text-white/90 truncate max-w-full text-center">
                      {player.name}
                    </p>
                    <span
                      className="text-[8px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${tierColor}20`, color: tierColor }}
                    >
                      {player.tier}
                    </span>
                    <p className="text-[10px] text-white/40">
                      {player.gamesPlayed} {t("player.gamesPlayed")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </FeedSection>
        )}

        {/* ─── WhatsApp Support ─── */}
        {!loading && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <a
              href="https://wa.me/201100775031"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 px-4 py-3.5 transition-all hover:bg-[#25D366]/15 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/90">
                  {t("common.support")}
                </p>
                <p className="text-xs text-white/40">
                  {t("discover.supportDesc")}
                </p>
              </div>
              <ArrowUpRight size={16} className="text-[#25D366] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </motion.div>
        )}

        {/* ─── Footer Link to Landing ─── */}
        {!loading && (
          <motion.div
            className="text-center py-6 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/welcome"
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              {t("discover.newHere")} &rarr;
            </Link>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
