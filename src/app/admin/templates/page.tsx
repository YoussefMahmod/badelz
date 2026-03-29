"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Check,
  ChevronDown,
  Loader2,
  RectangleHorizontal,
  Zap,
} from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { LoadingSpinner } from "@/components/loading-spinner";

// ─── Types ───

type SlotTemplate = "STANDARD_PADEL" | "EVENING_ONLY" | "WEEKEND_HEAVY";

interface Court {
  id: string;
  name: string;
  nameAr: string | null;
}

interface Venue {
  id: string;
  name: string;
  nameAr: string | null;
  courts: Court[];
}

// ─── Template config ───

interface TemplateConfig {
  id: SlotTemplate;
  labelKey: string;
  descKey: string;
  slots: string;
  // Grid: 7 days (Sat-Fri), hours 6-23 (18 rows)
  // true = active hour for that day
  grid: boolean[][];
}

function buildGrid(
  weekdayRange: [number, number],
  weekendRange: [number, number]
): boolean[][] {
  const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM
  // Days: Sat(0), Sun(1), Mon-Fri(2-6) — Sat/Fri are weekend in Egypt
  return HOURS.map((hour) =>
    Array.from({ length: 7 }, (_, day) => {
      const isWeekend = day === 0 || day === 6; // Saturday or Friday
      const range = isWeekend ? weekendRange : weekdayRange;
      return hour >= range[0] && hour < range[1];
    })
  );
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: "STANDARD_PADEL",
    labelKey: "admin.standardPadel",
    descKey: "admin.standardPadelDesc",
    slots: "91",
    grid: buildGrid([10, 23], [10, 23]),
  },
  {
    id: "EVENING_ONLY",
    labelKey: "admin.eveningOnly",
    descKey: "admin.eveningOnlyDesc",
    slots: "42",
    grid: buildGrid([17, 23], [17, 23]),
  },
  {
    id: "WEEKEND_HEAVY",
    labelKey: "admin.weekendHeavy",
    descKey: "admin.weekendHeavyDesc",
    slots: "72",
    grid: buildGrid([17, 23], [8, 23]),
  },
];

const DAY_LABELS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

// ─── Time Grid Visualization ───

