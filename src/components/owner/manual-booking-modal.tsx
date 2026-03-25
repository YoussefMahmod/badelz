"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { formatPrice, formatTime } from "@/lib/format";

// ─── Types ───────────────────────────────────────────────

interface Court {
  id: string;
  name: string;
  nameAr: string | null;
  pricePerHour: string | number;
}

interface ManualBookingModalProps {
  courts: Court[];
  onClose: () => void;
  onBookingCreated: () => void;
  prefill?: {
    courtId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  };
}

interface FeedbackMessage {
  type: "success" | "error";
  text: string;
}

// ─── Time Generation ─────────────────────────────────────

function generateTimeOptions(): string[] {
  const times: string[] = [];
  // 06:00 to 23:30
  for (let h = 6; h < 24; h++) {
    times.push(`${h.toString().padStart(2, "0")}:00`);
    times.push(`${h.toString().padStart(2, "0")}:30`);
  }
  // Next day: 00:00 to 02:00
  times.push("00:00");
  times.push("00:30");
  times.push("01:00");
  times.push("01:30");
  times.push("02:00");
  return times;
}

const TIME_OPTIONS = generateTimeOptions();

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  // Treat 00:00–02:00 as next day (24:00–26:00)
  const adjusted = h < 6 ? h + 24 : h;
  return adjusted * 60 + m;
}

function todayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ─── Inline Feedback ─────────────────────────────────────

