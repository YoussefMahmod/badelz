"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  RectangleHorizontal,
  ToggleLeft,
  ToggleRight,
  X,
  Clock,
  Pencil,
  Trash2,
  Copy,
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

interface TimeSlot {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

type DayOfWeek =
  | "SATURDAY"
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

interface FeedbackMessage {
  type: "success" | "error";
  text: string;
}

// ─── Constants ───────────────────────────────────────────

const DAYS_ORDER: DayOfWeek[] = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

const DAY_TRANSLATION_KEYS = {
  SATURDAY: "owner.saturday",
  SUNDAY: "owner.sunday",
  MONDAY: "owner.monday",
  TUESDAY: "owner.tuesday",
  WEDNESDAY: "owner.wednesday",
  THURSDAY: "owner.thursday",
  FRIDAY: "owner.friday",
} as const;

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
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
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

// ─── Slot Management Modal ──────────────────────────────

interface SlotModalProps {
  court: Court;
  venueId: string;
  onClose: () => void;
}

function SlotManagementModal({ court, venueId, onClose }: SlotModalProps) {
  const { t } = useTranslation();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("SATURDAY");
  const [allSlots, setAllSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSlot, setAddingSlot] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const dayScrollRef = useRef<HTMLDivElement>(null);

  const showFeedback = useCallback(
    (type: "success" | "error", text: string) => {
      setFeedback({ type, text });
      setTimeout(() => setFeedback(null), 3000);
    },
    []
  );

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/venues/${venueId}/courts/${court.id}/slots?all=true`
      );
      const json = await res.json();
      if (res.ok) {
        setAllSlots(json.data || []);
      }
    } catch {
      showFeedback("error", t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [venueId, court.id, t, showFeedback]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const slotsForDay = allSlots
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => {
      const aMin = timeToMinutes(a.startTime);
      const bMin = timeToMinutes(b.startTime);
      return aMin - bMin;
    });

  const handleAddSlot = async () => {
    if (addingSlot) return;
    setAddingSlot(true);
    try {
      const res = await fetch(
        `/api/venues/${venueId}/courts/${court.id}/slots`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            { dayOfWeek: selectedDay, startTime, endTime },
          ]),
        }
      );
      if (res.ok) {
        showFeedback("success", t("owner.slotSaved"));
        await fetchSlots();
      } else {
        const json = await res.json();
        showFeedback("error", json.message || t("common.error"));
      }
    } catch {
      showFeedback("error", t("common.error"));
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (deletingSlotId) return;
    setDeletingSlotId(slotId);
    try {
      const res = await fetch(
        `/api/venues/${venueId}/courts/${court.id}/slots/${slotId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setAllSlots((prev) => prev.filter((s) => s.id !== slotId));
        showFeedback("success", t("owner.slotDeleted"));
      } else {
        showFeedback("error", t("common.error"));
      }
    } catch {
      showFeedback("error", t("common.error"));
    } finally {
      setDeletingSlotId(null);
    }
  };

  const handleCopyToAllDays = async () => {
    if (copying || slotsForDay.length === 0) return;
    setCopying(true);

    const otherDays = DAYS_ORDER.filter((d) => d !== selectedDay);
    const slotsToCreate = otherDays.flatMap((day) =>
      slotsForDay.map((slot) => ({
        dayOfWeek: day,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }))
    );

    try {
      const res = await fetch(
        `/api/venues/${venueId}/courts/${court.id}/slots`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slotsToCreate),
        }
      );
      if (res.ok) {
        showFeedback("success", t("owner.slotSaved"));
        await fetchSlots();
      } else {
        const json = await res.json();
        showFeedback("error", json.message || t("common.error"));
      }
    } catch {
      showFeedback("error", t("common.error"));
    } finally {
      setCopying(false);
    }
  };

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
        className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {t("owner.manageSlots")}
            </h2>
            <p className="text-sm text-gray-500">
              {court.nameAr || court.name}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            aria-label={t("common.close")}
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Day tabs */}
        <div
          ref={dayScrollRef}
          className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide border-b border-gray-100"
        >
          {DAYS_ORDER.map((day) => {
            const isSelected = day === selectedDay;
            const daySlotCount = allSlots.filter(
              (s) => s.dayOfWeek === day
            ).length;
            return (
              <motion.button
                key={day}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(day)}
                className={`relative shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#111827] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t(DAY_TRANSLATION_KEYS[day])}
                {daySlotCount > 0 && (
                  <span
                    className={`absolute -top-1.5 -end-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                      isSelected
                        ? "bg-[#c8ff00] text-[#111827]"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {daySlotCount}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Content area (scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Feedback */}
          <InlineFeedback message={feedback} />

          {/* Loading state */}
          {loading ? (
            <div className="py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <>
              {/* Existing slots */}
              {slotsForDay.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                    <Clock size={20} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 max-w-xs">
                    {t("owner.noSlots")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {slotsForDay.map((slot) => (
                      <motion.div
                        key={slot.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, x: -40 }}
                        className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400 shrink-0" />
                          <span
                            className="text-sm font-medium text-gray-900"
                            dir="ltr"
                          >
                            {formatTime(slot.startTime)} —{" "}
                            {formatTime(slot.endTime)}
                          </span>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleDeleteSlot(slot.id)}
                          disabled={deletingSlotId === slot.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                          aria-label={t("owner.deleteSlot")}
                        >
                          {deletingSlotId === slot.id ? (
                            <motion.div
                              className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-600"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Add slot form */}
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500">
                  {t("owner.addSlot")}
                </p>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">
                      {t("owner.startTime")}
                    </label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      dir="ltr"
                      className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] appearance-none"
                    >
                      {START_TIMES.map((time) => (
                        <option key={`start-${time}`} value={time}>
                          {formatTime(time)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">
                      {t("owner.endTime")}
                    </label>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      dir="ltr"
                      className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] appearance-none"
                    >
                      {END_TIMES.map((time) => (
                        <option key={`end-${time}`} value={time}>
                          {formatTime(time)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddSlot}
                    disabled={addingSlot}
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[#111827] text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                    aria-label={t("owner.addSlot")}
                  >
                    {addingSlot ? (
                      <motion.div
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ) : (
                      <Plus size={18} />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Copy to all days */}
              {slotsForDay.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCopyToAllDays}
                  disabled={copying}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {copying ? (
                    <motion.div
                      className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-600"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  ) : (
                    <Copy size={15} />
                  )}
                  {t("owner.copyToAllDays")}
                </motion.button>
              )}
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
      className={`bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-opacity ${
        !court.isActive ? "opacity-50" : ""
      }`}
    >
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Court icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c8ff00]/15">
            <RectangleHorizontal size={22} className="text-[#111827]" />
          </div>

          {/* Court info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base font-bold text-gray-900 truncate">
                {court.nameAr || court.name}
              </h3>
              {court.nameAr && (
                <span className="text-xs text-gray-400 truncate" dir="ltr">
                  {court.name}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {formatPrice(parseFloat(court.pricePerHour))}{" "}
              <span className="text-gray-400 font-normal">
                {t("common.perHour")}
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleStartEdit}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label={t("owner.editCourt")}
            >
              <Pencil size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => onToggleActive(court)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              aria-label={
                court.isActive ? t("owner.active") : t("owner.inactive")
              }
            >
              {court.isActive ? (
                <ToggleRight size={26} className="text-green-500" />
              ) : (
                <ToggleLeft size={26} className="text-gray-300" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Status & slot count row */}
        <div className="flex items-center gap-2 mt-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              court.isActive
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                court.isActive ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            {court.isActive ? t("owner.active") : t("owner.inactive")}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            <Clock size={11} />
            {t("owner.slotsCount", { count: slotCount })}
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
            <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Pencil size={13} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-500">
                  {t("owner.editCourt")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    {t("owner.courtName")}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    dir="ltr"
                    className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-shadow"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    {t("owner.courtNameAr")}
                  </label>
                  <input
                    type="text"
                    value={editNameAr}
                    onChange={(e) => setEditNameAr(e.target.value)}
                    className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  {t("owner.pricePerHour")} (EGP)
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  min="1"
                  dir="ltr"
                  className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-shadow"
                />
              </div>

              <InlineFeedback message={feedback} />

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveEdit}
                  disabled={saving || !editName.trim() || !editPrice}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#111827] py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <motion.div
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
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
                  className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {t("common.cancel")}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage slots button */}
      <div className="border-t border-gray-100">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onOpenSlots(court)}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-gray-50 transition-colors"
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

      // Fetch slot counts for all courts in parallel
      const counts: Record<string, number> = {};
      await Promise.all(
        fetchedCourts.map(async (court) => {
          try {
            const slotsRes = await fetch(
              `/api/venues/${ownerVenue.id}/courts/${court.id}/slots?all=true`
            );
            const slotsJson = await slotsRes.json();
            counts[court.id] = (slotsJson.data || []).length;
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
          <h1 className="text-xl font-bold text-gray-900">
            {t("owner.manageCourts")}
          </h1>
          {courts.length > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              {courts.length}{" "}
              {courts.length === 1 ? "court" : "courts"}
            </p>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 rounded-full bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
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
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-gray-900">
                  {t("owner.addCourt")}
                </h3>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setShowAddForm(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    {t("owner.courtName")}
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    dir="ltr"
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-shadow"
                    placeholder="Court 1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    {t("owner.courtNameAr")}
                  </label>
                  <input
                    type="text"
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-shadow"
                    placeholder="كورت ١"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  {t("owner.pricePerHour")} (EGP)
                </label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  required
                  min="1"
                  dir="ltr"
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-shadow"
                  placeholder="300"
                />
              </div>

              <InlineFeedback message={addFeedback} />

              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#111827] py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <motion.div
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
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