function TimeGrid({ grid, selected }: { grid: boolean[][]; selected: boolean }) {
  return (
    <div className="mt-3 p-3 rounded-xl bg-black/20 border border-[#222]">
      {/* Day headers */}
      <div className="grid grid-cols-[28px_repeat(7,1fr)] gap-0.5 mb-1">
        <div />
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-[9px] text-[#666] text-center font-medium"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Hour rows */}
      <div className="grid grid-cols-[28px_repeat(7,1fr)] gap-0.5">
        {grid.map((row, hourIdx) => {
          const hour = hourIdx + 6;
          // Only show labels for every 2nd hour to reduce clutter
          const showLabel = hour % 2 === 0;
          return (
            <div key={hourIdx} className="contents">
              <div className="text-[8px] text-[#666] text-end pe-1 self-center leading-none">
                {showLabel ? `${hour}` : ""}
              </div>
              {row.map((active, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`h-[6px] rounded-[2px] transition-colors ${
                    active
                      ? selected
                        ? "bg-indigo-500/70"
                        : "bg-white/20"
                      : "bg-[#1a1a1a]"
                  }`}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Toast Component ───

function SuccessToast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-5 inset-x-4 z-50 mx-auto max-w-md"
    >
      <div className="bg-indigo-500/15 border border-indigo-500/30 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg shadow-indigo-500/10">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
          <Zap size={16} className="text-indigo-400" />
        </div>
        <p className="text-sm font-medium text-white flex-1">{message}</p>
        <button
          onClick={onDismiss}
          className="text-[#666] hover:text-[#999] transition-colors"
        >
          <span className="sr-only">Dismiss</span>
          &times;
        </button>
      </div>
    </motion.div>
  );
}

// ─── Page ───

export default function TemplatesPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  // Data
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedTemplate, setSelectedTemplate] =
    useState<SlotTemplate>("STANDARD_PADEL");
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [selectedCourtIds, setSelectedCourtIds] = useState<Set<string>>(
    new Set()
  );

  // Submission
  const [applying, setApplying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Venue dropdown
  const [venueDropdownOpen, setVenueDropdownOpen] = useState(false);

  // ─── Fetch venues ───

  useEffect(() => {
    async function fetchVenues() {
      try {
        const res = await fetch("/api/admin/venues?limit=50");
        const json = await res.json();
        if (res.ok && json.data) {
          // Handle both array and paginated response shapes
          const venueList: Venue[] = Array.isArray(json.data)
            ? json.data
            : json.data.data ?? [];
          setVenues(venueList);
        }
      } catch {
        // Fail silently — empty state is shown
      } finally {
        setLoading(false);
      }
    }
    fetchVenues();
  }, []);

  // ─── Derived state ───

  const selectedVenue = useMemo(
    () => venues.find((v) => v.id === selectedVenueId) ?? null,
    [venues, selectedVenueId]
  );

  const allCourtsSelected = useMemo(() => {
    if (!selectedVenue) return false;
    return selectedVenue.courts.every((c) => selectedCourtIds.has(c.id));
  }, [selectedVenue, selectedCourtIds]);

  // ─── Handlers ───

  const selectVenue = (venueId: string) => {
    setSelectedVenueId(venueId);
    // Auto-select all courts when picking a venue
    const venue = venues.find((v) => v.id === venueId);
    if (venue) {
      setSelectedCourtIds(new Set(venue.courts.map((c) => c.id)));
    }
    setVenueDropdownOpen(false);
  };

  const toggleCourt = (courtId: string) => {
    setSelectedCourtIds((prev) => {
      const next = new Set(prev);
      if (next.has(courtId)) {
        next.delete(courtId);
      } else {
        next.add(courtId);
      }
      return next;
    });
  };

  const toggleAllCourts = () => {
    if (!selectedVenue) return;
    if (allCourtsSelected) {
      setSelectedCourtIds(new Set());
    } else {
      setSelectedCourtIds(new Set(selectedVenue.courts.map((c) => c.id)));
    }
  };

  const handleApply = async () => {
    if (!selectedVenueId || selectedCourtIds.size === 0) return;
    setApplying(true);

    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          courtIds: Array.from(selectedCourtIds),
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        const count = json.data.slotsCreated ?? 0;
        setToast(`${t("admin.templateApplied")} ${count} ${t("admin.slotsCreated")}`);
      }
    } catch {
      // Fail silently
    } finally {
      setApplying(false);
    }
  };

  // ─── Loading ───

  if (loading) return <LoadingSpinner />;

  // ─── Venue display name ───

  const venueName = (v: Venue) =>
    locale === "ar" && v.nameAr ? v.nameAr : v.name;

  const courtName = (c: Court) =>
    locale === "ar" && c.nameAr ? c.nameAr : c.name;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <SuccessToast message={toast} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl font-bold text-white">
          {t("admin.templates")}
        </h1>
        <p className="text-sm text-[#666] mt-0.5">
          {t("admin.selectTemplate")}
        </p>
      </motion.div>

      <div className="space-y-4">
        {/* ── Template Cards ── */}
        {TEMPLATES.map((tmpl) => {
          const selected = selectedTemplate === tmpl.id;
          return (
            <motion.button
              key={tmpl.id}
              type="button"
              onClick={() => setSelectedTemplate(tmpl.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-start rounded-sm border p-5 transition-all ${
                selected
                  ? "border-indigo-500/60 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.1)]"
                  : "border-[#333] bg-[#1a1a1a] hover:border-[#333]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      selected ? "bg-indigo-500/20" : "bg-[#1a1a1a]"
                    }`}
                  >
                    <Clock
                      size={20}
                      className={selected ? "text-indigo-400" : "text-[#666]"}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {t(tmpl.labelKey as Parameters<typeof t>[0])}
                    </p>
                    <p className="text-xs text-[#666] mt-0.5">
                      {t(tmpl.descKey as Parameters<typeof t>[0])}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                    selected
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-[#1a1a1a] text-[#666]"
                  }`}
                >
                  {tmpl.slots} slots
                </span>
              </div>

              {/* Visual time grid */}
              <TimeGrid grid={tmpl.grid} selected={selected} />

              {/* Selection indicator */}
              {selected && (
                <motion.div
                  layoutId="template-select-bar"
                  className="mt-3 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                />
              )}
            </motion.button>
          );
        })}

        {/* ── Venue / Court Selector ── */}
        <div
          className="bg-[#1a1a1a] border border-[#333] rounded-sm p-5 space-y-4"
        >
          {/* Venue dropdown */}
          <div>
            <label className="text-sm text-[#999] mb-2 block">
              {t("admin.selectVenue")}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setVenueDropdownOpen(!venueDropdownOpen)}
                className="flex items-center justify-between w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-start text-white hover:border-[#333] transition-colors"
              >
                <span className={selectedVenue ? "" : "text-[#666]"}>
                  {selectedVenue
                    ? venueName(selectedVenue)
                    : t("admin.selectVenue")}
                </span>
                <motion.div
                  animate={{ rotate: venueDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} className="text-[#666]" />
                </motion.div>
              </button>

              <AnimatePresence>
                {venueDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                   
                    className="absolute z-20 inset-x-0 mt-2 bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden shadow-xl origin-top max-h-60 overflow-y-auto"
                  >
                    {venues.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-[#666]">
                        No venues
                      </div>
                    ) : (
                      venues.map((venue) => (
                        <button
                          key={venue.id}
                          type="button"
                          onClick={() => selectVenue(venue.id)}
                          className={`w-full text-start px-4 py-3 text-sm hover:bg-[#1a1a1a] transition-colors flex items-center justify-between ${
                            venue.id === selectedVenueId
                              ? "bg-indigo-500/10 text-indigo-300"
                              : "text-[#999]"
                          }`}
                        >
                          <span>{venueName(venue)}</span>
                          <span className="text-xs text-[#666]">
                            {venue.courts.length} courts
                          </span>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Court checkboxes */}
          <AnimatePresence>
            {selectedVenue && selectedVenue.courts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-[#999]">
                    {t("admin.selectCourts")}
                  </label>
                  <button
                    type="button"
                    onClick={toggleAllCourts}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {allCourtsSelected ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedVenue.courts.map((court) => {
                    const checked = selectedCourtIds.has(court.id);
                    return (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => toggleCourt(court.id)}
                        className={`w-full flex items-center gap-3 rounded-sm border px-4 py-3 transition-all text-start ${
                          checked
                            ? "border-indigo-500/40 bg-indigo-500/10"
                            : "border-[#333] bg-[#1a1a1a] hover:border-[#333]"
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                            checked
                              ? "bg-indigo-500 border-indigo-500"
                              : "border-[#333] bg-transparent"
                          }`}
                        >
                          <AnimatePresence>
                            {checked && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                               
                              >
                                <Check
                                  size={12}
                                  className="text-white"
                                  strokeWidth={3}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                          <RectangleHorizontal
                            size={14}
                            className={
                              checked ? "text-indigo-400" : "text-[#666]"
                            }
                          />
                          <span
                            className={`text-sm ${
                              checked
                                ? "text-white font-medium"
                                : "text-[#999]"
                            }`}
                          >
                            {courtName(court)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Apply Button ── */}
        <div>
          <button
            type="button"
            onClick={handleApply}
            disabled={
              applying || !selectedVenueId || selectedCourtIds.size === 0
            }
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-xl py-3.5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {applying ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t("admin.applyTemplate")}...
              </>
            ) : (
              <>
                <Zap size={18} />
                {t("admin.applyTemplate")}
              </>
            )}
          </button>

          {/* Helper text when no selection */}
          {(!selectedVenueId || selectedCourtIds.size === 0) && (
            <p className="text-xs text-[#666] text-center mt-2">
              {!selectedVenueId
                ? t("admin.selectVenue")
                : t("admin.selectCourts")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
