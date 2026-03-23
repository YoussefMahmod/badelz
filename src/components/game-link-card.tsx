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
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <Link2 size={16} className="text-gray-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-700">
            {t("game.gameLink")}
          </h3>
        </div>

        {/* Game code with copy */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="text-2xl font-mono font-extrabold tracking-[0.15em] text-gray-900">
            {gameCode}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="rounded-lg bg-gray-100 p-2.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
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
                      ? "bg-[#c8ff00] shadow-sm"
                      : "bg-gray-200"
                  }`}
                />
              );
            })}
          </div>
          <span className="text-sm text-gray-500">
            {spotsLeft > 0
              ? t("game.spotsLeft", { count: spotsLeft })
              : t("game.spotsFull")}
          </span>
        </div>

        {/* Price per player */}
        <div className="flex items-center justify-center mb-5">
          <span className="text-sm text-gray-500">
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
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <Eye size={16} />
            {t("game.viewGame")}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
