"use client";

import { useState } from "react";
import { Check, Copy, CreditCard, Search } from "lucide-react";
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
    <div className="mx-auto max-w-md px-4">
      {/* Success animation */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-5">
          <div
            className="rounded-sm bg-[#d4ff00] flex items-center justify-center"
            style={{ width: 88, height: 88 }}
          >
            <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="#0d0d0d"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white">
          {t("confirmation.title")}
        </h2>
        <p className="text-sm text-[#666] mt-1">
          {t("confirmation.subtitle")}
        </p>
      </div>

      {/* Confirmation code */}
      <div className="bg-[#1a1a1a] border-s-[3px] border-s-[#d4ff00] rounded-sm p-6 mb-4 text-center">
        <p className="text-xs text-[#666] mb-3">{t("confirmation.code")}</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl font-mono font-extrabold tracking-[0.2em] text-white">
            {booking.confirmationCode}
          </span>
          <button
            onClick={handleCopy}
            className="rounded-sm bg-[#222] p-2.5 text-[#999] transition-colors hover:bg-[#333] hover:text-white active:scale-[0.97] transition-transform duration-75"
            aria-label="Copy code"
          >
            {copied ? <Check size={16} className="text-[#d4ff00]" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Booking details */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-5 mb-4 space-y-3">
        <h3 className="text-sm font-bold text-[#999] mb-3">{t("confirmation.details")}</h3>
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
        <div className="flex items-center justify-center gap-2 rounded-sm bg-[#d4ff00]/10 px-4 py-2.5 mt-4 border border-[#d4ff00]/20">
          <CreditCard size={15} className="text-[#d4ff00]" />
          <span className="text-xs font-semibold text-[#d4ff00]">
            {t("confirmation.payAtVenue")}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <WhatsAppShareButton
          shareUrl={shareUrl}
          label={gameCode ? t("game.shareGame") : t("confirmation.shareWhatsApp")}
          fullWidth
        />

        <Link
          href="/browse"
          className="flex items-center justify-center gap-2 w-full rounded-sm border border-[#333] py-3.5 text-sm font-semibold text-[#999] transition-colors hover:bg-[#1a1a1a] hover:text-white"
        >
          <Search size={16} />
          {t("confirmation.backToBrowse")}
        </Link>
      </div>
    </div>
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
      <span className="text-[#666]">{label}</span>
      <span className={highlight ? "font-bold text-[#d4ff00] font-[family-name:var(--font-display-en)]" : "text-[#999] font-medium"}>
        {value}
      </span>
    </div>
  );
}
