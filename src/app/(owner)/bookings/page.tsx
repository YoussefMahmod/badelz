"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  User,
  Phone,
  Clock,
  Check,
  X,
  CheckCircle,
  FileText,
  Plus,
  List,
} from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { formatTime, formatDateShort } from "@/lib/format";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { ManualBookingModal } from "@/components/owner/manual-booking-modal";
import { ScheduleGrid } from "@/components/owner/schedule-grid";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

interface Booking {
  id: string;
  playerName: string;
  playerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  confirmationCode: string;
  notes?: string | null;
  court: { name: string; nameAr: string | null };
}

interface Court {
  id: string;
  name: string;
  nameAr: string | null;
  pricePerHour: string | number;
}

const STATUS_CONFIG: Record<
  BookingStatus,
  { color: string; bg: string; borderColor: string }
> = {
  PENDING: { color: "text-amber-400", bg: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  CONFIRMED: { color: "text-emerald-400", bg: "bg-emerald-500/10", borderColor: "border-emerald-500/20" },
  CANCELLED: { color: "text-red-400", bg: "bg-red-500/10", borderColor: "border-red-500/20" },
  COMPLETED: { color: "text-blue-400", bg: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  NO_SHOW: { color: "text-white/40", bg: "bg-white/5", borderColor: "border-white/10" },
};

const STATUS_KEYS: BookingStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];

export default function OwnerBookingsPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<BookingStatus | "ALL">("ALL");

  // Phase 2 state
  const [viewMode, setViewMode] = useState<"list" | "schedule">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("badelz-bookings-view") as "list" | "schedule") || "list";
    }
    return "list";
  });
  const [showModal, setShowModal] = useState(false);
  const [courts, setCourts] = useState<Court[]>([]);
  const [venueId, setVenueId] = useState<string>("");
  const [prefill, setPrefill] = useState<{
    courtId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  } | undefined>();

  // Fetch venue + courts on mount
  useEffect(() => {
    async function fetchVenueAndCourts() {
      try {
        const venueRes = await fetch("/api/venues?limit=1&mine=true");
        const venueJson = await venueRes.json();
        const venue = venueJson.data?.[0];
        if (!venue) return;
        setVenueId(venue.id);

        const courtsRes = await fetch(`/api/venues/${venue.id}/courts`);
        const courtsJson = await courtsRes.json();
        if (courtsJson.data) {
          setCourts(courtsJson.data);
        }
      } catch {
        // silently fail
      }
    }
    fetchVenueAndCourts();
  }, []);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem("badelz-bookings-view", viewMode);
  }, [viewMode]);

  const fetchBookings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeFilter !== "ALL") params.set("status", activeFilter);

      const res = await fetch(`/api/owner/bookings?${params.toString()}`);
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
  }, [activeFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleAction = async (bookingId: string, action: "confirm" | "cancel" | "complete") => {
    try {
      const statusMap = {
        confirm: "CONFIRMED",
        cancel: "CANCELLED",
        complete: "COMPLETED",
      };
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusMap[action] }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.message || "حدث خطأ");
        return;
      }
      fetchBookings();
    } catch {
      alert("حدث خطأ في الاتصال");
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    const labels: Record<BookingStatus, string> = {
      PENDING: t("owner.pending"),
      CONFIRMED: t("owner.confirmed"),
      CANCELLED: t("owner.cancelled"),
      COMPLETED: t("owner.completed"),
      NO_SHOW: t("owner.noShow"),
    };
    return labels[status];
  };

  const filters = [
    { key: "ALL" as const, label: t("owner.allStatuses") },
    ...STATUS_KEYS.map((s) => ({ key: s, label: getStatusLabel(s) })),
  ];

  const filtered = activeFilter === "ALL"
    ? bookings
    : bookings.filter((b) => b.status === activeFilter);

  const handleSlotTap = (slotPrefill: { courtId: string; date: string; startTime: string; endTime: string }) => {
    setPrefill(slotPrefill);
    setShowModal(true);
  };

  const handleBookingCreated = () => {
    fetchBookings();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white/90 mb-4"
      >
        {t("owner.bookingsList")}
      </motion.h1>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setViewMode("list")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
            viewMode === "list"
              ? "bg-white/15 text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <List size={14} />
          {t("owner.listView")}
        </button>
        <button
          onClick={() => setViewMode("schedule")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
            viewMode === "schedule"
              ? "bg-white/15 text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <CalendarDays size={14} />
          {t("owner.scheduleView")}
        </button>
      </div>

      {/* List view */}
      {viewMode === "list" && (
        <>
          {/* Status filter tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 overflow-x-auto hide-scrollbar pb-4"
          >
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => {
                  setActiveFilter(filter.key);
                  setLoading(true);
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
                  activeFilter === filter.key
                    ? "bg-white/15 text-white"
                    : "border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </motion.div>

          {/* Bookings list */}
          {loading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={28} />}
              title={t("owner.noBookings")}
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              {filtered.map((booking) => {
                const config = STATUS_CONFIG[booking.status];
                return (
                  <motion.div
                    key={booking.id}
                    variants={staggerItem}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c8ff00]/20">
                        <User size={18} className="text-[#111827]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white/90 truncate">
                            {booking.playerName}
                          </h3>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color} border ${config.borderColor}`}
                          >
                            {getStatusLabel(booking.status)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <Phone size={10} />
                            <span dir="ltr">{booking.playerPhone}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays size={10} />
                            {formatDateShort(booking.date, locale === "ar" ? "ar-EG" : "en-US")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </span>
                        </div>
                        <p className="text-xs text-white/30 mt-1">
                          {booking.court.name} | {booking.confirmationCode}
                        </p>
                        {booking.notes && (
                          <div className="flex items-start gap-1.5 mt-1.5 px-2 py-1 rounded-lg bg-amber-500/5 border border-amber-500/10" data-testid="booking-notes">
                            <FileText size={12} className="text-amber-400/70 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-300/80 leading-relaxed">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.status === "PENDING" && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAction(booking.id, "confirm")}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                        >
                          <Check size={14} />
                          {t("owner.confirmBooking")}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAction(booking.id, "cancel")}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                        >
                          <X size={14} />
                          {t("owner.cancelBooking")}
                        </motion.button>
                      </div>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAction(booking.id, "complete")}
                          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 py-2 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                        >
                          <CheckCircle size={14} />
                          {t("owner.completeBooking")}
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}

      {/* Schedule view */}
      {viewMode === "schedule" && venueId && (
        <ScheduleGrid venueId={venueId} onSlotTap={handleSlotTap} />
      )}

      {/* FAB — Add Booking */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setPrefill(undefined);
          setShowModal(true);
        }}
        className="fixed bottom-20 end-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-white shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
        aria-label={t("owner.addBooking")}
      >
        <Plus size={24} />
      </motion.button>

      {/* Manual Booking Modal */}
      <AnimatePresence>
        {showModal && (
          <ManualBookingModal
            courts={courts}
            onClose={() => {
              setShowModal(false);
              setPrefill(undefined);
            }}
            onBookingCreated={handleBookingCreated}
            prefill={prefill}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