function InlineFeedback({ message }: { message: FeedbackMessage | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <Check size={14} className="shrink-0" />
          ) : (
            <X size={14} className="shrink-0" />
          )}
          {message.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Modal Component ─────────────────────────────────────

export function ManualBookingModal({
  courts,
  onClose,
  onBookingCreated,
  prefill,
}: ManualBookingModalProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  // Form state
  const [courtId, setCourtId] = useState(prefill?.courtId ?? courts[0]?.id ?? "");
  const [date, setDate] = useState(prefill?.date ?? todayDateString());
  const [startTime, setStartTime] = useState(prefill?.startTime ?? "18:00");
  const [endTime, setEndTime] = useState(prefill?.endTime ?? "19:00");
  const [playerName, setPlayerName] = useState("");
  const [playerPhone, setPlayerPhone] = useState("");
  const [notes, setNotes] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [shakeError, setShakeError] = useState(false);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const showFeedback = useCallback(
    (type: "success" | "error", text: string) => {
      setFeedback({ type, text });
      if (type === "error") {
        setTimeout(() => setFeedback(null), 5000);
      }
    },
    []
  );

  // Selected court object
  const selectedCourt = useMemo(
    () => courts.find((c) => c.id === courtId),
    [courts, courtId]
  );

  // Auto-calculated price
  const calculatedPrice = useMemo(() => {
    if (!selectedCourt || !startTime || !endTime) return null;

    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    const durationMinutes = endMin - startMin;

    if (durationMinutes <= 0) return null;

    const pricePerHour =
      typeof selectedCourt.pricePerHour === "string"
        ? parseFloat(selectedCourt.pricePerHour)
        : selectedCourt.pricePerHour;

    return pricePerHour * (durationMinutes / 60);
  }, [selectedCourt, startTime, endTime]);

  // Court display name based on locale
  const courtDisplayName = useCallback(
    (court: Court) => {
      return locale === "ar" && court.nameAr ? court.nameAr : court.name;
    },
    [locale]
  );

  const handleSubmit = async () => {
    if (submitting || !courtId || !playerName.trim()) return;

    setSubmitting(true);
    setFeedback(null);
    setShakeError(false);

    try {
      const res = await fetch("/api/owner/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId,
          date,
          startTime,
          endTime,
          playerName: playerName.trim(),
          playerPhone: playerPhone.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (res.status === 201) {
        showFeedback("success", t("owner.bookingCreated"));
        onBookingCreated();
        setTimeout(() => onClose(), 1500);
        return;
      }

      if (res.status === 409) {
        setShakeError(true);
        showFeedback("error", t("owner.conflictError"));
        setTimeout(() => setShakeError(false), 600);
      } else {
        const json = await res.json();
        showFeedback("error", json.message || t("common.error"));
      }
    } catch {
      showFeedback("error", t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#c8ff00]/50 transition-all";

  // Filter end times to only show those after start time
  const validEndTimes = useMemo(() => {
    const startMin = timeToMinutes(startTime);
    return TIME_OPTIONS.filter((t) => timeToMinutes(t) > startMin);
  }, [startTime]);

  // If current endTime is not valid after changing startTime, auto-correct
  useEffect(() => {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    if (endMin <= startMin && validEndTimes.length > 0) {
      setEndTime(validEndTimes[0]);
    }
  }, [startTime, endTime, validEndTimes]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        role="dialog"
        aria-modal="true"
        aria-label={t("owner.manualBooking")}
        className="relative z-10 w-full sm:max-w-lg bg-[#111827] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-white/10">
          <h2 className="text-lg font-bold text-white/90">
            {t("owner.manualBooking")}
          </h2>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 transition-colors"
            aria-label={t("common.close")}
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Feedback */}
          <InlineFeedback message={feedback} />

          {/* 1. Court pills */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50">
              {t("owner.selectCourt")}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {courts.map((court) => {
                const isSelected = court.id === courtId;
                return (
                  <motion.button
                    key={court.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCourtId(court.id)}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      isSelected
                        ? "bg-[#c8ff00] text-[#111827]"
                        : "bg-white/10 text-white/60 hover:bg-white/15"
                    }`}
                  >
                    {courtDisplayName(court)}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 2. Date input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50">
              {t("owner.filterByDate")}
            </label>
            <input
              type="date"
              dir="ltr"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={todayDateString()}
              className={inputClassName}
            />
          </div>

          {/* 3. Start/End time selects */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50">
                {t("owner.startTime")}
              </label>
              <select
                dir="ltr"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClassName}
              >
                {TIME_OPTIONS.filter((t) => t !== "02:00").map((time) => (
                  <option key={`start-${time}`} value={time}>
                    {formatTime(time)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50">
                {t("owner.endTime")}
              </label>
              <select
                dir="ltr"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputClassName}
              >
                {validEndTimes.map((time) => (
                  <option key={`end-${time}`} value={time}>
                    {formatTime(time)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Auto-calculated price */}
          <AnimatePresence>
            {calculatedPrice !== null && calculatedPrice > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3"
              >
                <span className="text-sm text-emerald-400/70">
                  {t("owner.calculatedPrice")}
                </span>
                <span className="text-base font-bold text-emerald-400" dir="ltr">
                  {formatPrice(calculatedPrice, locale === "ar" ? "ar-EG" : "en-EG")}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. Player name */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50">
              {t("owner.playerName")} <span className="text-red-400">*</span>
            </label>
            <motion.div animate={shakeError ? { x: [0, -6, 6, -6, 6, 0] } : {}}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={t("owner.playerName")}
                className={inputClassName}
                required
              />
            </motion.div>
          </div>

          {/* 6. Player phone */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50">
              {t("owner.playerPhone")}
            </label>
            <input
              type="tel"
              dir="ltr"
              value={playerPhone}
              onChange={(e) => setPlayerPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className={inputClassName}
            />
          </div>

          {/* 7. Notes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50">
              {t("owner.bookingNotes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("owner.notesPlaceholder")}
              rows={2}
              className={`${inputClassName} resize-none`}
            />
          </div>
        </div>

        {/* Sticky submit button */}
        <div className="px-5 pb-5 pt-3 border-t border-white/10 bg-[#111827]">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={submitting || !courtId || !playerName.trim()}
            className="w-full rounded-xl bg-[#c8ff00] py-3.5 text-sm font-bold text-[#111827] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {t("common.loading")}
              </span>
            ) : feedback?.type === "success" ? (
              <span className="flex items-center justify-center gap-2">
                <Check size={16} />
                {t("owner.bookingCreated")}
              </span>
            ) : (
              t("owner.createBooking")
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
