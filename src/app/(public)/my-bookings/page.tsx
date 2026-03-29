"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Search,
  Loader2,
  TicketCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { EmptyState } from "@/components/empty-state";
import { AuthNudge } from "@/components/auth-nudge";
import { useTranslation, useLocale } from "@/i18n";
import { formatDate, formatTime, formatPrice } from "@/lib/format";

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: string | number;
  status: string;
  confirmationCode: string;
  court: { name: string; nameAr: string | null };
  venue: { name: string; nameAr: string | null };
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-[#d4ff00]/10 text-[#d4ff00] border-emerald-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  NO_SHOW: "bg-[#1a1a1a] text-[#666] border-[#333]",
};

export default function MyBookingsPage() {
  const { t } = useTranslation();
  const { locale, dir } = useLocale();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Pre-fill phone from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("badelz-player-phone");
    if (saved) {
      setPhone(saved);
    }
  }, []);

  // Auto-search if phone was saved
  useEffect(() => {
    const saved = localStorage.getItem("badelz-player-phone");
    if (saved && /^01[0125]\d{8}$/.test(saved)) {
      fetchBookings(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async (phoneNumber: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/bookings?phone=${phoneNumber}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setBookings(json.data);
      } else {
        setBookings([]);
      }
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^01[0125]\d{8}$/.test(phone)) {
      localStorage.setItem("badelz-player-phone", phone);
      fetchBookings(phone);
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      CONFIRMED: t("myBookings.confirmed"),
      PENDING: t("myBookings.pending"),
      CANCELLED: t("myBookings.cancelled"),
      COMPLETED: t("myBookings.completed"),
      NO_SHOW: t("myBookings.noShow"),
    };
    return map[status] || status;
  };

  const getName = (item: { name: string; nameAr: string | null }) =>
    locale === "ar" && item.nameAr ? item.nameAr : item.name;

  return (
    <MainLayout>
      <div className="mx-auto max-w-lg px-4 py-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full glass-dark text-[#999] hover:text-white transition-colors cursor-pointer"
            aria-label={t("common.back")}
          >
            <ArrowRight size={18} className={dir === "ltr" ? "rotate-180" : ""} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{t("myBookings.title")}</h1>
            <p className="text-xs text-[#666]">{t("myBookings.enterPhone")}</p>
          </div>
        </motion.div>

        {/* Search form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="flex gap-2 mb-6"
        >
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("myBookings.phonePlaceholder")}
            className="flex-1 rounded-xl glass-dark px-4 py-3 text-sm text-white placeholder-white/30 border border-[#333] focus:border-[#d4ff00] focus:outline-none transition-colors"
            dir="ltr"
          />
          <button
            type="submit"
            disabled={!/^01[0125]\d{8}$/.test(phone) || loading}
            className="flex items-center justify-center rounded-xl bg-[#d4ff00] px-5 py-3 text-sm font-bold text-[#0d0d0d] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
          </button>
        </motion.form>

        {/* Auth nudge */}
        <div className="mb-6">
          <AuthNudge
            title={t("nudge.trackBookings")}
            description={t("nudge.skipPhoneEntry")}
            returnTo="/my-profile"
            variant="dark"
          />
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <Loader2 size={24} className="animate-spin text-[#d4ff00]" />
            </motion.div>
          )}

          {!loading && searched && bookings.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={<CalendarDays size={28} />}
                title={t("myBookings.noBookings")}
                description={t("myBookings.noBookingsDesc")}
                action={{
                  label: t("myBookings.bookAgain"),
                  onClick: () => router.push("/browse"),
                }}
              />
            </motion.div>
          )}

          {!loading && bookings.length > 0 && (
            <div
              key="results"

              className="space-y-3"
            >
              {bookings.map((booking) => (
                <div key={booking.id}>
                  <Link
                    href={`/booking-confirmed/${booking.id}`}
                    className="block bg-[#1a1a1a] border border-[#333] rounded-sm p-4 border border-[#222] hover:border-[#333] transition-colors"
                  >
                    {/* Status + code */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                          STATUS_STYLES[booking.status] || STATUS_STYLES.NO_SHOW
                        }`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#666] font-mono">
                        <TicketCheck size={12} />
                        {booking.confirmationCode}
                      </span>
                    </div>

                    {/* Venue + court */}
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin size={14} className="text-[#d4ff00] mt-0.5 shrink-0" />
                      <p className="text-sm font-semibold text-white">
                        {getName(booking.venue)} — {getName(booking.court)}
                      </p>
                    </div>

                    {/* Date + time */}
                    <div className="flex items-center gap-4 text-xs text-[#999]">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        {formatDate(booking.date, locale === "ar" ? "ar-EG" : "en-US")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mt-2 text-end">
                      <span className="text-sm font-bold text-[#d4ff00]">
                        {formatPrice(booking.totalPrice)}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
