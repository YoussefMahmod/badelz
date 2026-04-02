"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { formatTime } from "@/lib/format";
import { timeToMinutes, endTimeToMinutes } from "@/lib/slot-templates";
import { PriceRulesEditor } from "./price-rules-editor";

// ─── Types ──────────────────────────────────────────────

interface PriceRuleData {
  dayGroup: string;
  startTime: string;
  endTime: string;
  pricePerHour: string;
}

interface CourtWizardProps {
  mode: "add" | "edit";
  court?: {
    id: string;
    name: string;
    nameAr: string | null;
    pricePerHour: string;
    isActive: boolean;
    priceRules?: PriceRuleData[];
  };
  venueId: string;
  onClose: () => void;
  onSaved: () => void;
}

interface FeedbackMessage {
  type: "success" | "error";
  text: string;
}

// ─── Time Options ───────────────────────────────────────

function generateTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    const hourVal = `${h.toString().padStart(2, "0")}:00`;
    options.push({ value: hourVal, label: formatTime(hourVal) });
    const halfVal = `${h.toString().padStart(2, "0")}:30`;
    options.push({ value: halfVal, label: formatTime(halfVal) });
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

function getEndTimeOptions(startTime: string): { value: string; label: string }[] {
  if (!startTime) return TIME_OPTIONS;
  const startMin = timeToMinutes(startTime);
  const filtered = TIME_OPTIONS.filter((opt) => {
    const optMin = timeToMinutes(opt.value);
    // Allow times after start, plus midnight wrap
    return optMin > startMin || optMin === 0;
  });
  // Ensure midnight appears as last option if start > 0
  if (startMin > 0 && !filtered.some((o) => o.value === "00:00")) {
    filtered.push({ value: "00:00", label: "12:00 ص" });
  }
  return filtered;
}

function computeSlotCount(start: string, end: string, duration: 30 | 60): number {
  const startMin = timeToMinutes(start);
  const endMin = endTimeToMinutes(end);
  if (endMin <= startMin) return 0;
  return Math.floor((endMin - startMin) / duration);
}

// ─── Step Labels ────────────────────────────────────────

const STEP_TITLES = [
  { key: "owner.courtInfo" as const, fallback: "بيانات الكورت" },
  { key: "owner.pricing" as const, fallback: "التسعير" },
  { key: "owner.schedule" as const, fallback: "المواعيد" },
];

const TOTAL_STEPS = 3;

// ─── Inline Feedback ────────────────────────────────────

function InlineFeedback({ message }: { message: FeedbackMessage | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className={`flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium ${
            message.type === "success"
              ? "bg-[#d4ff00]/10 text-[#d4ff00]"
              : "bg-[#ff4d4d]/10 text-[#ff4d4d]"
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

// ─── Progress Bar ───────────────────────────────────────

function ProgressBar({ currentStep }: { currentStep: number }) {
  const { t } = useTranslation();

  return (
    <div className="px-5 pt-2 pb-3">
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div
              key={stepNum}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                isCompleted
                  ? "bg-[#d4ff00]"
                  : isActive
                    ? "bg-[#d4ff00] animate-pulse"
                    : "bg-[#333]"
              }`}
            />
          );
        })}
      </div>
      <p className="text-[#666] text-xs mt-2 text-center">
        {t("owner.wizardStepOf", {
          current: currentStep.toString(),
          total: TOTAL_STEPS.toString(),
        })}
      </p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────

