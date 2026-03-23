"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "@/i18n";

interface PlayerSlotCardProps {
  position: number;
  playerName?: string;
  isHost?: boolean;
  isEmpty: boolean;
  index: number;
}

export function PlayerSlotCard({
  position,
  playerName,
  isHost = false,
  isEmpty,
  index,
}: PlayerSlotCardProps) {
  const { t } = useTranslation();

  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
        className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 p-4"
      >
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100"
        >
          <span className="text-lg font-bold text-gray-300">?</span>
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-300">
            {t("game.player", { number: position + 1 })}
          </p>
          <p className="text-xs text-gray-300">
            {t("game.waiting")}
          </p>
        </div>
      </motion.div>
    );
  }

  const initial = playerName ? playerName.charAt(0).toUpperCase() : "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className="bg-white border border-gray-200 border-s-2 border-s-[#c8ff00] flex items-center gap-3 rounded-2xl p-4"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c8ff00]">
        <span className="text-lg font-bold text-[#111827]">{initial}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-base font-semibold text-gray-900">
            {playerName}
          </p>
          {isHost && (
            <span className="shrink-0 rounded-full bg-[#c8ff00] px-2 py-0.5 text-xs font-semibold text-[#111827]">
              {t("game.host")}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {isHost
            ? t("game.host")
            : t("game.player", { number: position + 1 })}
        </p>
      </div>
      <Check size={18} className="shrink-0 text-green-500" />
    </motion.div>
  );
}
