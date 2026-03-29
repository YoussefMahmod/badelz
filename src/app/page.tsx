"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ArrowUpRight,
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

/* ─── Section Skeleton ─── */
function SectionSkeleton() {
  return (
    <div>
      <div className="bg-[#111] px-5 py-3.5 border-b-[3px] border-b-[#222]">
        <div className="h-4 w-28 bg-[#1a1a1a]" />
      </div>
      <div className="space-y-0">
        {[0, 1].map((i) => (
          <div key={i} className="h-16 bg-[#0d0d0d] border-b-2 border-b-[#161616] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/* ─── Discover Page — BRUTALIST STADIUM ─── */
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

  const featuredVenue = venues[0];
  const remainingVenues = venues.slice(1);

  // Podium order for leaderboard: 2nd | 1st | 3rd
  const podiumPlayers = players.slice(0, 3);
  const podiumOrder = podiumPlayers.length === 3
    ? [podiumPlayers[1], podiumPlayers[0], podiumPlayers[2]]
    : podiumPlayers;
  const restPlayers = players.slice(3);

  return (
    <MainLayout navType="public">
      <FeatureTour />
      <div className="w-full max-w-2xl mx-auto pb-28">

        {/* ─── Featured Venue (angled clip-path) ─── */}
        {!loading && featuredVenue && (
          <Link
            href={`/venues/${featuredVenue.id}`}
            className="block bg-[#d4ff00] text-[#0d0d0d] p-6 active:scale-[0.98] transition-transform duration-75"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 16px), 0 100%)" }}
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] opacity-50 mb-1">
              {t("discover.courtsNearYou")}
            </p>
            <h2 className="font-[family-name:var(--font-display-en)] text-[42px] leading-[0.9] uppercase mb-2">
              {locale === "ar" && featuredVenue.nameAr ? featuredVenue.nameAr : featuredVenue.name}
            </h2>
            <div className="flex gap-4 text-[12px] uppercase opacity-50 mb-2">
              <span>{locale === "ar" && featuredVenue.cityAr ? featuredVenue.cityAr : featuredVenue.city}</span>
              {featuredVenue.courts && <span>{featuredVenue.courts.length} {t("venue.courts")}</span>}
            </div>
            {featuredVenue.courts?.[0] && (
              <p className="font-[family-name:var(--font-display-en)] text-[28px]">
                {featuredVenue.courts[0].pricePerHour} EGP/HR
              </p>
            )}
          </Link>
        )}

        {/* ─── Quick Actions (stadium buttons) ─── */}
        <div className="grid grid-cols-3 gap-0">
          <Link
            href="/browse"
            className="relative bg-[#d4ff00] text-[#0d0d0d] text-center py-4 font-[family-name:var(--font-display-en)] text-sm uppercase tracking-wide border-e-2 border-e-[#0d0d0d] active:scale-[0.97] transition-transform duration-75"
          >
            {t("discover.bookCourt")}
            <span className="absolute bottom-0 inset-x-0 h-1 bg-[#a0c200]" />
          </Link>
          <Link
            href="/play"
            className="relative bg-[#161616] text-[#888] text-center py-4 font-[family-name:var(--font-display-en)] text-sm uppercase tracking-wide border-e-2 border-e-[#0d0d0d] active:scale-[0.97] transition-transform duration-75"
          >
            {t("discover.findPlayers")}
            <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#333]" />
          </Link>
          <Link
            href="/market/sell"
            className="relative bg-[#161616] text-[#888] text-center py-4 font-[family-name:var(--font-display-en)] text-sm uppercase tracking-wide active:scale-[0.97] transition-transform duration-75"
          >
            {t("discover.sellGear")}
            <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#333]" />
          </Link>
        </div>

        {/* ─── Loading Skeletons ─── */}
        {loading && (
          <div>
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        )}

        {/* ─── Section: Nearby Courts ─── */}
        {!loading && remainingVenues.length > 0 && (
          <section>
            {/* Block header */}
            <div className="bg-[#111] px-5 py-3.5 flex items-center justify-between border-b-[3px] border-b-[#d4ff00]">
              <h2 className="font-[family-name:var(--font-display-en)] text-lg uppercase tracking-wide">
                {t("discover.courtsNearYou")}
              </h2>
              <Link href="/browse" className="text-[11px] text-[#555] uppercase">
                {t("discover.seeAll")}
              </Link>
            </div>
            {/* Rows */}
            {remainingVenues.map((venue) => (
              <Link
                key={venue.id}
                href={`/venues/${venue.id}`}
                className="relative flex items-center bg-[#0d0d0d] border-b-2 border-b-[#161616] px-5 py-3.5 active:scale-[0.98] transition-transform duration-75"
              >
                {/* Right-side color bar */}
                <span className="absolute top-0 bottom-0 end-0 w-[5px] bg-[#d4ff00]" />
                {/* Thumbnail */}
                <div className="w-14 h-14 bg-[#161616] me-3.5 flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-[#222]">
                  {venue.coverPhoto ? (
                    <img
                      src={venue.coverPhoto}
                      alt={locale === "ar" && venue.nameAr ? venue.nameAr : venue.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Search size={16} className="text-[#555]" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-white uppercase tracking-wide truncate">
                    {locale === "ar" && venue.nameAr ? venue.nameAr : venue.name}
                  </p>
                  <p className="text-[11px] text-[#555] mt-0.5 uppercase">
                    {locale === "ar" && venue.cityAr ? venue.cityAr : venue.city}
                    {venue.courts && ` - ${venue.courts.length} ${t("venue.courts")}`}
                  </p>
                </div>
                {/* Price */}
                {venue.courts?.[0] && (
                  <span className="font-[family-name:var(--font-display-en)] text-xl text-[#d4ff00] flex-shrink-0 me-2">
                    {venue.courts[0].pricePerHour} EGP
                  </span>
                )}
              </Link>
            ))}
          </section>
        )}

        {/* ─── Section: Open Lobbies ─── */}
        {!loading && lobbies.length > 0 && (
          <section>
            {/* Block header */}
            <div className="bg-[#111] px-5 py-3.5 flex items-center justify-between border-b-[3px] border-b-[#ff4d4d]">
              <div className="flex items-center gap-2">
                <h2 className="font-[family-name:var(--font-display-en)] text-lg uppercase tracking-wide">
                  {t("discover.openGames")}
                </h2>
                <span className="font-[family-name:var(--font-display-en)] text-[10px] bg-[#ff4d4d] text-white px-2 py-0.5 uppercase tracking-widest">
                  LIVE
                </span>
              </div>
              <Link href="/play" className="text-[11px] text-[#555] uppercase">
                {t("discover.seeAll")}
              </Link>
            </div>
            {/* Rows */}
            {lobbies.map((lobby) => (
              <Link
                key={lobby.id}
                href={`/lobby/${lobby.lobbyCode}`}
                className="relative flex items-center justify-between bg-[#0d0d0d] border-b-2 border-b-[#161616] px-5 py-3.5 active:scale-[0.98] transition-transform duration-75"
              >
                {/* Right-side red bar */}
                <span className="absolute top-0 bottom-0 end-0 w-[5px] bg-[#ff4d4d]" />
                <div>
                  <p className="text-[15px] font-extrabold text-white uppercase tracking-wide">
                    {locale === "ar" && lobby.areaAr ? lobby.areaAr : lobby.area}
                  </p>
                  <p className="text-xs text-[#555] mt-0.5">
                    {new Date(lobby.date).toLocaleDateString(
                      locale === "ar" ? "ar-EG" : "en-US",
                      { weekday: "short", month: "short", day: "numeric" }
                    )}
                  </p>
                </div>
                <div className="text-center me-2">
                  <span className="font-[family-name:var(--font-display-en)] text-[32px] text-[#ff4d4d]">
                    {lobby.players?.length || 1}/4
                  </span>
                  <p className="text-[8px] text-[#444] uppercase tracking-[0.1em]">
                    {t("lobby.spotsLeft", { count: 4 - (lobby.players?.length || 1) })}
                  </p>
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* ─── Section: Top Coaches ─── */}
        {!loading && coaches.length > 0 && (
          <section>
            <div className="bg-[#111] px-5 py-3.5 flex items-center justify-between border-b-[3px] border-b-[#00c2ff]">
              <h2 className="font-[family-name:var(--font-display-en)] text-lg uppercase tracking-wide">
                {t("discover.newCoaches")}
              </h2>
              <Link href="/coaches" className="text-[11px] text-[#555] uppercase">
                {t("discover.seeAll")}
              </Link>
            </div>
            <div className="flex gap-0 overflow-x-auto scrollbar-hide bg-[#0d0d0d]">
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
            </div>
          </section>
        )}

        {/* ─── Section: Trending Gear ─── */}
        {!loading && trending.length > 0 && (
          <section>
            <div className="bg-[#111] px-5 py-3.5 flex items-center justify-between border-b-[3px] border-b-[#d4ff00]">
              <h2 className="font-[family-name:var(--font-display-en)] text-lg uppercase tracking-wide">
                {t("discover.hotInMarket")}
              </h2>
              <Link href="/market" className="text-[11px] text-[#555] uppercase">
                {t("discover.seeAll")}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-[2px] bg-[#0d0d0d]">
              {trending.map((item) => (
                <div key={item.id} className="cursor-pointer" onClick={() => router.push(`/market/${item.id}`)}>
                  <ListingCard listing={item} variant="compact" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Section: Leaderboard (Podium) ─── */}
        {!loading && players.length > 0 && (
          <section>
            <div className="bg-[#111] px-5 py-3.5 flex items-center justify-between border-b-[3px] border-b-[#d4ff00]">
              <h2 className="font-[family-name:var(--font-display-en)] text-lg uppercase tracking-wide">
                {t("discover.topPlayers")}
              </h2>
              <Link href="/players" className="text-[11px] text-[#555] uppercase">
                {t("discover.seeAll")}
              </Link>
            </div>

            {/* Podium: 2nd | 1st | 3rd */}
            {podiumOrder.length > 0 && (
              <div className="grid grid-cols-3 gap-0 bg-[#111]">
                {podiumOrder.map((player, displayIdx) => {
                  const realIdx = displayIdx === 0 ? 1 : displayIdx === 1 ? 0 : 2;
                  const tierColor = PLAYER_TIER_COLORS[player.tier as keyof typeof PLAYER_TIER_COLORS] ?? "#9ca3af";
                  return (
                    <Link
                      key={player.id || player.phone}
                      href={`/players/${player.id}`}
                      className={`relative text-center py-5 px-2 ${displayIdx < 2 ? "border-e-2 border-e-[#0d0d0d]" : ""}`}
                    >
                      {/* Top tier bar */}
                      <span
                        className="absolute top-0 inset-x-0 h-1"
                        style={{ background: tierColor }}
                      />
                      {/* Rank */}
                      <p
                        className="font-[family-name:var(--font-display-en)] text-[36px] leading-none"
                        style={{ color: tierColor }}
                      >
                        {realIdx + 1}
                      </p>
                      {/* Avatar */}
                      <div
                        className="w-11 h-11 rounded-full mx-auto mt-2 flex items-center justify-center text-[13px] font-bold"
                        style={{
                          border: `3px solid ${tierColor}`,
                          background: `${tierColor}10`,
                          color: tierColor,
                        }}
                      >
                        {player.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                      </div>
                      {/* Name */}
                      <p className="text-[11px] font-bold text-[#ddd] mt-1.5 truncate">
                        {player.name.split(" ").map(w => w[0].toUpperCase() + ".").join("")}
                      </p>
                      <p className="text-[9px] text-[#555] mt-0.5">
                        {t("player.gamesCount", { count: player.gamesPlayed })}
                      </p>
                      {/* Tier badge */}
                      <span
                        className="inline-block text-[8px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 mt-1.5"
                        style={{ background: `${tierColor}15`, color: tierColor }}
                      >
                        {player.tier}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Rest: compact rows */}
            {restPlayers.length > 0 && (
              <div className="bg-[#0d0d0d]">
                {restPlayers.map((player, i) => {
                  const tierColor = PLAYER_TIER_COLORS[player.tier as keyof typeof PLAYER_TIER_COLORS] ?? "#9ca3af";
                  return (
                    <Link
                      key={player.id || player.phone}
                      href={`/players/${player.id}`}
                      className="flex items-center gap-2.5 px-5 py-3 border-b border-b-[#161616]"
                    >
                      <span className="font-[family-name:var(--font-display-en)] text-lg text-[#333] w-7 text-center">
                        {i + 4}
                      </span>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#333] bg-[#161616] text-[#555]"
                      >
                        {player.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#888]">{player.name}</p>
                        <p className="text-[9px] text-[#444]">{player.gamesPlayed} {t("player.gamesPlayed")}</p>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 bg-[#161616] text-[#555] uppercase">
                        {player.tier}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ─── Footer ─── */}
        {!loading && (
          <div className="text-center py-6 mb-16">
            <Link href="/welcome" className="text-xs text-[#666] hover:text-[#999] transition-colors">
              {t("discover.newHere")} &rarr;
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
