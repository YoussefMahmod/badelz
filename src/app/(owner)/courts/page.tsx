"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  RectangleHorizontal,
  ToggleLeft,
  ToggleRight,
  X,
  Clock,
  Pencil,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/i18n";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { formatPrice, formatTime } from "@/lib/format";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";

// ─── Types ───────────────────────────────────────────────

interface Court {
  id: string;
  name: string;
  nameAr: string | null;
  pricePerHour: string;
  isActive: boolean;
  sortOrder: number;
}

interface FeedbackMessage {
  type: "success" | "error";
  text: string;
}

// ─── Constants ───────────────────────────────────────────

function generateTimeOptions(includeEnd: boolean): string[] {
  const times: string[] = [];
  // 06:00 to 23:30 same day
  for (let h = 6; h < 24; h++) {
    times.push(`${h.toString().padStart(2, "0")}:00`);
    times.push(`${h.toString().padStart(2, "0")}:30`);
  }
  // Next day: 00:00 to 01:30 (for start) or 02:00 (for end)
  times.push("00:00");
  times.push("00:30");
  times.push("01:00");
  times.push("01:30");
  if (includeEnd) {
    times.push("02:00");
  }
  return times;
}

const START_TIMES = generateTimeOptions(false);
const END_TIMES = generateTimeOptions(true).filter((t) => t !== "06:00");

// ─── Inline Feedback Component ───────────────────────────

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

// ─── Schedule Config Modal ──────────────────────────────

interface SlotModalProps {
  court: Court;
  venueId: string;
  onClose: () => void;
}

