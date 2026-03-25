"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, CreditCard, Search } from "lucide-react";
import { checkmarkDraw, slideUp } from "@/lib/animations";
import { useTranslation } from "@/i18n";
import { formatPrice, formatDate, formatTime } from "@/lib/format";
import { WhatsAppShareButton } from "./whatsapp-share-button";
import { buildBookingShareLink, buildGameShareLink } from "@/lib/whatsapp";
import Link from "next/link";

interface BookingConfirmationCardProps {
  booking: {
    confirmationCode: string;
    venueName: string;
    courtName: string;
    date: string;
    startTime: string;
    endTime: string;
    totalPrice: number | string;
    playerName: string;
    notes?: string | null;
  };
  gameCode?: string;
  gameLink?: string;
}

export function BookingConfirmationCard({
  booking,
  gameCode,
  gameLink,
}: BookingConfirmationCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(booking.confirmationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  const price = typeof booking.totalPrice === "string"
    ? parseFloat(booking.totalPrice)
    : booking.totalPrice;

  const shareUrl = gameCode
    ? buildGameShareLink({
        gameCode,
        venueName: booking.venueName,
        courtName: booking.courtName,
        date: formatDate(booking.date),
        startTime: formatTime(booking.startTime),
        endTime: formatTime(booking.endTime),
        pricePerPlayer: Math.round(price / 4),
        spotsLeft: 3,
      })
    : buildBookingShareLink({
        confirmationCode: booking.confirmationCode,
        venueName: booking.venueName,
        courtName: booking.courtName,
        date: formatDate(booking.date),
        startTime: formatTime(booking.startTime),
        endTime: formatTime(booking.endTime),
      });

  return (
    <motion.div {...slideUp} className="mx-auto max-w-md px-4">
      {/* Success animation */}
      <div className="flex flex-col items-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative mb-5"
        >
          <div
            className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
            style={{ width: 88, height: 88 }}
          >
            <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none">
              <motion.path
                d="M5 13l4 4L19 7"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                {...checkmarkDraw}
              />
            </svg>
          </div>
          {/* Decorative rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
            style={{ width: 88, height: 88 }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.5, repeat: 2 }}
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-white/90"
        >
          {t("confirmation.title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-white/40 mt-1"
        >
          {t("confirmation.subtitle")}
        </motion.p>
      </div>

      {/* Confirmation code */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-4 text-center"
      >
        <p className="text-xs text-white/40 mb-3">{t("confirmation.code")}</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl font-mono font-extrabold tracking-[0.2em] text-white/90">
            {booking.confirmationCode}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="rounded-lg bg-white/10 p-2.5 text-white/40 transition-colors hover:bg-white/15 hover:text-white/60"
            aria-label="Copy code"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </motion.button>
        </div>
      </motion.div>

      {/* Booking details */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 mb-4 space-y-3"
      >
        <h3 className="text-sm font-bold text-white/70 mb-3">{t("confirmation.details")}</h3>
        <DetailRow label={t("booking.court")} value={`${booking.venueName} - ${booking.courtName}`} />
        <DetailRow label={t("booking.date")} value={formatDate(booking.date)} />
        <DetailRow
          label={t("booking.time")}
          value={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
        />
        <DetailRow label={t("booking.price")} value={formatPrice(price)} highlight />
        {booking.notes && (
          <DetailRow label={t("booking.notes")} value={booking.notes} />
        )}

        {/* Pay at venue badge */}
        <div className="flex items-center justify-center gap-2 rounded-full bg-amber-500/10 px-4 py-2.5 mt-4 border border-amber-500/20">
          <CreditCard size={15} className="text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">
            {t("confirmation.payAtVenue")}
          </span>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-3"
      >
        <WhatsAppShareButton
          shareUrl={shareUrl}
          label={gameCode ? t("game.shareGame") : t("confirmation.shareWhatsApp")}
          fullWidth
        />

        <Link
          href="/browse"
          className="flex items-center justify-center gap-2 w-full rounded-full border border-white/10 py-3.5 text-sm font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
        >
          <Search size={16} />
          {t("confirmation.backToBrowse")}
        </Link>
      </motion.div>
    </motion.div>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/40">{label}</span>
      <span className={highlight ? "font-bold text-emerald-400" : "text-white/70 font-medium"}>
        {value}
      </span>
    </div>
  );
}
