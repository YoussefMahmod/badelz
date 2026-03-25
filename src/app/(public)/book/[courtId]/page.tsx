"use client";

import { use, useState, useEffect, useMemo } from "react";
import { track } from "@/lib/analytics";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  User,
  CheckCircle,
} from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { TimeSlotPicker } from "@/components/time-slot-picker";
import { BookingForm } from "@/components/booking-form";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAvailableSlots } from "@/hooks/use-available-slots";
import { useAuth } from "@/lib/auth-context";
import { useTranslation, useLocale } from "@/i18n";
import { formatPrice, formatDate, formatTime, getNext7Days, toDateString, formatDateShort } from "@/lib/format";
import { stepTransition } from "@/lib/animations";

const STEPS = [
  { icon: CalendarDays, key: "date", labelKey: "booking.selectDate" },
  { icon: Clock, key: "time", labelKey: "booking.selectTime" },
  { icon: User, key: "info", labelKey: "booking.yourInfo" },
  { icon: CheckCircle, key: "confirm", labelKey: "booking.summary" },
] as const;

interface CourtInfo {
  id: string;
  name: string;
  nameAr: string | null;
  pricePerHour: string;
  venue: {
    id: string;
    name: string;
    nameAr: string | null;
  };
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ courtId: string }>;
}) {
  const { courtId } = use(params);
  const { t } = useTranslation();
  const { locale, dir } = useLocale();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(0);
  const [court, setCourt] = useState<CourtInfo | null>(null);
  const [courtLoading, setCourtLoading] = useState(true);

  const days = useMemo(() => getNext7Days(), []);
  const [selectedDate, setSelectedDate] = useState(toDateString(days[0]));
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [playerInfo, setPlayerInfo] = useState({ name: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  // Fetch court info
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/courts/${courtId}`);
        const json = await res.json();
        if (cancelled) return;

        if (res.ok && json.data) {
          setCourt({
            id: json.data.id,
            name: json.data.name,
            nameAr: json.data.nameAr,
            pricePerHour: json.data.pricePerHour,
            venue: json.data.venue,
          });
        }
      } catch {
        // error handled by UI
      } finally {
        if (!cancelled) setCourtLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [courtId]);

  const venueId = court?.venue?.id || "";
  const { slots, loading: slotsLoading } = useAvailableSlots(
    venueId,
    courtId,
    selectedDate
  );

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const courtName = locale === "ar" && court?.nameAr ? court.nameAr : court?.name || "";
  const venueName = locale === "ar" && court?.venue?.nameAr ? court.venue.nameAr : court?.venue?.name || "";
  const price = court ? parseFloat(court.pricePerHour) : 0;

  const isToday = (date: string) => date === toDateString(days[0]);
  const isTomorrow = (date: string) => date === toDateString(days[1]);

  const getDayLabel = (date: Date): string => {
    const ds = toDateString(date);
    if (isToday(ds)) return t("booking.today");
    if (isTomorrow(ds)) return t("booking.tomorrow");
    return formatDateShort(date, locale === "ar" ? "ar-EG" : "en-US");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlotId(null);
  };

  const canProceed = () => {
    if (step === 0) return !!selectedDate;
    if (step === 1) return !!selectedSlotId;
    if (step === 2) return !!playerInfo.name && !!playerInfo.phone;
    return true;
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!court || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId,
          date: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          playerName: playerInfo.name,
          playerPhone: playerInfo.phone,
          notes: playerInfo.notes || undefined,
        }),
      });

      const json = await res.json();

      if (res.ok && json.data?.id) {
        if (typeof window !== "undefined") {
          localStorage.setItem("badelz-player-phone", playerInfo.phone);
        }
        track.bookingCompleted({ venueId: court?.venue?.id || "", courtId, price, date: selectedDate });
        router.push(`/booking-confirmed/${json.data.id}`);
      } else {
        setSubmitError(json.message || t("common.error"));
      }
    } catch {
      setSubmitError(t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const progressWidth = ((step + 1) / STEPS.length) * 100;

  if (courtLoading) {
    return (
      <MainLayout showNav={false}>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout showNav={false}>
      <div className="mx-auto max-w-lg px-4 py-5">
        {/* Back + title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white/90 hover:border-white/20 transition-colors"
            aria-label={t("common.back")}
          >
            <ArrowRight size={18} className={dir === "ltr" ? "rotate-180" : ""} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white/90">{t("booking.title")}</h1>
            <p className="text-xs text-white/40">
              {venueName} - {courtName}
            </p>
          </div>
        </motion.div>

        {/* Progress bar step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, idx) => {
              const isActive = idx === step;
              const isDone = idx < step;
              return (
                <div key={s.key} className="flex flex-col items-center gap-1">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white"
                        : isDone
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/5 text-white/30"
                    }`}
                  >
                    <s.icon size={14} />
                  </motion.div>
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isActive
                        ? "text-white/90"
                        : isDone
                          ? "text-emerald-400/70"
                          : "text-white/30"
                    }`}
                  >
                    {t(s.labelKey as Parameters<typeof t>[0])}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress track */}
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              initial={{ width: "25%" }}
              animate={{ width: `${progressWidth}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Steps content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-date"
              {...stepTransition}
            >
              <h2 className="text-base font-bold text-white/70 mb-4">
                {t("booking.selectDate")}
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                {days.map((day) => {
                  const ds = toDateString(day);
                  const active = ds === selectedDate;
                  const dayName = getDayLabel(day);
                  const monthAbbr = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", { month: "short" }).format(day);
                  return (
                    <motion.button
                      key={ds}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDateSelect(ds)}
                      className={`flex flex-col items-center gap-0.5 rounded-2xl py-5 transition-all ${
                        active
                          ? "bg-gradient-to-b from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                          : "border border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <span className={`text-[10px] font-medium ${active ? "text-white/70" : "text-white/40"}`}>
                        {dayName}
                      </span>
                      <span className={`text-xl font-bold ${active ? "text-white" : "text-white/90"}`}>
                        {day.getDate()}
                      </span>
                      <span className={`text-[10px] ${active ? "text-white/50" : "text-white/30"}`}>
                        {monthAbbr}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-time"
              {...stepTransition}
            >
              <h2 className="text-base font-bold text-white/70 mb-4">
                {t("booking.selectTime")}
              </h2>
              <TimeSlotPicker
                slots={slots}
                selectedSlot={selectedSlotId}
                onSelect={setSelectedSlotId}
                loading={slotsLoading}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-info"
              {...stepTransition}
            >
              <h2 className="text-base font-bold text-white/70 mb-4">
                {t("booking.yourInfo")}
              </h2>
              <BookingForm
                onSubmit={(data) => {
                  setPlayerInfo(data);
                  setStep(3);
                }}
                initialName={isAuthenticated && user?.name ? user.name : ""}
                initialPhone={isAuthenticated && user?.phone ? user.phone : ""}
                authenticatedName={isAuthenticated && user?.name ? user.name : undefined}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-confirm"
              {...stepTransition}
            >
              <h2 className="text-base font-bold text-white/70 mb-4">
                {t("booking.summary")}
              </h2>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 space-y-3.5 mb-6">
                <SummaryRow label={t("booking.court")} value={`${venueName} - ${courtName}`} />
                <SummaryRow
                  label={t("booking.date")}
                  value={formatDate(selectedDate, locale === "ar" ? "ar-EG" : "en-US")}
                />
                {selectedSlot && (
                  <SummaryRow
                    label={t("booking.time")}
                    value={`${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`}
                  />
                )}
                <SummaryRow
                  label={t("booking.price")}
                  value={formatPrice(price)}
                  highlight
                />
                <div className="border-t border-white/10 pt-3.5 space-y-2">
                  <SummaryRow label={t("booking.name")} value={playerInfo.name} />
                  <SummaryRow label={t("booking.phone")} value={playerInfo.phone} />
                  {playerInfo.notes && (
                    <SummaryRow label={t("booking.notes")} value={playerInfo.notes} />
                  )}
                </div>
              </div>

              {submitError && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 text-center">
                  {submitError}
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 disabled:opacity-50"
              >
                {submitting ? t("common.loading") : t("booking.confirmBooking")}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button for steps 0 and 1 */}
        {(step === 0 || step === 1) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t("common.next")}
            </motion.button>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-white/40 shrink-0">{label}</span>
      <span
        className={`text-end ${highlight ? "font-bold text-emerald-400" : "text-white/70 font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}