function SlotManagementModal({ court, venueId, onClose }: SlotModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  // Schedule config state
  const [slotDuration, setSlotDuration] = useState<30 | 60>(60);
  const [sameForAllDays, setSameForAllDays] = useState(true);
  const [allStart, setAllStart] = useState("08:00");
  const [allEnd, setAllEnd] = useState("23:00");
  const [weekdaysStart, setWeekdaysStart] = useState("10:00");
  const [weekdaysEnd, setWeekdaysEnd] = useState("23:00");
  const [weekendsStart, setWeekendsStart] = useState("08:00");
  const [weekendsEnd, setWeekendsEnd] = useState("23:00");

  const showFeedback = useCallback(
    (type: "success" | "error", text: string) => {
      setFeedback({ type, text });
      setTimeout(() => setFeedback(null), 3000);
    },
    []
  );

  // Load existing schedule
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/venues/${venueId}/courts/${court.id}/schedule`
        );
        const json = await res.json();
        if (res.ok && json.data?.length > 0) {
          const schedules = json.data;
          const allSchedule = schedules.find((s: { dayGroup: string }) => s.dayGroup === "all");
          const weekdaysSchedule = schedules.find((s: { dayGroup: string }) => s.dayGroup === "weekdays");
          const weekendsSchedule = schedules.find((s: { dayGroup: string }) => s.dayGroup === "weekends");

          if (allSchedule) {
            setSameForAllDays(true);
            setAllStart(allSchedule.startTime);
            setAllEnd(allSchedule.endTime);
            setSlotDuration(allSchedule.slotDuration);
          } else if (weekdaysSchedule || weekendsSchedule) {
            setSameForAllDays(false);
            if (weekdaysSchedule) {
              setWeekdaysStart(weekdaysSchedule.startTime);
              setWeekdaysEnd(weekdaysSchedule.endTime);
              setSlotDuration(weekdaysSchedule.slotDuration);
            }
            if (weekendsSchedule) {
              setWeekendsStart(weekendsSchedule.startTime);
              setWeekendsEnd(weekendsSchedule.endTime);
            }
          }
        }
      } catch {
        // Will show empty form
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [venueId, court.id]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);

    const body: Record<string, unknown> = { slotDuration };
    if (sameForAllDays) {
      body.all = { startTime: allStart, endTime: allEnd };
    } else {
      body.weekdays = { startTime: weekdaysStart, endTime: weekdaysEnd };
      body.weekends = { startTime: weekendsStart, endTime: weekendsEnd };
    }

    try {
      const res = await fetch(
        `/api/venues/${venueId}/courts/${court.id}/schedule`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (res.ok) {
        showFeedback("success", t("owner.slotSaved"));
        setTimeout(onClose, 800);
      } else {
        const json = await res.json();
        showFeedback("error", json.message || t("common.error"));
      }
    } catch {
      showFeedback("error", t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  // Preview: compute slot count
  const computeSlotCount = (start: string, end: string) => {
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    return Math.max(0, Math.floor((endMin - startMin) / slotDuration));
  };

  const previewCount = sameForAllDays
    ? computeSlotCount(allStart, allEnd)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative z-10 w-full sm:max-w-lg bg-[#111827] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white/90">
              {t("owner.manageSlots")}
            </h2>
            <p className="text-sm text-white/50">
              {court.nameAr || court.name}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 transition-colors"
            aria-label={t("common.close")}
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-24 space-y-5">
          {loading ? (
            <div className="py-8"><LoadingSpinner size="sm" /></div>
          ) : (
            <>
              {/* Slot duration toggle */}
              <div>
                <label className="text-xs font-semibold text-white/50 mb-2 block">
                  {t("owner.slotDuration") || "مدة الفترة"}
                </label>
                <div className="flex rounded-xl border border-white/10 overflow-hidden">
                  <button
                    onClick={() => setSlotDuration(60)}
                    className={`flex-1 py-3 text-sm font-bold transition-all ${
                      slotDuration === 60
                        ? "bg-[#c8ff00] text-[#111827]"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    1 {t("common.hour") || "ساعة"}
                  </button>
                  <button
                    onClick={() => setSlotDuration(30)}
                    className={`flex-1 py-3 text-sm font-bold transition-all ${
                      slotDuration === 30
                        ? "bg-[#c8ff00] text-[#111827]"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    30 {t("common.minutes") || "دقيقة"}
                  </button>
                </div>
              </div>

              {/* Same for all days toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">
                  {t("owner.sameAllDays") || "نفس المواعيد كل الأيام"}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSameForAllDays(!sameForAllDays)}
                >
                  {sameForAllDays ? (
                    <ToggleRight size={32} className="text-[#c8ff00]" />
                  ) : (
                    <ToggleLeft size={32} className="text-white/30" />
                  )}
                </motion.button>
              </div>

              {sameForAllDays ? (
                /* All days config */
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <p className="text-xs font-semibold text-white/50">
                    {t("owner.operatingHours") || "ساعات العمل"}
                  </p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-white/40 mb-1 block">{t("owner.startTime")}</label>
                      <select
                        value={allStart}
                        onChange={(e) => setAllStart(e.target.value)}
                        dir="ltr"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] appearance-none"
                      >
                        {START_TIMES.map((time) => (
                          <option key={`all-s-${time}`} value={time}>{formatTime(time)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-white/40 mb-1 block">{t("owner.endTime")}</label>
                      <select
                        value={allEnd}
                        onChange={(e) => setAllEnd(e.target.value)}
                        dir="ltr"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] appearance-none"
                      >
                        {END_TIMES.map((time) => (
                          <option key={`all-e-${time}`} value={time}>{formatTime(time)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {previewCount !== null && (
                    <p className="text-xs text-white/30 text-center mt-2">
                      {previewCount} {slotDuration === 60 ? (t("owner.slotsPerDay") || "فترة/يوم") : (t("owner.slotsPerDay") || "فترة/يوم")}
                    </p>
                  )}
                </div>
              ) : (
                /* Weekdays / Weekends split */
                <div className="space-y-3">
                  {/* Weekdays */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <p className="text-xs font-semibold text-white/50">
                      {t("owner.weekdays") || "أيام الأسبوع"} (أحد - خميس)
                    </p>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-white/40 mb-1 block">{t("owner.startTime")}</label>
                        <select
                          value={weekdaysStart}
                          onChange={(e) => setWeekdaysStart(e.target.value)}
                          dir="ltr"
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] appearance-none"
                        >
                          {START_TIMES.map((time) => (
                            <option key={`wd-s-${time}`} value={time}>{formatTime(time)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-white/40 mb-1 block">{t("owner.endTime")}</label>
                        <select
                          value={weekdaysEnd}
                          onChange={(e) => setWeekdaysEnd(e.target.value)}
                          dir="ltr"
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] appearance-none"
                        >
                          {END_TIMES.map((time) => (
                            <option key={`wd-e-${time}`} value={time}>{formatTime(time)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-white/30 text-center">
                      {computeSlotCount(weekdaysStart, weekdaysEnd)} {t("owner.slotsPerDay") || "فترة/يوم"}
                    </p>
                  </div>

                  {/* Weekends */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <p className="text-xs font-semibold text-white/50">
                      {t("owner.weekends") || "الويكند"} (جمعة - سبت)
                    </p>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-white/40 mb-1 block">{t("owner.startTime")}</label>
                        <select
                          value={weekendsStart}
                          onChange={(e) => setWeekendsStart(e.target.value)}
                          dir="ltr"
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] appearance-none"
                        >
                          {START_TIMES.map((time) => (
                            <option key={`we-s-${time}`} value={time}>{formatTime(time)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-white/40 mb-1 block">{t("owner.endTime")}</label>
                        <select
                          value={weekendsEnd}
                          onChange={(e) => setWeekendsEnd(e.target.value)}
                          dir="ltr"
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] appearance-none"
                        >
                          {END_TIMES.map((time) => (
                            <option key={`we-e-${time}`} value={time}>{formatTime(time)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-white/30 text-center">
                      {computeSlotCount(weekendsStart, weekendsEnd)} {t("owner.slotsPerDay") || "فترة/يوم"}
                    </p>
                  </div>
                </div>
              )}

              <InlineFeedback message={feedback} />

              {/* Save button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#c8ff00] py-3 text-sm font-bold text-[#111827] transition-all hover:bg-[#c8ff00]/80 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <motion.div
                      className="h-4 w-4 rounded-full border-2 border-[#111827]/30 border-t-[#111827]"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                    />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    {t("common.save")}
                  </>
                )}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Helper ─────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// ─── Court Card Component ───────────────────────────────

interface CourtCardProps {
  court: Court;
  venueId: string;
  slotCount: number;
  onToggleActive: (court: Court) => void;
  onOpenSlots: (court: Court) => void;
  onCourtUpdated: () => void;
}

function CourtCard({
  court,
  venueId,
  slotCount,
  onToggleActive,
  onOpenSlots,
  onCourtUpdated,
}: CourtCardProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(court.name);
  const [editNameAr, setEditNameAr] = useState(court.nameAr || "");
  const [editPrice, setEditPrice] = useState(court.pricePerHour);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const showFeedback = useCallback(
    (type: "success" | "error", text: string) => {
      setFeedback({ type, text });
      setTimeout(() => setFeedback(null), 3000);
    },
    []
  );

  const handleStartEdit = () => {
    setEditName(court.name);
    setEditNameAr(court.nameAr || "");
    setEditPrice(court.pricePerHour);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setFeedback(null);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editPrice) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/venues/${venueId}/courts/${court.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          nameAr: editNameAr.trim() || undefined,
          pricePerHour: parseFloat(editPrice),
        }),
      });
      if (res.ok) {
        showFeedback("success", t("owner.courtUpdated"));
        setTimeout(() => {
          setEditing(false);
          onCourtUpdated();
        }, 800);
      } else {
        showFeedback("error", t("common.error"));
      }
    } catch {
      showFeedback("error", t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      variants={staggerItem}
      layout
      className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-opacity ${
        !court.isActive ? "opacity-50" : ""
      }`}
    >
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Court icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c8ff00]/15">
            <RectangleHorizontal size={22} className="text-[#c8ff00]" />
          </div>

          {/* Court info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base font-bold text-white/90 truncate">
                {court.nameAr || court.name}
              </h3>
              {court.nameAr && (
                <span className="text-xs text-white/40 truncate" dir="ltr">
                  {court.name}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-white/70">
              {formatPrice(parseFloat(court.pricePerHour))}{" "}
              <span className="text-white/40 font-normal">
                {t("common.perHour")}
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleStartEdit}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
              aria-label={t("owner.editCourt")}
            >
              <Pencil size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => onToggleActive(court)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 transition-colors"
              aria-label={
                court.isActive ? t("owner.active") : t("owner.inactive")
              }
            >
              {court.isActive ? (
                <ToggleRight size={26} className="text-green-500" />
              ) : (
                <ToggleLeft size={26} className="text-white/20" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Status & slot count row */}
        <div className="flex items-center gap-2 mt-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              court.isActive
                ? "bg-green-500/10 text-green-400"
                : "bg-white/5 text-white/40"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                court.isActive ? "bg-green-500" : "bg-white/30"
              }`}
            />
            {court.isActive ? t("owner.active") : t("owner.inactive")}
          </span>

          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            slotCount > 0 ? "bg-[#c8ff00]/10 text-[#c8ff00]" : "bg-white/5 text-white/40"
          }`}>
            <Clock size={11} />
            {slotCount > 0
              ? (t("owner.scheduleSet") || "الجدول محدد")
              : (t("owner.noSchedule") || "بدون جدول")}
          </span>
        </div>
      </div>

      {/* Inline edit form (expandable) */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 bg-white/5 px-4 py-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Pencil size={13} className="text-white/40" />
                <span className="text-xs font-semibold text-white/50">
                  {t("owner.editCourt")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">
                    {t("owner.courtName")}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    dir="ltr"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-shadow"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">
                    {t("owner.courtNameAr")}
                  </label>
                  <input
                    type="text"
                    value={editNameAr}
                    onChange={(e) => setEditNameAr(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block">
                  {t("owner.pricePerHour")} (EGP)
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  min="1"
                  dir="ltr"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-shadow"
                />
              </div>

              <InlineFeedback message={feedback} />

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveEdit}
                  disabled={saving || !editName.trim() || !editPrice}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#c8ff00] py-2.5 text-sm font-bold text-[#111827] transition-all hover:bg-[#c8ff00]/80 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <motion.div
                        className="h-4 w-4 rounded-full border-2 border-[#111827]/30 border-t-[#111827]"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      {t("common.loading")}
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      {t("common.save")}
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancelEdit}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/10 transition-colors"
                >
                  {t("common.cancel")}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage slots button */}
      <div className="border-t border-white/5">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onOpenSlots(court)}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#c8ff00] hover:bg-white/5 transition-colors"
        >
          <Clock size={15} />
          {t("owner.manageSlots")}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ────────────────────────────────

