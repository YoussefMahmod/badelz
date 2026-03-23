"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Copy,
  Check,
  Link2,
  ChevronDown,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { formatPrice, formatDate, formatTime } from "@/lib/format";
import { buildGameShareLink } from "@/lib/whatsapp";
import { checkmarkDraw, pulseGlow } from "@/lib/animations";
import { PlayerSlotCard } from "@/components/player-slot-card";
import { JoinGameForm } from "@/components/join-game-form";
import Link from "next/link";

const MAX_PLAYERS = 4;

interface GamePlayer {
  position: number;
  playerName: string;
  confirmedAt: string;
}

interface GameData {
  gameCode: string;
  status: "OPEN" | "FULL" | "CANCELLED";
  pricePerPlayer: number;
  spotsLeft: number;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number | string;
  court: { name: string; nameAr?: string | null } | null;
  venue: {
    name: string;
    nameAr?: string | null;
    coverPhoto?: string | null;
  } | null;
  players: GamePlayer[];
}

export default function GamePageClient({ code }: { code: string }) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchGame = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${code}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setGame(json.data);
        setError(null);
      } else if (res.status === 404) {
        setError("NOT_FOUND");
      } else {
        setError("GENERIC");
      }
    } catch {
      setError("GENERIC");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  const handleJoin = async (data: {
    playerName: string;
    playerPhone: string;
  }) => {
    setJoining(true);
    setJoinError(null);
    try {
      const res = await fetch(`/api/games/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        if (typeof window !== "undefined") {
          localStorage.setItem("badelz-player-phone", data.playerPhone);
        }
        setJoinSuccess(true);
        setShowJoinForm(false);
        await fetchGame();
      } else {
        setJoinError(json.message || t("common.error"));
      }
    } catch {
      setJoinError(t("common.error"));
    } finally {
      setJoining(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/game/${code}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <SkeletonPage />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Link2 size={28} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t("game.gameNotFound")}
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">
            {error === "NOT_FOUND"
              ? t("game.gameNotFound")
              : t("common.error")}
          </p>
          <Link
            href="/browse"
            className="rounded-full bg-[#111827] px-6 py-3 text-sm font-bold text-white shadow-sm"
          >
            {t("confirmation.backToBrowse")}
          </Link>
        </motion.div>
      </div>
    );
  }

  const {
    players,
    status,
    pricePerPlayer,
    gameCode,
    venue,
    court,
    date: gameDate,
    startTime,
    endTime,
    spotsLeft: apiSpotsLeft,
  } = game;

  const venueName =
    locale === "ar"
      ? venue?.nameAr || venue?.name || ""
      : venue?.name || "";
  const courtName =
    locale === "ar"
      ? court?.nameAr || court?.name || ""
      : court?.name || "";
  const spotsLeft = apiSpotsLeft ?? MAX_PLAYERS - players.length;
  const isFull = status === "FULL" || spotsLeft <= 0;

  const shareUrl = buildGameShareLink({
    gameCode,
    venueName,
    courtName,
    date: formatDate(gameDate, locale === "ar" ? "ar-EG" : "en-US"),
    startTime: formatTime(startTime),
    endTime: formatTime(endTime),
    pricePerPlayer,
    spotsLeft,
  });

  return (
    <div className="min-h-screen bg-white pb-8 relative overflow-hidden">
      {/* Hero image */}
      {venue?.coverPhoto ? (
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          <img
            src={venue?.coverPhoto}
            alt={venueName}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="pt-6" />
      )}

      {/* Game Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`bg-white border border-gray-200 rounded-2xl p-6 mx-4 relative z-10 shadow-card ${
          venue?.coverPhoto ? "-mt-8" : "mt-4"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="shrink-0 text-gray-400" />
              <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                {venueName}
              </h1>
            </div>
            <p className="text-sm text-gray-400 ps-6">
              {courtName}
            </p>
            {/* Date + Time — clearly visible */}
            <div className="flex items-center gap-3 mt-3 ps-6">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">
                  {formatDate(gameDate, locale === "ar" ? "ar-EG" : "en-US")}
                </span>
              </div>
              <div className="h-3 w-px bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">
                  {formatTime(startTime)} - {formatTime(endTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Price badge */}
          <div className="shrink-0 text-end">
            <p className="text-2xl font-extrabold text-gray-900">
              {formatPrice(
                pricePerPlayer,
                locale === "ar" ? "ar-EG" : "en-US"
              )}
            </p>
            <p className="text-xs text-gray-400">
              {locale === "ar" ? "للفرد" : "per player"}
            </p>
          </div>
        </div>

        {/* Spots indicator */}
        <div className="mt-4 flex items-center gap-2">
          {!isFull && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-[#c8ff00]"
            />
          )}
          <span
            className={`text-sm font-semibold ${
              isFull
                ? "text-gray-900"
                : "text-gray-500"
            }`}
          >
            {isFull
              ? t("game.spotsFull")
              : t("game.spotsLeft", { count: spotsLeft })}
          </span>
        </div>
      </motion.div>

      {/* Player Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 mt-6">
        {Array.from({ length: MAX_PLAYERS }).map((_, i) => {
          const player = players.find((p) => p.position === i);
          return (
            <PlayerSlotCard
              key={i}
              position={i}
              playerName={player?.playerName}
              isHost={i === 0}
              isEmpty={!player}
              index={i}
            />
          );
        })}
      </div>

      {/* Join Section */}
      <div className="px-4 mt-6">
        <AnimatePresence mode="wait">
          {/* Success state */}
          {joinSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center rounded-2xl bg-white border border-gray-200 p-8 shadow-card"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="relative mb-4"
              >
                <div
                  className="h-16 w-16 rounded-full bg-[#c8ff00] flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
                    <motion.path
                      d="M5 13l4 4L19 7"
                      stroke="#111827"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      {...checkmarkDraw}
                    />
                  </svg>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#c8ff00]/30"
                  style={{ width: 64, height: 64 }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1.2, delay: 0.3, repeat: 2 }}
                />
              </motion.div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {t("game.joinSuccess")}
              </h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                {t("game.joinSuccessDesc")}
              </p>
              <Link
                href="/my-card"
                className="flex items-center gap-2 text-sm font-semibold text-[#111827] hover:text-gray-600 transition-colors"
              >
                <CreditCard size={16} />
                <span>{t("player.checkYourCard")}</span>
              </Link>
            </motion.div>
          )}

          {/* Game full state */}
          {!joinSuccess && isFull && (
            <motion.div
              key="full"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center rounded-2xl bg-[#c8ff00]/10 border border-[#c8ff00]/30 p-6"
            >
              <motion.div
                {...pulseGlow}
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#c8ff00]"
              >
                <Sparkles size={24} className="text-[#111827]" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {t("game.allSet")}
              </h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                {t("game.allSetDesc")}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {players.map((p) => (
                  <span
                    key={p.position}
                    className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
                  >
                    {p.playerName}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Open state: Join button or form */}
          {!joinSuccess && !isFull && status !== "CANCELLED" && (
            <motion.div key="open" layout>
              {!showJoinForm ? (
                <motion.button
                  key="cta"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowJoinForm(true)}
                  className="w-full rounded-full bg-[#111827] py-5 text-lg font-bold text-white shadow-sm transition-all hover:bg-gray-800 flex items-center justify-center gap-2"
                >
                  {t("game.confirmSpot")}
                  <ChevronDown size={20} />
                </motion.button>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card"
                >
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    {t("game.confirmSpot")}
                  </h3>
                  <JoinGameForm
                    onSubmit={handleJoin}
                    loading={joining}
                    error={joinError}
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Cancelled state */}
          {status === "CANCELLED" && !joinSuccess && (
            <motion.div
              key="cancelled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center rounded-2xl bg-red-50 border border-red-200 p-6"
            >
              <p className="text-base font-bold text-red-600">
                {t("game.gameCancelled")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Share Section */}
      <div className="px-4 mt-6 mb-8 space-y-3">
        <motion.a
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.96 }}
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-green-600"
        >
          <MessageCircle size={18} />
          {t("game.shareGame")}
        </motion.a>

        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleCopyLink}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-3.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-500" />
              <span className="text-green-600">
                {t("game.linkCopied")}
              </span>
            </>
          ) : (
            <>
              <Copy size={16} />
              {t("game.copyLink")}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

function SkeletonPage() {
  return (
    <div className="animate-pulse">
      <div className="h-48 w-full bg-gray-100" />

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mx-4 -mt-8 relative z-10 shadow-card">
        <div className="h-6 w-3/4 bg-gray-100 rounded-lg mb-2" />
        <div className="h-4 w-1/2 bg-gray-50 rounded-lg mb-4" />
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-gray-50 rounded-lg" />
          <div className="h-8 w-24 bg-gray-100 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="h-11 w-11 rounded-full bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 bg-gray-100 rounded" />
              <div className="h-3 w-1/3 bg-gray-50 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 mt-6">
        <div className="h-14 w-full bg-gray-100 rounded-full" />
      </div>

      <div className="px-4 mt-6 space-y-3">
        <div className="h-12 w-full bg-gray-50 rounded-full" />
        <div className="h-12 w-full bg-gray-50 rounded-full" />
      </div>
    </div>
  );
}
