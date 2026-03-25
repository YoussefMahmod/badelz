"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, MapPin, MessageCircle, Copy, Check,
  Link2, ChevronDown, Sparkles, Crown, Banknote, FileText, CreditCard,
} from "lucide-react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { useTranslation, useLocale } from "@/i18n";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatTime } from "@/lib/format";
import { buildLobbyShareLink } from "@/lib/whatsapp";
import { checkmarkDraw, pulseGlow } from "@/lib/animations";
import { AREAS } from "@/lib/constants";
import { JoinLobbyForm } from "@/components/join-lobby-form";
import { AuthNudge } from "@/components/auth-nudge";
import { usePolling } from "@/hooks/use-polling";

const MAX_PLAYERS = 4;

interface LobbyPlayer {
  position: number;
  playerName: string;
  tier?: string;
  gamesPlayed?: number;
}

interface LobbyData {
  lobbyCode: string;
  status: "OPEN" | "FULL" | "CANCELLED" | "EXPIRED";
  area: string;
  areaAr?: string | null;
  date: string;
  startTime?: string | null;
  priceRange?: string | null;
  note?: string | null;
  hostName: string;
  players: LobbyPlayer[];
}

export default function LobbyPageClient({ code }: { code: string }) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user, isAuthenticated } = useAuth();

  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchLobby = useCallback(async () => {
    try {
      const res = await fetch(`/api/lobbies/${code}`);
      const json = await res.json();
      if (res.ok && json.data) { setLobby(json.data); setError(null); }
      else if (res.status === 404) setError("NOT_FOUND");
      else setError("GENERIC");
    } catch { setError("GENERIC"); }
    finally { setLoading(false); }
  }, [code]);

  useEffect(() => { fetchLobby(); }, [fetchLobby]);

  // Poll every 5s while lobby is OPEN
  usePolling(fetchLobby, 5000, lobby?.status === "OPEN");

  const handleJoin = async (data: { playerName: string; playerPhone: string }) => {
    setJoining(true);
    setJoinError(null);
    try {
      const res = await fetch(`/api/lobbies/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        if (typeof window !== "undefined") {
          localStorage.setItem("badelz-player-phone", data.playerPhone);
        }
        track.lobbyJoined({ lobbyCode: code });
        setJoinSuccess(true); setShowJoinForm(false); await fetchLobby();
      }
      else setJoinError(json.message || t("common.error"));
    } catch { setJoinError(t("common.error")); }
    finally { setJoining(false); }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/lobby/${code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0f1a]"><SkeletonPage /></div>;

  if (error || !lobby) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-[#0a0f1a]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <Link2 size={28} className="text-white/30" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{t("lobby.lobbyNotFound")}</h2>
          <p className="text-sm text-white/40 mb-6 max-w-xs">
            {error === "NOT_FOUND" ? t("lobby.lobbyNotFound") : t("common.error")}
          </p>
          <Link href="/play" className="rounded-full bg-[#c8ff00] px-6 py-3 text-sm font-bold text-[#111827] shadow-sm">
            {t("lobby.openLobbies")}
          </Link>
        </motion.div>
      </div>
    );
  }

  const { players, status, lobbyCode, area, areaAr, date: lobbyDate, startTime, priceRange, note } = lobby;
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  const areaName = locale === "ar" && areaAr ? areaAr : area;
  const areaObj = AREAS.find((a) => a.key === area);
  const spotsLeft = MAX_PLAYERS - players.length;
  const isFull = status === "FULL" || spotsLeft <= 0;
  const isOpen = status === "OPEN" && !isFull;

  const shareUrl = buildLobbyShareLink({
    lobbyCode,
    area: areaName,
    date: formatDate(lobbyDate, loc),
    startTime: startTime ? formatTime(startTime) : undefined,
    priceRange: priceRange || undefined,
    spotsLeft,
  });

  return (
    <div className="min-h-screen bg-[#0a0f1a] pb-8 relative overflow-hidden">
      {/* Gradient mesh header */}
      <div className="relative h-40 sm:h-52 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#c8ff00]/10 via-[#0a0f1a] to-[#c8ff00]/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,255,0,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(200,255,0,0.05),transparent_60%)]" />
        <Link href="/play" className="absolute top-4 start-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-0 ltr:rotate-180">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Lobby Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mx-4 relative z-10 -mt-16"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="shrink-0 text-[#c8ff00]" />
            <h1 className="text-xl font-bold text-white sm:text-2xl">{areaName}</h1>
          </div>
          {status === "CANCELLED" && (
            <span className="shrink-0 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">{t("lobby.cancelled")}</span>
          )}
          {status === "EXPIRED" && (
            <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/40">{t("lobby.expired")}</span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-3 ps-7">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-white/40" />
            <span className="text-sm font-semibold text-white/70">{formatDate(lobbyDate, loc)}</span>
          </div>
          {startTime && (
            <>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-white/40" />
                <span className="text-sm font-semibold text-white/70">{formatTime(startTime)}</span>
              </div>
            </>
          )}
        </div>

        {priceRange && (
          <div className="flex items-center gap-1.5 mb-3 ps-7">
            <Banknote size={14} className="text-[#c8ff00]" />
            <span className="text-sm font-bold text-[#c8ff00]">~{priceRange} {locale === "ar" ? "\u062C.\u0645" : "EGP"}</span>
          </div>
        )}

        {note && (
          <div className="flex items-start gap-1.5 mb-3 ps-7">
            <FileText size={14} className="shrink-0 text-white/30 mt-0.5" />
            <p className="text-sm text-white/50">{note}</p>
          </div>
        )}

        <div className="flex items-center gap-2 ps-7">
          {isOpen && (
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="h-2 w-2 rounded-full bg-[#c8ff00]" />
          )}
          <span className={`text-sm font-semibold ${isFull ? "text-white/40" : "text-[#c8ff00]"}`}>
            {isFull ? t("lobby.full") : t("lobby.spotsLeft", { count: spotsLeft })}
          </span>
        </div>
      </motion.div>

      {/* Player Cards Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-6">
        {Array.from({ length: MAX_PLAYERS }).map((_, i) => {
          const player = players.find((p) => p.position === i);
          return player ? <FilledSlot key={i} player={player} isHost={i === 0} index={i} />
            : <EmptySlot key={i} index={i} />;
        })}
      </div>

      {/* Join Section */}
      <div className="px-4 mt-6">
        <AnimatePresence mode="wait">
          {joinSuccess && <SuccessState key="success" />}

          {!joinSuccess && isFull && (
            <motion.div key="full" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center rounded-2xl bg-[#c8ff00]/10 border border-[#c8ff00]/20 p-6">
              <motion.div {...pulseGlow} className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#c8ff00]">
                <Sparkles size={24} className="text-[#111827]" />
              </motion.div>
              <h3 className="text-lg font-bold text-white mb-1">{t("lobby.full")}</h3>
              <p className="text-sm text-white/50 text-center mb-4">{t("lobby.bookCourtDesc")}</p>
              <Link href={`/browse${areaObj ? `?area=${area}` : ""}`}
                className="rounded-full bg-[#c8ff00] px-6 py-3 text-sm font-bold text-[#111827] shadow-sm transition-all hover:shadow-[0_0_20px_rgba(200,255,0,0.2)]">
                {t("lobby.bookCourt")}
              </Link>
            </motion.div>
          )}

          {!joinSuccess && isOpen && (
            <motion.div key="open" layout>
              {!showJoinForm ? (
                <motion.button key="cta" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  whileTap={{ scale: 0.97 }} onClick={() => setShowJoinForm(true)}
                  className="w-full rounded-full bg-[#c8ff00] py-5 text-lg font-bold text-[#111827] shadow-lg shadow-[#c8ff00]/20 transition-all hover:shadow-[0_0_30px_rgba(200,255,0,0.3)] flex items-center justify-center gap-2">
                  {t("lobby.joinLobby")}
                  <ChevronDown size={20} />
                </motion.button>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-4">{t("lobby.joinLobby")}</h3>
                  <JoinLobbyForm
                    onSubmit={handleJoin}
                    loading={joining}
                    error={joinError}
                    initialName={isAuthenticated && user?.name ? user.name : ""}
                    initialPhone={isAuthenticated && user?.phone ? user.phone : ""}
                    authenticatedName={isAuthenticated && user?.name ? user.name : undefined}
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {status === "CANCELLED" && !joinSuccess && (
            <motion.div key="cancelled" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center rounded-2xl bg-red-500/10 border border-red-500/20 p-6">
              <p className="text-base font-bold text-red-400">{t("lobby.cancelled")}</p>
            </motion.div>
          )}

          {status === "EXPIRED" && !joinSuccess && (
            <motion.div key="expired" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center rounded-2xl bg-white/5 border border-white/10 p-6">
              <p className="text-base font-bold text-white/40">{t("lobby.expired")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Share Section */}
      <div className="px-4 mt-6 mb-4 space-y-3">
        <motion.a initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.96 }} href={shareUrl} target="_blank" rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-green-600">
          <MessageCircle size={18} />
          {t("lobby.shareLobby")}
        </motion.a>

        <motion.button initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.96 }} onClick={handleCopyLink}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 py-3.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5">
          {copied ? (
            <><Check size={16} className="text-[#c8ff00]" /><span className="text-[#c8ff00]">{t("lobby.linkCopied")}</span></>
          ) : (
            <><Copy size={16} />{t("lobby.copyLink")}</>
          )}
        </motion.button>
      </div>

      {/* Auth nudge */}
      <div className="px-4 mb-8">
        <AuthNudge
          title={t("nudge.manageLobbies")}
          description={t("nudge.verifiedHost")}
          returnTo="/my-profile"
          variant="dark"
        />
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────── */

function EmptySlot({ index }: { index: number }) {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 p-4 min-h-[140px]">
      <motion.div animate={{ borderColor: ["rgba(200,255,0,0.1)", "rgba(200,255,0,0.3)", "rgba(200,255,0,0.1)"] }}
        transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-2xl border-2 border-dashed pointer-events-none" />
      <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 mb-2">
        <span className="text-xl font-bold text-white/20">?</span>
      </motion.div>
      <p className="text-xs text-white/30">{t("lobby.waiting")}</p>
    </motion.div>
  );
}

function FilledSlot({ player, isHost, index }: {
  player: LobbyPlayer; isHost: boolean; index: number;
}) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const initial = player.playerName.charAt(0).toUpperCase();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative flex flex-col items-center justify-center rounded-2xl bg-white/5 border border-white/10 border-s-2 border-s-[#c8ff00] p-4 min-h-[140px]">
      {isHost && <Crown size={14} className="absolute top-2 end-2 text-[#ffd700]" fill="#ffd700" />}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c8ff00] mb-2">
        <span className="text-lg font-bold text-[#111827]">{initial}</span>
      </div>
      <p className="text-sm font-semibold text-white text-center line-clamp-1 mb-0.5">{player.playerName}</p>
      {isHost && <span className="rounded-full bg-[#c8ff00]/20 px-2 py-0.5 text-[10px] font-semibold text-[#c8ff00]">{t("lobby.host")}</span>}
      {player.tier && (
        <span className="mt-1 text-[10px] text-white/30">
          {player.tier}{player.gamesPlayed !== undefined && ` \u00B7 ${player.gamesPlayed} ${locale === "ar" ? "\u0645\u0627\u062A\u0634" : "games"}`}
        </span>
      )}
      <div className="absolute top-2 start-2"><Check size={14} className="text-[#c8ff00]" /></div>
    </motion.div>
  );
}

function SuccessState() {
  const { t } = useTranslation();
  return (
    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center rounded-2xl bg-white/5 border border-white/10 p-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="relative mb-4">
        <div className="h-16 w-16 rounded-full bg-[#c8ff00] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
            <motion.path d="M5 13l4 4L19 7" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...checkmarkDraw} />
          </svg>
        </div>
        <motion.div className="absolute inset-0 rounded-full border-2 border-[#c8ff00]/30" style={{ width: 64, height: 64 }}
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 1.2, delay: 0.3, repeat: 2 }} />
      </motion.div>
      <h3 className="text-xl font-bold text-white mb-1">{t("lobby.joinSuccess")}</h3>
      <p className="text-sm text-white/50 text-center mb-4">{t("lobby.joinSuccessDesc")}</p>
      <Link
        href="/my-card"
        className="flex items-center gap-2 text-sm text-[#c8ff00] hover:text-[#c8ff00]/80 transition-colors"
      >
        <CreditCard size={16} />
        <span>{t("player.checkYourCard")}</span>
      </Link>
    </motion.div>
  );
}

function SkeletonPage() {
  return (
    <div className="animate-pulse">
      <div className="h-40 w-full bg-gradient-to-br from-white/5 to-transparent" />
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mx-4 -mt-16 relative z-10">
        <div className="h-6 w-3/4 rounded-lg dark-skeleton mb-3" />
        <div className="h-4 w-1/2 rounded-lg dark-skeleton mb-3" />
        <div className="h-4 w-1/3 rounded-lg dark-skeleton" />
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col items-center min-h-[140px]">
            <div className="h-12 w-12 rounded-full dark-skeleton mb-2" />
            <div className="h-4 w-2/3 rounded dark-skeleton mb-1" />
            <div className="h-3 w-1/2 rounded dark-skeleton" />
          </div>
        ))}
      </div>
      <div className="px-4 mt-6"><div className="h-14 w-full rounded-full dark-skeleton" /></div>
      <div className="px-4 mt-6 space-y-3">
        <div className="h-12 w-full rounded-full dark-skeleton" />
        <div className="h-12 w-full rounded-full dark-skeleton" />
      </div>
    </div>
  );
}