export default function CourtsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [slotModal, setSlotModal] = useState<Court | null>(null);
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});

  // Add court form state
  const [formName, setFormName] = useState("");
  const [formNameAr, setFormNameAr] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addFeedback, setAddFeedback] = useState<FeedbackMessage | null>(null);

  const showAddFeedback = useCallback(
    (type: "success" | "error", text: string) => {
      setAddFeedback({ type, text });
      setTimeout(() => setAddFeedback(null), 3000);
    },
    []
  );

  const fetchCourts = useCallback(async () => {
    try {
      const venuesRes = await fetch("/api/venues?limit=1&mine=true");
      const venuesJson = await venuesRes.json();
      const ownerVenue = (venuesJson.data || [])[0];

      if (!ownerVenue) {
        setLoading(false);
        return;
      }

      setVenueId(ownerVenue.id);

      const courtsRes = await fetch(`/api/venues/${ownerVenue.id}/courts`);
      const courtsJson = await courtsRes.json();
      const fetchedCourts: Court[] = courtsJson.data || [];
      setCourts(fetchedCourts);

      // Fetch schedule info for all courts in parallel
      const counts: Record<string, number> = {};
      await Promise.all(
        fetchedCourts.map(async (court) => {
          try {
            const schedRes = await fetch(
              `/api/venues/${ownerVenue.id}/courts/${court.id}/schedule`
            );
            const schedJson = await schedRes.json();
            // Count schedule templates (1 = all days, 2 = weekdays+weekends)
            counts[court.id] = (schedJson.data || []).length;
          } catch {
            counts[court.id] = 0;
          }
        })
      );
      setSlotCounts(counts);
    } catch {
      // Network error — page will show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  const handleAddCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueId || !formName.trim() || !formPrice) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/venues/${venueId}/courts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          nameAr: formNameAr.trim() || undefined,
          pricePerHour: parseFloat(formPrice),
        }),
      });

      if (res.ok) {
        setFormName("");
        setFormNameAr("");
        setFormPrice("");
        setShowAddForm(false);
        setAddFeedback(null);
        fetchCourts();
      } else {
        showAddFeedback("error", t("common.error"));
      }
    } catch {
      showAddFeedback("error", t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (court: Court) => {
    if (!venueId) return;
    // Optimistic update
    setCourts((prev) =>
      prev.map((c) =>
        c.id === court.id ? { ...c, isActive: !c.isActive } : c
      )
    );
    try {
      const res = await fetch(`/api/venues/${venueId}/courts/${court.id}`, {
        method: court.isActive ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: court.isActive ? undefined : JSON.stringify({ isActive: true }),
      });
      if (!res.ok) {
        // Revert on failure
        setCourts((prev) =>
          prev.map((c) =>
            c.id === court.id ? { ...c, isActive: court.isActive } : c
          )
        );
      }
    } catch {
      // Revert on failure
      setCourts((prev) =>
        prev.map((c) =>
          c.id === court.id ? { ...c, isActive: court.isActive } : c
        )
      );
    }
  };

  const handleOpenSlots = (court: Court) => {
    setSlotModal(court);
  };

  const handleCloseSlotModal = () => {
    setSlotModal(null);
    // Refresh slot counts after modal closes
    fetchCourts();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 pb-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-xl font-bold text-white/90">
            {t("owner.manageCourts")}
          </h1>
          {courts.length > 0 && (
            <p className="text-sm text-white/40 mt-0.5">
              {courts.length}{" "}
              {courts.length === 1 ? "court" : "courts"}
            </p>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 rounded-full bg-[#c8ff00] px-4 py-2.5 text-sm font-semibold text-[#111827] shadow-sm hover:bg-[#c8ff00]/80 transition-colors"
        >
          <Plus size={16} />
          {t("owner.addCourt")}
        </motion.button>
      </motion.div>

      {/* Add court form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-6"
          >
            <form
              onSubmit={handleAddCourt}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-white/90">
                  {t("owner.addCourt")}
                </h3>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setShowAddForm(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">
                    {t("owner.courtName")}
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    dir="ltr"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-shadow"
                    placeholder="Court 1"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">
                    {t("owner.courtNameAr")}
                  </label>
                  <input
                    type="text"
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-shadow"
                    placeholder="كورت ١"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block">
                  {t("owner.pricePerHour")} (EGP)
                </label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  required
                  min="1"
                  dir="ltr"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-shadow"
                  placeholder="300"
                />
              </div>

              <InlineFeedback message={addFeedback} />

              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#c8ff00] py-2.5 text-sm font-bold text-[#111827] transition-all hover:bg-[#c8ff00]/80 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <motion.div
                      className="h-4 w-4 rounded-full border-2 border-[#111827]/30 border-t-[#111827]"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    {t("common.loading")}
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    {t("common.save")}
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Courts list */}
      {courts.length === 0 ? (
        <EmptyState
          icon={<RectangleHorizontal size={28} />}
          title={t("venue.noCourts")}
          action={{
            label: t("owner.addCourt"),
            onClick: () => setShowAddForm(true),
          }}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {courts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              venueId={venueId!}
              slotCount={slotCounts[court.id] || 0}
              onToggleActive={toggleActive}
              onOpenSlots={handleOpenSlots}
              onCourtUpdated={fetchCourts}
            />
          ))}
        </motion.div>
      )}

      {/* Slot management modal */}
      <AnimatePresence>
        {slotModal && venueId && (
          <SlotManagementModal
            court={slotModal}
            venueId={venueId}
            onClose={handleCloseSlotModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
