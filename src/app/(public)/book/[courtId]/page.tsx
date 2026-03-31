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
  Gauge,
} from "lucide-react";
import { LOBBY_LEVELS } from "@/lib/constants";
import { MainLayout } from "@/components/main-layout";
import { TimeSlotPicker } from "@/components/time-slot-picker";
import { BookingForm } from "@/components/booking-form";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAvailableSlots } from "@/hooks/use-available-slots";
import { usePolling } from "@/hooks/use-polling";
import { useAuth } from "@/lib/auth-context";
import { useTranslation, useLocale } from "@/i18n";
import { formatPrice, formatDate, formatTime, getNext7Days, toDateString, formatDateShort } from "@/lib/format";
import { stepFade } from "@/lib/animations";

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
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedBlockCount, setSelectedBlockCount] = useState(1);
  const [playerInfo, setPlayerInfo] = useState({ name: "", phone: "", notes: "" });
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
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
  const { slots, loading: slotsLoading, refetch: refetchSlots } = useAvailableSlots(
    venueId,
    courtId,
    selectedDate
  );

  // Poll slot availability every 10s while on time selection step
  usePolling(refetchSlots, 10000, step === 1 && !!selectedDate);

  const selectedSlot = slots.find((s) => s.startTime === selectedStartTime);

  const courtName = locale === "ar" && court?.nameAr ? court.nameAr : court?.name || "";
  const venueName = locale === "ar" && court?.venue?.nameAr ? court.venue.nameAr : court?.venue?.name || "";
  const pricePerHour = court ? parseFloat(court.pricePerHour) : 0;

  // Calculate total price based on blocks (supports variable per-slot pricing)
  const slotDuration = selectedSlot?.slotDuration || 60;
  const totalPrice = (() => {
    if (!selectedStartTime) return 0;
    const startIdx = slots.findIndex((s) => s.startTime === selectedStartTime);
    if (startIdx === -1) return pricePerHour * ((slotDuration * selectedBlockCount) / 60);
    let sum = 0;
    for (let i = 0; i < selectedBlockCount && startIdx + i < slots.length; i++) {
      const slot = slots[startIdx + i];
      const pph = typeof slot.pricePerHour === "string"
        ? parseFloat(slot.pricePerHour) : (slot.pricePerHour ?? pricePerHour);
      sum += pph * ((slot.slotDuration || 60) / 60);
    }
    return sum;
  })();
  const totalDurationMinutes = slotDuration * selectedBlockCount;

  // Computed end time for display
  const computedEndTime = selectedSlot
    ? (() => {
        const [h, m] = selectedSlot.startTime.split(":").map(Number);
        const endMin = h * 60 + m + totalDurationMinutes;
        const eh = Math.floor(endMin / 60);
        const em = endMin % 60;
        return `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
      })()
    : "";

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
    setSelectedStartTime(null);
    setSelectedBlockCount(1);
  };

  const canProceed = () => {
    if (step === 0) return !!selectedDate;
    if (step === 1) return !!selectedStartTime;
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
          blockCount: selectedBlockCount,
          playerName: playerInfo.name,
          playerPhone: playerInfo.phone,
          notes: playerInfo.notes || undefined,
          level: selectedLevel || undefined,
        }),
      });

      const json = await res.json();

      if (res.ok && json.data?.id) {
        if (typeof window !== "undefined") {
          localStorage.setItem("badelz-player-phone", playerInfo.phone);
        }
        track.bookingCompleted({ venueId: court?.venue?.id || "", courtId, price: totalPrice, date: selectedDate });
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

  // Duration label for summary
  const durationLabel = totalDurationMinutes >= 60
    ? locale === "ar"
      ? `${totalDurationMinutes / 60} ساعة`
      : `${totalDurationMinutes / 60}h`
    : locale === "ar"
      ? `${totalDurationMinutes} دقيقة`
      : `${totalDurationMinutes}m`;

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
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#333] text-[#666] hover:text-white hover:border-[#666] transition-colors"
            aria-label={t("common.back")}
          >
            <ArrowRight size={18} className={dir === "ltr" ? "rotate-180" : ""} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{t("booking.title")}</h1>
            <p className="text-xs text-[#666]">
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
                    className={`flex h-8 w-8 items-center justify-center rounded-sm transition-all duration-300 ${
                      isActive
                        ? "bg-[#d4ff00] text-[#0d0d0d]"
                        : isDone
                          ? "bg-[#d4ff00]/20 text-[#d4ff00]"
                          : "bg-[#1a1a1a] text-[#666]"
                    }`}
                  >
                    <s.icon size={14} />
                  </motion.div>
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : isDone
                          ? "text-[#d4ff00]/70"
                          : "text-[#666]"
                    }`}
                  >
                    {t(s.labelKey as Parameters<typeof t>[0])}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress track */}
          <div className="h-1.5 bg-[#333] overflow-hidden">
            <motion.div
              className="h-full bg-[#d4ff00]"
              initial={{ width: "25%" }}
              animate={{ width: `${progressWidth}%` }}
             
            />
          </div>
        </div>

        {/* Steps content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <div
              key="step-date"
              {...stepFade}
            >
              <h2 className="text-base font-bold text-[#999] mb-4">
                {t("booking.selectDate")}
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                {days.map((day) => {
                  const ds = toDateString(day);
                  const active = ds === selectedDate;
                  const dayName = getDayLabel(day);
                  const monthAbbr = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", { month: "short" }).format(day);
                  return (
                    <button
                      key={ds}
                      
                      onClick={() => handleDateSelect(ds)}
                      className={`flex flex-col items-center gap-0.5 rounded-sm py-5 transition-all active:scale-[0.97] transition-transform duration-75 ${
                        active
                          ? "bg-[#d4ff00] text-[#0d0d0d]"
                          : "border border-[#333] bg-[#1a1a1a] text-[#999] hover:border-[#666] hover:bg-[#222]"
                      }`}
                    >
                      <span className={`text-[10px] font-medium ${active ? "text-[#0d0d0d]/60" : "text-[#666]"}`}>
                        {dayName}
                      </span>
                      <span className={`text-xl font-bold ${active ? "text-[#0d0d0d]" : "text-white"}`}>
                        {day.getDate()}
                      </span>
                      <span className={`text-[10px] ${active ? "text-[#0d0d0d]/50" : "text-[#666]"}`}>
                        {monthAbbr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div
              key="step-time"
              {...stepFade}
            >
              <h2 className="text-base font-bold text-[#999] mb-4">
                {t("booking.selectTime")}
              </h2>
              <TimeSlotPicker
                slots={slots}
                selectedStartTime={selectedStartTime}
                selectedBlockCount={selectedBlockCount}
                onSelectTime={setSelectedStartTime}
                onSelectBlocks={setSelectedBlockCount}
                loading={slotsLoading}
              />
            </div>
          )}

          {step === 2 && (
            <div
              key="step-info"
              {...stepFade}
            >
              <h2 className="text-base font-bold text-[#999] mb-4">
                {t("booking.yourInfo")}
              </h2>

              {/* Level selector */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#999] mb-3">
                  <Gauge size={14} />
                  {locale === "ar" ? "مستوى اللعب" : "Skill Level"}
                  <span className="text-[10px] text-[#666] font-normal">
                    ({locale === "ar" ? "اختياري" : "optional"})
                  </span>
                </label>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedLevel(null)}
                    className={`shrink-0 rounded-sm px-4 py-2.5 text-xs font-semibold transition-all ${
                      selectedLevel === null
                        ? "bg-[#d4ff00] text-[#0d0d0d]"
                        : "border border-[#333] text-[#999] hover:text-[#999] hover:bg-[#222]"
                    }`}
                  >
                    {locale === "ar" ? "أي مستوى" : "Any Level"}
                  </button>
                  {LOBBY_LEVELS.map((lvl) => {
                    const isActive = selectedLevel === lvl.key;
                    const label = locale === "ar" ? lvl.labelAr : lvl.labelEn;
                    return (
                      <button
                        key={lvl.key}
                        type="button"
                        onClick={() => setSelectedLevel(isActive ? null : lvl.key)}
                        className={`shrink-0 rounded-sm px-4 py-2.5 text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-[#d4ff00] text-[#0d0d0d]"
                            : "border border-[#333] text-[#999] hover:text-[#999] hover:bg-[#222]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <BookingForm
                onSubmit={(data) => {
                  setPlayerInfo(data);
                  setStep(3);
                }}
                initialName={isAuthenticated && user?.name ? user.name : ""}
                initialPhone={isAuthenticated && user?.phone ? user.phone : ""}
                authenticatedName={isAuthenticated && user?.name ? user.name : undefined}
              />
            </div>
          )}

          {step === 3 && (
            <div
              key="step-confirm"
              {...stepFade}
            >
              <h2 className="text-base font-bold text-[#999] mb-4">
                {t("booking.summary")}
              </h2>

              <div className="bg-[#1a1a1a] rounded-sm border-s-[3px] border-s-[#d4ff00] p-5 space-y-3.5 mb-6">
                <SummaryRow label={t("booking.court")} value={`${venueName} - ${courtName}`} />
                <SummaryRow
                  label={t("booking.date")}
                  value={formatDate(selectedDate, locale === "ar" ? "ar-EG" : "en-US")}
                />
                {selectedSlot && (
                  <SummaryRow
                    label={t("booking.time")}
                    value={`${formatTime(selectedSlot.startTime)} - ${formatTime(computedEndTime)}`}
                  />
                )}
                {selectedBlockCount > 1 && (
                  <SummaryRow
                    label={locale === "ar" ? "المدة" : "Duration"}
                    value={durationLabel}
                  />
                )}
                <SummaryRow
                  label={t("booking.price")}
                  value={formatPrice(totalPrice)}
                  highlight
                />
                <div className="border-t border-[#333] pt-3.5 space-y-2">
                  <SummaryRow label={t("booking.name")} value={playerInfo.name} />
                  <SummaryRow label={t("booking.phone")} value={playerInfo.phone} />
                  {selectedLevel && (
                    <SummaryRow
                      label={locale === "ar" ? "المستوى" : "Level"}
                      value={
                        LOBBY_LEVELS.find((l) => l.key === selectedLevel)
                          ? locale === "ar"
                            ? LOBBY_LEVELS.find((l) => l.key === selectedLevel)!.labelAr
                            : LOBBY_LEVELS.find((l) => l.key === selectedLevel)!.labelEn
                          : selectedLevel
                      }
                    />
                  )}
                  {playerInfo.notes && (
                    <SummaryRow label={t("booking.notes")} value={playerInfo.notes} />
                  )}
                </div>
              </div>

              {/* Pending notice */}
              <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-center">
                <p className="text-xs text-amber-400/80">
                  {locale === "ar"
                    ? "الحجز هيكون في انتظار تأكيد الملعب"
                    : "Booking will be pending venue confirmation"}
                </p>
              </div>

              {submitError && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 text-center">
                  {submitError}
                </div>
              )}

              <button
                
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full rounded-sm bg-[#d4ff00] text-[#0d0d0d] py-4 text-lg font-bold uppercase transition-all disabled:opacity-50 active:scale-[0.97] transition-transform duration-75"
              >
                {submitting
                  ? t("common.loading")
                  : locale === "ar"
                    ? "إرسال طلب الحجز"
                    : "Send Booking Request"}
              </button>
            </div>
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
            <button
              
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="w-full rounded-sm bg-[#d4ff00] text-[#0d0d0d] py-4 text-lg font-bold uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t("common.next")}
            </button>
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
      <span className="text-[#666] shrink-0">{label}</span>
      <span
        className={`text-end ${highlight ? "font-bold text-[#d4ff00]" : "text-[#999] font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}
