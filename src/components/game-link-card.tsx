"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Copy, Check, Eye, MessageCircle } from "lucide-react";
import { useTranslation } from "@/i18n";
import { buildGameShareLink } from "@/lib/whatsapp";
import { formatPrice, formatTime } from "@/lib/format";
import Link from "next/link";

interface GameLinkCardProps {
  gameCode: string;
  spotsLeft: number;
  players: Array<{ position: number; playerName: string }>;
  venueName: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  pricePerPlayer: number;
}

const MAX_PLAYERS = 4;

export function GameLinkCard({
  gameCode,
  spotsLeft,
  players,
  venueName,
  courtName,
  date,
  startTime,
  endTime,
  pricePerPlayer,
}: GameLinkCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/game/${gameCode}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const shareUrl = buildGameShareLink({
    gameCode,
    venueName,
    courtName,
    date,
    startTime: formatTime(startTime),
    endTime: formatTime(endTime),
    pricePerPlayer,
    spotsLeft,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="mx-auto max-w-md px-4 mt-6"
    >
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <Link2 size={16} className="text-white/60" />
          </div>
          <h3 className="text-sm font-bold text-white/70">
            {t("game.gameLink")}
          </h3>
        </div>

        {/* Game code with copy */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="text-2xl font-mono font-extrabold tracking-[0.15em] text-white/90">
            {gameCode}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="rounded-lg bg-white/10 p-2.5 text-white/40 transition-colors hover:bg-white/15 hover:text-white/60"
            aria-label={t("game.copyLink")}
          >
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} />
            )}
          </motion.button>
        </div>

        {/* Player dots + spots left */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: MAX_PLAYERS }).map((_, i) => {
              const filled = i < players.length;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + i * 0.1, type: "spring", stiffness: 300 }}
                  className={`h-3 w-3 rounded-full transition-colors ${
                    filled
                      ? "bg-emerald-400 shadow-sm shadow-emerald-400/30"
                      : "bg-white/15"
                  }`}
                />
              );
            })}
          </div>
          <span className="text-sm text-white/50">
            {spotsLeft > 0
              ? t("game.spotsLeft", { count: spotsLeft })
              : t("game.spotsFull")}
          </span>
        </div>

        {/* Price per player */}
        <div className="flex items-center justify-center mb-5">
          <span className="text-sm text-white/50">
            {t("game.pricePerPlayer", {
              price: formatPrice(pricePerPlayer),
            })}
          </span>
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5">
          {/* WhatsApp share */}
          <motion.a
            whileTap={{ scale: 0.96 }}
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-green-600"
          >
            <MessageCircle size={18} />
            {t("game.shareGame")}
          </motion.a>

          {/* View game page */}
          <Link
            href={`/game/${gameCode}`}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 py-3 text-sm font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
          >
            <Eye size={16} />
            {t("game.viewGame")}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