export function CourtWizard({
  mode,
  court,
  venueId,
  onClose,
  onSaved,
}: CourtWizardProps) {
  const { t } = useTranslation();

  // ── Wizard state ──
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  // ── Step 1: Court info ──
  const [name, setName] = useState(court?.name || "");
  const [nameAr, setNameAr] = useState(court?.nameAr || "");
  const [isActive, setIsActive] = useState(court?.isActive ?? true);

  // ── Step 2: Pricing ──
  const [price, setPrice] = useState(court?.pricePerHour || "");
  const [rules, setRules] = useState<PriceRuleData[]>(court?.priceRules || []);
  const [rulesDayMode, setRulesDayMode] = useState<"all" | "split">("all");

  // ── Step 3: Schedule ──
  const [slotDuration, setSlotDuration] = useState<30 | 60>(60);
  const [sameForAllDays, setSameForAllDays] = useState(true);
  const [allStart, setAllStart] = useState("08:00");
  const [allEnd, setAllEnd] = useState("23:00");
  const [weekdaysStart, setWeekdaysStart] = useState("10:00");
  const [weekdaysEnd, setWeekdaysEnd] = useState("23:00");
  const [weekendsStart, setWeekendsStart] = useState("08:00");
  const [weekendsEnd, setWeekendsEnd] = useState("23:00");

  // ── Body scroll lock ──
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ── Load data in edit mode ──
  const loadEditData = useCallback(async () => {
    if (mode !== "edit" || !court?.id) return;

    setLoading(true);
    try {
      const [schedRes, rulesRes] = await Promise.all([
        fetch(`/api/venues/${venueId}/courts/${court.id}/schedule`),
        fetch(`/api/venues/${venueId}/courts/${court.id}/price-rules`),
      ]);

      // Parse schedule
      if (schedRes.ok) {
        const schedJson = await schedRes.json();
        const schedules = schedJson.data;

        if (Array.isArray(schedules) && schedules.length > 0) {
          const allSched = schedules.find(
            (s: { dayGroup: string }) => s.dayGroup === "all"
          );

          if (allSched) {
            setSameForAllDays(true);
            setAllStart(allSched.startTime);
            setAllEnd(allSched.endTime);
            if (allSched.slotDuration) setSlotDuration(allSched.slotDuration);
          } else {
            setSameForAllDays(false);
            const wdSched = schedules.find(
              (s: { dayGroup: string }) => s.dayGroup === "weekdays"
            );
            const weSched = schedules.find(
              (s: { dayGroup: string }) => s.dayGroup === "weekends"
            );

            if (wdSched) {
              setWeekdaysStart(wdSched.startTime);
              setWeekdaysEnd(wdSched.endTime);
              if (wdSched.slotDuration) setSlotDuration(wdSched.slotDuration);
            }
            if (weSched) {
              setWeekendsStart(weSched.startTime);
              setWeekendsEnd(weSched.endTime);
            }
          }
        }
      }

      // Parse price rules
      if (rulesRes.ok) {
        const rulesJson = await rulesRes.json();
        const loadedRules = rulesJson.data;

        if (Array.isArray(loadedRules) && loadedRules.length > 0) {
          setRules(
            loadedRules.map((r: PriceRuleData) => ({
              dayGroup: r.dayGroup,
              startTime: r.startTime,
              endTime: r.endTime,
              pricePerHour: String(r.pricePerHour),
            }))
          );
          // Detect day mode from rules
          const hasSplit = loadedRules.some(
            (r: PriceRuleData) =>
              r.dayGroup === "weekdays" || r.dayGroup === "weekends"
          );
          if (hasSplit) setRulesDayMode("split");
        }
      }
    } catch {
      // Non-blocking — proceed with defaults
    } finally {
      setLoading(false);
    }
  }, [mode, court?.id, venueId]);

  useEffect(() => {
    loadEditData();
  }, [loadEditData]);

  // ── Validation ──
  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = price.trim().length > 0 && parseFloat(price) > 0;

  const canProceed = useMemo(() => {
    if (step === 1) return canProceedStep1;
    if (step === 2) return canProceedStep2;
    return true; // Step 3 always has defaults
  }, [step, canProceedStep1, canProceedStep2]);

  // ── Navigation ──
  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS && canProceed) setStep((s) => s + 1);
  }, [step, canProceed]);

  const goPrev = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    setSaving(true);
    setFeedback(null);

    try {
      let courtId = court?.id;

      if (mode === "add") {
        const res = await fetch(`/api/venues/${venueId}/courts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            nameAr: nameAr.trim() || undefined,
            pricePerHour: parseFloat(price),
          }),
        });
        if (!res.ok) throw new Error("Court creation failed");
        const json = await res.json();
        courtId = json.data.id;
      } else {
        const res = await fetch(`/api/venues/${venueId}/courts/${courtId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            nameAr: nameAr.trim() || undefined,
            pricePerHour: parseFloat(price),
            isActive,
          }),
        });
        if (!res.ok) throw new Error("Court update failed");
      }

      // Save schedule
      const schedBody: Record<string, unknown> = { slotDuration };
      if (sameForAllDays) {
        schedBody.all = { startTime: allStart, endTime: allEnd };
      } else {
        schedBody.weekdays = { startTime: weekdaysStart, endTime: weekdaysEnd };
        schedBody.weekends = { startTime: weekendsStart, endTime: weekendsEnd };
      }
      await fetch(`/api/venues/${venueId}/courts/${courtId}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedBody),
      });

      // Save price rules
      const validRules = rules.filter(
        (r) => r.startTime && r.endTime && r.pricePerHour
      );
      await fetch(`/api/venues/${venueId}/courts/${courtId}/price-rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rules: validRules.map((r) => ({
            dayGroup: r.dayGroup,
            startTime: r.startTime,
            endTime: r.endTime,
            pricePerHour: parseFloat(r.pricePerHour),
          })),
        }),
      });

      setFeedback({
        type: "success",
        text:
          mode === "add"
            ? t("owner.courtCreated") || "تم إضافة الكورت"
            : t("owner.courtUpdated") || "تم تحديث الكورت",
      });

      setTimeout(() => {
        onSaved();
        onClose();
      }, 800);
    } catch {
      setFeedback({ type: "error", text: t("common.error") || "حدث خطأ" });
    } finally {
      setSaving(false);
    }
  }, [
    mode,
    court?.id,
    venueId,
    name,
    nameAr,
    price,
    isActive,
    slotDuration,
    sameForAllDays,
    allStart,
    allEnd,
    weekdaysStart,
    weekdaysEnd,
    weekendsStart,
    weekendsEnd,
    rules,
    t,
    onSaved,
    onClose,
  ]);

  // ── Slot counts ──
  const allDaySlotCount = useMemo(
    () => computeSlotCount(allStart, allEnd, slotDuration),
    [allStart, allEnd, slotDuration]
  );
  const weekdaySlotCount = useMemo(
    () => computeSlotCount(weekdaysStart, weekdaysEnd, slotDuration),
    [weekdaysStart, weekdaysEnd, slotDuration]
  );
  const weekendSlotCount = useMemo(
    () => computeSlotCount(weekendsStart, weekendsEnd, slotDuration),
    [weekendsStart, weekendsEnd, slotDuration]
  );

  // ── Step content ──

  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Active toggle — edit mode only */}
      {mode === "edit" && (
        <div className="flex items-center justify-between bg-[#222] rounded-sm p-3 border border-[#333]">
          <span className="text-sm text-white/90">
            {isActive
              ? t("owner.active") || "نشط"
              : t("owner.inactive") || "غير نشط"}
          </span>
          <button
            type="button"
            onClick={() => setIsActive((v) => !v)}
            className="cursor-pointer text-[#d4ff00] active:scale-[0.97] transition-transform duration-75"
            aria-label={isActive ? "Deactivate court" : "Activate court"}
          >
            {isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-[#666]" />}
          </button>
        </div>
      )}

      {/* Court Name (EN) */}
      <div>
        <label className="text-xs text-[#999] mb-1.5 block">
          {t("owner.courtName") || "اسم الكورت"}
        </label>
        <input
          type="text"
          dir="ltr"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Court 1"
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-sm px-3 py-2.5 text-sm text-white outline-none focus:border-[#d4ff00] transition-colors placeholder:text-[#666]"
        />
      </div>

      {/* Court Name (AR) */}
      <div>
        <label className="text-xs text-[#999] mb-1.5 block">
          {t("owner.courtNameAr") || "اسم الكورت (عربي)"}
        </label>
        <input
          type="text"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          placeholder="كورت 1"
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-sm px-3 py-2.5 text-sm text-white outline-none focus:border-[#d4ff00] transition-colors placeholder:text-[#666]"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Base price */}
      <div>
        <label className="text-xs text-[#999] mb-1.5 block">
          {t("owner.pricePerHour") || "السعر / ساعة"}{" "}
          <span className="text-[#666]">(EGP)</span>
        </label>
        <input
          type="number"
          dir="ltr"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="300"
          min="1"
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-sm px-3 py-2.5 text-sm text-white outline-none focus:border-[#d4ff00] transition-colors placeholder:text-[#666]"
        />
        {rules.length > 0 && (
          <p className="text-[10px] text-[#666] mt-1.5">
            {t("owner.basePriceHint") ||
              "السعر الأساسي — هيتطبق لو مفيش قاعدة"}
          </p>
        )}
      </div>

      {/* Price rules editor */}
      <PriceRulesEditor
        rules={rules}
        onChange={setRules}
        dayMode={rulesDayMode}
        onDayModeChange={setRulesDayMode}
        basePrice={price}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      {/* Slot duration toggle */}
      <div>
        <label className="text-xs text-[#999] mb-2 block">
          {t("owner.slotDuration") || "مدة الحجز الواحد"}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSlotDuration(60)}
            className={`flex-1 py-2.5 text-sm rounded-sm border transition-colors cursor-pointer active:scale-[0.97] ${
              slotDuration === 60
                ? "bg-[#d4ff00]/15 border-[#d4ff00]/40 text-[#d4ff00]"
                : "border-[#333] text-[#666] hover:border-[#666]"
            }`}
          >
            {t("owner.oneHour") || "1 ساعة"}
          </button>
          <button
            type="button"
            onClick={() => setSlotDuration(30)}
            className={`flex-1 py-2.5 text-sm rounded-sm border transition-colors cursor-pointer active:scale-[0.97] ${
              slotDuration === 30
                ? "bg-[#d4ff00]/15 border-[#d4ff00]/40 text-[#d4ff00]"
                : "border-[#333] text-[#666] hover:border-[#666]"
            }`}
          >
            {t("owner.halfHour") || "30 دقيقة"}
          </button>
        </div>
      </div>

      {/* Same for all days toggle */}
      <div className="flex items-center justify-between bg-[#222] rounded-sm p-3 border border-[#333]">
        <span className="text-sm text-white/90">
          {t("owner.sameAllDays") || "نفس المواعيد كل الأيام"}
        </span>
        <button
          type="button"
          onClick={() => setSameForAllDays((v) => !v)}
          className="cursor-pointer text-[#d4ff00] active:scale-[0.97] transition-transform duration-75"
          aria-label="Toggle same schedule for all days"
        >
          {sameForAllDays ? (
            <ToggleRight size={28} />
          ) : (
            <ToggleLeft size={28} className="text-[#666]" />
          )}
        </button>
      </div>

      {sameForAllDays ? (
        /* All days — single schedule card */
        <ScheduleCard
          label={t("owner.operatingHours") || "ساعات العمل"}
          start={allStart}
          end={allEnd}
          onStartChange={setAllStart}
          onEndChange={setAllEnd}
          slotCount={allDaySlotCount}
          slotDuration={slotDuration}
        />
      ) : (
        /* Split — weekdays + weekends */
        <div className="space-y-3">
          <ScheduleCard
            label={t("owner.weekdaysRange") || "أيام الأسبوع (أحد - خميس)"}
            start={weekdaysStart}
            end={weekdaysEnd}
            onStartChange={setWeekdaysStart}
            onEndChange={setWeekdaysEnd}
            slotCount={weekdaySlotCount}
            slotDuration={slotDuration}
          />
          <ScheduleCard
            label={t("owner.weekendsRange") || "الويكند (جمعة - سبت)"}
            start={weekendsStart}
            end={weekendsEnd}
            onStartChange={setWeekendsStart}
            onEndChange={setWeekendsEnd}
            slotCount={weekendSlotCount}
            slotDuration={slotDuration}
          />
        </div>
      )}
    </div>
  );

  // ── Render ──

  const currentTitle = STEP_TITLES[step - 1];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative z-10 w-full sm:max-w-lg bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#333]" />
          </div>

          {/* Progress bar */}
          <ProgressBar currentStep={step} />

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center h-8 w-8 rounded-sm text-[#666] hover:text-white hover:bg-[#333] transition-colors cursor-pointer"
              aria-label={t("common.close") || "إغلاق"}
            >
              <X size={18} />
            </button>

            <h2 className="text-base font-bold text-white flex-1 text-center">
              {t(currentTitle.key) || currentTitle.fallback}
            </h2>

            {/* Spacer to center title */}
            <div className="w-8" />
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="px-5 pb-2">
              <InlineFeedback message={feedback} />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2
                  size={24}
                  className="animate-spin text-[#d4ff00]"
                />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                >
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                  {step === 3 && renderStep3()}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          {!loading && (
            <div className="border-t border-[#333] px-5 py-4 flex gap-3">
              {/* Previous button */}
              {step > 1 && (
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex items-center justify-center gap-1.5 border border-[#333] text-[#999] rounded-sm px-5 py-2.5 text-sm hover:border-[#666] hover:text-white transition-colors cursor-pointer active:scale-[0.97]"
                >
                  <ChevronRight size={16} className="rtl:hidden" />
                  <ChevronLeft size={16} className="ltr:hidden" />
                  {t("owner.previous") || "السابق"}
                </button>
              )}

              {/* Next / Save button */}
              <button
                type="button"
                onClick={step === TOTAL_STEPS ? handleSave : goNext}
                disabled={!canProceed || saving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#d4ff00] text-[#0d0d0d] rounded-sm py-2.5 text-sm font-bold transition-colors cursor-pointer active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : step === TOTAL_STEPS ? (
                  <>
                    {t("common.save") || "حفظ"}
                    <Check size={16} />
                  </>
                ) : (
                  <>
                    {t("owner.next") || "التالي"}
                    <ChevronLeft size={16} className="rtl:hidden" />
                    <ChevronRight size={16} className="ltr:hidden" />
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Schedule Card ──────────────────────────────────────

interface ScheduleCardProps {
  label: string;
  start: string;
  end: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  slotCount: number;
  slotDuration: 30 | 60;
}

function ScheduleCard({
  label,
  start,
  end,
  onStartChange,
  onEndChange,
  slotCount,
  slotDuration,
}: ScheduleCardProps) {
  const { t } = useTranslation();
  const endOptions = useMemo(() => getEndTimeOptions(start), [start]);

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4">
      <p className="text-xs font-semibold text-[#999] mb-3">{label}</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Start time */}
        <div>
          <label className="text-[10px] text-[#666] mb-1 block">
            {t("owner.startTime") || "من"}
          </label>
          <select
            value={start}
            onChange={(e) => onStartChange(e.target.value)}
            dir="ltr"
            className="w-full bg-[#222] border border-[#333] rounded-sm px-2.5 py-2 text-sm text-white outline-none focus:border-[#d4ff00] transition-colors cursor-pointer"
          >
            {TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* End time */}
        <div>
          <label className="text-[10px] text-[#666] mb-1 block">
            {t("owner.endTime") || "إلى"}
          </label>
          <select
            value={end}
            onChange={(e) => onEndChange(e.target.value)}
            dir="ltr"
            className="w-full bg-[#222] border border-[#333] rounded-sm px-2.5 py-2 text-sm text-white outline-none focus:border-[#d4ff00] transition-colors cursor-pointer"
          >
            {endOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Slot count preview */}
      {slotCount > 0 && (
        <p className="text-[10px] text-[#d4ff00] mt-2.5">
          {slotCount} {t("owner.slotsPerDay") || "فترة/يوم"}{" "}
          <span className="text-[#666]">
            ({slotDuration === 60 ? "60" : "30"} min)
          </span>
        </p>
      )}
    </div>
  );
}
