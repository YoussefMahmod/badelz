"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CreditCard, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { BookingConfirmationCard } from "@/components/booking-confirmation-card";
import { GameLinkCard } from "@/components/game-link-card";
import { AuthNudge } from "@/components/auth-nudge";
import { LoadingSpinner } from "@/components/loading-spinner";
import { NotificationPrompt } from "@/components/notification-prompt";
import { useTranslation, useLocale } from "@/i18n";

interface GameOnBooking {
  gameCode: string;
  status: string;
  pricePerPlayer: number;
  players: Array<{
    position: number;
    playerName: string;
    confirmedAt: string;
  }>;
}

interface BookingData {
  id: string;
  confirmationCode: string;
  playerName: string;
  playerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: string | number;
  status: string;
  notes?: string | null;
  court: { name: string; nameAr?: string | null };
  venue: { name: string; nameAr?: string | null };
  game?: GameOnBooking;
}

export default function BookingConfirmedClient({
  bookingId,
}: {
  bookingId: string;
}) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = useCallback(async () => {
    if (bookingId === "demo") return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setBooking(json.data);
      }
    } catch {
      // handled by empty state
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId === "demo") {
      setBooking({
        id: "demo",
        confirmationCode: "MALA-7X2K",
        playerName: "Ahmed",
        playerPhone: "01012345678",
        status: "CONFIRMED",
        date: new Date().toISOString(),
        startTime: "18:00",
        endTime: "19:00",
        totalPrice: 300,
        court: { name: "Court 1", nameAr: "كورت 1" },
        venue: { name: "Padel Zone", nameAr: "بادل زون" },
        game: {
          gameCode: "ABC123",
          status: "OPEN",
          pricePerPlayer: 75,
          players: [
            { position: 0, playerName: "Ahmed", confirmedAt: new Date().toISOString() },
          ],
        },
      });
      setLoading(false);
      return;
    }

    async function load() {
      await fetchBooking();
      setLoading(false);
    }
    load();
  }, [bookingId, fetchBooking]);

  // Poll for status changes when booking is PENDING
  useEffect(() => {
    if (!booking || booking.status !== "PENDING" || bookingId === "demo") return;

    const interval = setInterval(fetchBooking, 5000);
    return () => clearInterval(interval);
  }, [booking?.status, bookingId, fetchBooking]);

  const handleCancel = async () => {
    if (!booking) return;
    if (!confirm(t("confirmation.cancelConfirm"))) return;

    setCancelling(true);
    try {
      const phone =
        booking.playerPhone ||
        localStorage.getItem("badelz-player-phone") ||
        "";
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerPhone: phone }),
      });
      const json = await res.json();
      if (res.ok) {
        setBooking({ ...booking, status: "CANCELLED" });
      } else {
        alert(json.message || t("common.error"));
      }
    } catch {
      alert(t("common.error"));
    } finally {
      setCancelling(false);
    }
  };

  const canCancel =
    booking &&
    ["CONFIRMED", "PENDING"].includes(booking.status) &&
    bookingId !== "demo";

  const isPending = booking?.status === "PENDING";
  const isConfirmed = booking?.status === "CONFIRMED";
  const isCancelled = booking?.status === "CANCELLED";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
        <p className="text-[#666]">{t("common.error")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center py-10 relative overflow-hidden">
      {/* Celebration particles -- only show when confirmed */}
      {isConfirmed && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#14b8a6" : "#065f46",
                opacity: 0.5,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0.5],
                y: [0, -100 - Math.random() * 200],
              }}
              transition={{
                duration: 1.5 + Math.random() * 1,
                delay: 0.3 + Math.random() * 0.8,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Pending status banner */}
      {isPending && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto mb-6 px-4"
        >
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-sm px-5 py-4 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-2"
            >
              <Clock size={24} className="text-amber-400" />
            </motion.div>
            <p className="text-sm font-bold text-amber-400 mb-1">
              {locale === "ar" ? "في انتظار تأكيد الملعب" : "Waiting for venue confirmation"}
            </p>
            <p className="text-xs text-amber-400/60">
              {locale === "ar"
                ? "هنبعتلك إشعار لما الملعب يأكد حجزك"
                : "We'll notify you when the venue confirms your booking"}
            </p>
          </div>
        </motion.div>
      )}

      <BookingConfirmationCard
        booking={{
          confirmationCode: booking.confirmationCode,
          venueName: booking.venue.nameAr || booking.venue.name,
          courtName: booking.court.nameAr || booking.court.name,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          totalPrice: booking.totalPrice,
          playerName: booking.playerName,
          notes: booking.notes,
        }}
        gameCode={booking.game?.gameCode}
        gameLink={
          booking.game
            ? `${typeof window !== "undefined" ? window.location.origin : ""}/game/${booking.game.gameCode}`
            : undefined
        }
      />

      {booking.game && isConfirmed && (
        <GameLinkCard
          gameCode={booking.game.gameCode}
          spotsLeft={4 - booking.game.players.length}
          players={booking.game.players}
          venueName={booking.venue.nameAr || booking.venue.name}
          courtName={booking.court.nameAr || booking.court.name}
          date={booking.date}
          startTime={booking.startTime}
          endTime={booking.endTime}
          pricePerPlayer={
            booking.game.pricePerPlayer ||
            Math.round(
              (typeof booking.totalPrice === "string"
                ? parseFloat(booking.totalPrice)
                : booking.totalPrice) / 4
            )
          }
        />
      )}

      {/* Cancelled / Rejected banner */}
      {isCancelled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto mt-4 px-4"
        >
          <div className="bg-red-500/10 border border-red-500/20 rounded-sm px-5 py-4 text-center">
            <XCircle size={24} className="text-red-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-red-400 mb-2">
              {t("confirmation.cancelled")}
            </p>
            <Link
              href="/venues"
              className="inline-block text-xs font-medium text-[#d4ff00] hover:text-[#d4ff00]/80 transition-colors"
            >
              {locale === "ar" ? "جرب ميعاد تاني" : "Try another time"}
            </Link>
          </div>
        </motion.div>
      )}

      {/* Cancel button */}
      {canCancel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm mx-auto mt-4 px-4"
        >
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full rounded-sm border border-red-500/20 bg-red-500/5 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            {cancelling ? t("common.loading") : t("confirmation.cancelBooking")}
          </button>
        </motion.div>
      )}

      {/* Auth nudge for anonymous users */}
      <div className="w-full max-w-sm mx-auto mt-6 px-4">
        <AuthNudge
          title={t("nudge.trackBookings")}
          description={t("nudge.trackBookingsDesc")}
          returnTo="/my-profile"
          variant="dark"
        />
      </div>

      <NotificationPrompt phone={booking.playerPhone} />

      <CardCTA />
    </div>
  );
}

function CardCTA() {
  const { t } = useTranslation();
  const [hasPhone, setHasPhone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("badelz-player-phone");
      if (stored) setHasPhone(true);
    }
  }, []);

  if (!hasPhone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="w-full max-w-sm mx-auto mt-6 px-4"
    >
      <Link href="/my-card" className="block">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-sm border-s-[3px] border-s-[#d4ff00] p-5 flex items-center gap-4 transition-all hover:border-[#d4ff00]/20">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4ff00]/10">
            <CreditCard size={22} className="text-[#d4ff00]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">
              {t("player.viewYourCard")}
            </p>
            <p className="text-xs text-[#666] mt-0.5">
              {t("player.viewYourCardDesc")}
            </p>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#d4ff00] shrink-0 rtl:rotate-180"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}
