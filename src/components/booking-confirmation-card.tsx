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
            className="rounded-full bg-[#c8ff00] flex items-center justify-center shadow-lg"
            style={{ width: 88, height: 88 }}
          >
            <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none">
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
          {/* Decorative rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#c8ff00]/30"
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
          className="text-2xl font-bold text-gray-900"
        >
          {t("confirmation.title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-400 mt-1"
        >
          {t("confirmation.subtitle")}
        </motion.p>
      </div>

      {/* Confirmation code */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 text-center shadow-card"
      >
        <p className="text-xs text-gray-400 mb-3">{t("confirmation.code")}</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl font-mono font-extrabold tracking-[0.2em] text-gray-900">
            {booking.confirmationCode}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="rounded-lg bg-gray-100 p-2.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
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
        className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 space-y-3"
      >
        <h3 className="text-sm font-bold text-gray-700 mb-3">{t("confirmation.details")}</h3>
        <DetailRow label={t("booking.court")} value={`${booking.venueName} - ${booking.courtName}`} />
        <DetailRow label={t("booking.date")} value={formatDate(booking.date)} />
        <DetailRow
          label={t("booking.time")}
          value={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
        />
        <DetailRow label={t("booking.price")} value={formatPrice(price)} highlight />

        {/* Pay at venue badge */}
        <div className="flex items-center justify-center gap-2 rounded-full bg-amber-50 px-4 py-2.5 mt-4 border border-amber-200">
          <CreditCard size={15} className="text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">
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
          className="flex items-center justify-center gap-2 w-full rounded-full border border-gray-200 py-3.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
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
      <span className="text-gray-400">{label}</span>
      <span className={highlight ? "font-bold text-gray-900" : "text-gray-600 font-medium"}>
        {value}
      </span>
    </div>
  );
}
