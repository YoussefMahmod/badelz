"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { formatTime } from "@/lib/format";
import Link from "next/link";

// ─── Types ───

interface Court {
  id: string;
  name: string;
  nameAr: string | null;
  pricePerHour: number | string;
}

interface ScheduleBooking {
  id: string;
  courtId: string;
  playerName: string;
  playerPhone: string | null;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED";
  confirmationCode: string;
  notes: string | null;
}

interface ScheduleGridProps {
  venueId: string;
  onSlotTap: (prefill: {
    courtId: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
}

// ─── Helpers ───

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  // Handle next-day hours (e.g., 01:00, 02:00 after midnight = 25:00, 26:00)
  const normalizedH = h < 6 ? h + 24 : h;
  return normalizedH * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Generate 30-min time slots from 06:00 (360) to 02:00 next day (1560) */
function generateTimeSlots(): number[] {
  const slots: number[] = [];
  for (let m = 360; m < 1560; m += 30) {
    slots.push(m);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  CONFIRMED: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/50",
    text: "text-emerald-400",
  },
  PENDING: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/50",
    text: "text-amber-400",
  },
  COMPLETED: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/50",
    text: "text-blue-400",
  },
};

// ─── Component ───

export function ScheduleGrid({ venueId, onSlotTap }: ScheduleGridProps) {
  const { t } = useTranslation();
  const { locale, dir } = useLocale();

  const today = toDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<ScheduleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate 7-day date picker starting from today
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const base = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  // Fetch schedule data
  const fetchSchedule = useCallback(async (date: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/owner/schedule?date=${date}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setCourts(json.data.courts ?? []);
        setBookings(json.data.bookings ?? []);
      } else {
        setCourts([]);
        setBookings([]);
        if (!res.ok) setError(true);
      }
    } catch {
      setCourts([]);
      setBookings([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule(selectedDate);
  }, [selectedDate, fetchSchedule]);

  // Build a map of courtId -> minute -> booking for fast lookup
  const bookingMap = useMemo(() => {
    const map = new Map<string, Map<number, ScheduleBooking>>();
    for (const court of courts) {
      map.set(court.id, new Map());
    }
    for (const booking of bookings) {
      const courtMap = map.get(booking.courtId);
      if (!courtMap) continue;
      const startMin = timeToMinutes(booking.startTime);
      const endMin = timeToMinutes(booking.endTime);
      // Mark every 30-min slot covered by this booking
      for (let m = startMin; m < endMin; m += 30) {
        courtMap.set(m, booking);
      }
    }
    return map;
  }, [courts, bookings]);

  // Determine which cells are "start" cells (first slot of a booking block)
  // and which are "covered" (should not render a <td>)
  const cellInfo = useMemo(() => {
    const info = new Map<string, "start" | "covered" | "available">();

    for (const court of courts) {
      const courtMap = bookingMap.get(court.id);
      for (const slotMinute of TIME_SLOTS) {
        const key = `${court.id}-${slotMinute}`;
        const booking = courtMap?.get(slotMinute);
        if (!booking) {
          info.set(key, "available");
        } else {
          const bookingStart = timeToMinutes(booking.startTime);
          if (slotMinute === bookingStart) {
            info.set(key, "start");
          } else {
            info.set(key, "covered");
          }
        }
      }
    }
    return info;
  }, [courts, bookingMap]);

  // Format weekday abbreviation
  const formatWeekday = useCallback(
    (date: Date) => {
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        weekday: "short",
      }).format(date);
    },
    [locale]
  );

  const isRTL = dir === "rtl";

  // Scroll the grid container to ~current hour on mount
  useEffect(() => {
    if (!loading && scrollRef.current && selectedDate === today) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      // Each row is 48px, starting at 360 minutes
      const rowIndex = Math.max(0, Math.floor((currentMinutes - 360) / 30) - 2);
      const scrollTop = rowIndex * 48;
      scrollRef.current.scrollTop = scrollTop;
    }
  }, [loading, selectedDate, today]);

  // Navigate to prev/next date
  const shiftDate = (offset: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + offset);
    setSelectedDate(toDateString(d));
  };

  // ─── Render: Loading Skeleton ───

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Date picker skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-16 w-14 shrink-0 animate-pulse rounded-xl bg-white/10"
            />
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="overflow-hidden rounded-xl border border-white/10">
          {Array.from({ length: 6 }).map((_, row) => (
            <div key={row} className="flex border-b border-white/5 last:border-b-0">
              <div className="w-16 shrink-0 p-3">
                <div className="h-3 w-10 animate-pulse rounded bg-white/10" />
              </div>
              {Array.from({ length: 3 }).map((_, col) => (
                <div
                  key={col}
                  className="flex-1 border-s border-white/5 p-3"
                  style={{ minWidth: 120 }}
                >
                  <div
                    className="h-5 animate-pulse rounded bg-white/10"
                    style={{ animationDelay: `${(row * 3 + col) * 80}ms` }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Render: Error State ───

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <CalendarDays size={24} className="text-red-400" />
        </div>
        <p className="text-sm font-medium text-white/90 mb-1">
          {t("common.error")}
        </p>
        <button
          onClick={() => fetchSchedule(selectedDate)}
          className="mt-3 rounded-full bg-[#111827] px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1f2937]"
        >
          {t("common.loading").replace("...", "")}
        </button>
      </div>
    );
  }

  // ─── Render: No Courts ───

  if (courts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <CalendarDays size={24} className="text-white/40" />
        </div>
        <p className="text-sm font-medium text-white/90 mb-1">
          {t("owner.noCourts")}
        </p>
        <Link
          href="/courts"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#111827] px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1f2937]"
        >
          <Plus size={14} />
          {t("owner.addCourt")}
        </Link>
      </div>
    );
  }

  // ─── Render: Schedule Grid ───

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Date Picker Row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => shiftDate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/40 transition-colors hover:border-white/20 hover:text-white/60"
          aria-label="Previous day"
        >
          {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="flex flex-1 gap-1.5 overflow-x-auto hide-scrollbar">
          {weekDays.map((day) => {
            const dateStr = toDateString(day);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today;
            return (
              <motion.button
                key={dateStr}
                whileTap={{ scale: 0.93 }}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex shrink-0 flex-col items-center justify-center rounded-xl px-3 py-2 transition-all ${
                  isSelected
                    ? "bg-[#111827] text-white shadow-sm"
                    : "border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                }`}
                style={{ minWidth: 52 }}
                aria-label={new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }).format(day)}
                aria-pressed={isSelected}
              >
                <span className={`text-[10px] font-medium leading-tight ${
                  isSelected ? "text-white/70" : "text-white/40"
                }`}>
                  {formatWeekday(day)}
                </span>
                <span className="text-base font-bold leading-tight mt-0.5">
                  {day.getDate()}
                </span>
                {isToday && !isSelected && (
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-[#111827]" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Calendar picker for arbitrary date */}
        <button
          onClick={() => dateInputRef.current?.showPicker()}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/40 transition-colors hover:border-white/20 hover:text-white/60"
          aria-label="Pick date"
        >
          <CalendarDays size={16} />
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
            tabIndex={-1}
            aria-hidden="true"
          />
        </button>

        <button
          onClick={() => shiftDate(1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/40 transition-colors hover:border-white/20 hover:text-white/60"
          aria-label="Next day"
        >
          {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* "Today" quick jump if not viewing today */}
      <AnimatePresence>
        {selectedDate !== today && (
          <motion.button
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onClick={() => setSelectedDate(today)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#111827] hover:underline"
          >
            <CalendarDays size={12} />
            {t("owner.today")}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] font-medium">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span className="text-white/50">{t("owner.confirmed")}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
          <span className="text-white/50">{t("owner.pending")}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
          <span className="text-white/50">{t("owner.completed")}</span>
        </span>
      </div>

      {/* Grid */}
      <div
        ref={scrollRef}
        className="overflow-auto rounded-xl border border-white/10 bg-white/[0.02]"
        style={{ maxHeight: "calc(100vh - 280px)" }}
      >
        <table className="w-full border-collapse" role="grid" aria-label={t("owner.scheduleView")}>
          {/* Court Headers */}
          <thead>
            <tr>
              {/* Time column header */}
              <th
                className="sticky top-0 start-0 z-30 bg-[#0a0f1a]/95 backdrop-blur-sm border-b border-e border-white/10 p-2"
                style={{ minWidth: 64 }}
              >
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                  {/* Empty — time column */}
                </span>
              </th>
              {courts.map((court) => (
                <th
                  key={court.id}
                  className="sticky top-0 z-20 bg-[#0a0f1a]/95 backdrop-blur-sm border-b border-e border-white/10 p-2 text-center last:border-e-0"
                  style={{ minWidth: 120 }}
                >
                  <span className="block text-xs font-semibold text-white/90 truncate">
                    {locale === "ar" && court.nameAr ? court.nameAr : court.name}
                  </span>
                  <span className="block text-[10px] text-white/40 mt-0.5">
                    {Number(court.pricePerHour)} {t("common.egp")}{t("common.perHour")}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Time Rows */}
          <tbody>
            {TIME_SLOTS.map((slotMinute) => {
              const timeStr = minutesToTime(slotMinute);
              const isHourMark = slotMinute % 60 === 0;

              return (
                <tr
                  key={slotMinute}
                  className={isHourMark ? "border-t border-white/10" : "border-t border-white/5"}
                >
                  {/* Time label — only show on hour marks */}
                  <td
                    className="sticky start-0 z-10 bg-[#0a0f1a] border-e border-white/10 px-2 align-top"
                    style={{ height: 48 }}
                  >
                    {isHourMark && (
                      <span className="text-xs text-white/40 font-mono whitespace-nowrap">
                        {formatTime(timeStr)}
                      </span>
                    )}
                  </td>

                  {/* Court cells */}
                  {courts.map((court) => {
                    const cellKey = `${court.id}-${slotMinute}`;
                    const state = cellInfo.get(cellKey);

                    // Skip covered cells (part of a multi-row booking block)
                    if (state === "covered") return null;

                    if (state === "start") {
                      const booking = bookingMap.get(court.id)?.get(slotMinute);
                      if (!booking) return null;

                      const startMin = timeToMinutes(booking.startTime);
                      const endMin = timeToMinutes(booking.endTime);
                      const spanRows = (endMin - startMin) / 30;
                      const durationHours = (endMin - startMin) / 60;
                      const styles = STATUS_STYLES[booking.status] ?? STATUS_STYLES.CONFIRMED;

                      return (
                        <td
                          key={cellKey}
                          rowSpan={spanRows}
                          className="border-e border-white/5 p-1 align-top last:border-e-0"
                          style={{ height: spanRows * 48 }}
                        >
                          <div
                            className={`h-full rounded-lg ${styles.bg} border-s-[3px] ${styles.border} px-2 py-1.5 overflow-hidden transition-shadow hover:shadow-sm`}
                          >
                            <p className={`text-xs font-bold ${styles.text} truncate leading-tight`}>
                              {booking.playerName}
                            </p>
                            <p className={`text-[10px] ${styles.text} opacity-70 mt-0.5`}>
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </p>
                            {/* Show phone if block is 1+ hour and phone exists */}
                            {durationHours >= 1 && booking.playerPhone && (
                              <p
                                className={`text-[10px] ${styles.text} opacity-50 mt-0.5 font-mono`}
                                dir="ltr"
                              >
                                {booking.playerPhone}
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    }

                    // Available slot
                    return (
                      <td
                        key={cellKey}
                        className="border-e border-white/5 p-1 last:border-e-0"
                        style={{ height: 48 }}
                      >
                        <button
                          onClick={() =>
                            onSlotTap({
                              courtId: court.id,
                              date: selectedDate,
                              startTime: timeStr,
                              endTime: minutesToTime(slotMinute + 30),
                            })
                          }
                          className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-white/10 text-white/30 transition-all hover:bg-white/5 hover:border-white/20 hover:text-white/40 cursor-pointer group"
                          aria-label={`${t("owner.tapToBook")} - ${locale === "ar" && court.nameAr ? court.nameAr : court.name} - ${formatTime(timeStr)}`}
                        >
                          <Plus
                            size={14}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
