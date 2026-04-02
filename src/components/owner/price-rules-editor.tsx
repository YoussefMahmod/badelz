"use client";

import { Plus, Trash2, Clock } from "lucide-react";
import { useTranslation } from "@/i18n";
import { formatTime } from "@/lib/format";
import { timeToMinutes, endTimeToMinutes } from "@/lib/slot-templates";

// ─── Types ─────────────────────────────────────────────

interface PriceRuleData {
  dayGroup: string;
  startTime: string;
  endTime: string;
  pricePerHour: string;
}

interface PriceRulesEditorProps {
  rules: PriceRuleData[];
  onChange: (rules: PriceRuleData[]) => void;
  dayMode: "all" | "split";
  onDayModeChange: (mode: "all" | "split") => void;
  basePrice: string;
}

// ─── Time Options (hourly, 12h display) ────────────────

/** Generate time options: hourly from 00:00 to 23:00 */
function getStartTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    const val = `${h.toString().padStart(2, "0")}:00`;
    options.push({ value: val, label: formatTime(val) });
  }
  return options;
}

/** Generate end time options: filtered to be after startTime, includes midnight */
function getEndTimeOptions(startTime: string): { value: string; label: string }[] {
  if (!startTime) return getStartTimeOptions();

  const startMin = timeToMinutes(startTime);
  const options: { value: string; label: string }[] = [];

  // Show hours after start time
  for (let h = 0; h < 24; h++) {
    const val = `${h.toString().padStart(2, "0")}:00`;
    const mins = h * 60;
    if (mins > startMin) {
      options.push({ value: val, label: formatTime(val) });
    }
  }

  // Always include midnight (00:00) as "end of day" if start is before midnight
  if (startMin > 0) {
    options.push({
      value: "00:00",
      label: "12:00 ص",
    });
  }

  return options;
}

// ─── Timeline Bar ──────────────────────────────────────

function PricingTimeline({
  rules,
  basePrice,
}: {
  rules: PriceRuleData[];
  basePrice: string;
}) {
  const { t } = useTranslation();
  const validRules = rules.filter((r) => r.startTime && r.endTime && r.pricePerHour);

  if (validRules.length === 0) return null;

  // Find the overall range to display (from earliest start to latest end)
  let minHour = 24;
  let maxHour = 0;
  for (const r of validRules) {
    const startH = timeToMinutes(r.startTime) / 60;
    const endH = endTimeToMinutes(r.endTime) / 60;
    if (startH < minHour) minHour = startH;
    if (endH > maxHour) maxHour = endH;
  }

  // Clamp to reasonable range
  minHour = Math.floor(minHour);
  maxHour = Math.ceil(maxHour);
  const totalHours = maxHour - minHour;

  if (totalHours <= 0) return null;

  // Build segments
  type Segment = { startH: number; endH: number; price: string; isRule: boolean };
  const segments: Segment[] = [];

  // Sort rules by start time
  const sorted = [...validRules].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  let cursor = minHour;
  for (const r of sorted) {
    const rStart = timeToMinutes(r.startTime) / 60;
    const rEnd = endTimeToMinutes(r.endTime) / 60;

    // Gap before this rule = base price
    if (rStart > cursor) {
      segments.push({ startH: cursor, endH: rStart, price: basePrice, isRule: false });
    }

    segments.push({ startH: rStart, endH: rEnd, price: r.pricePerHour, isRule: true });
    cursor = rEnd;
  }

  // Gap after last rule
  if (cursor < maxHour) {
    segments.push({ startH: cursor, endH: maxHour, price: basePrice, isRule: false });
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Clock size={12} className="text-[#666]" />
        <span className="text-[10px] text-[#666] font-semibold uppercase tracking-wide">
          {t("owner.pricingPreview") || "معاينة الأسعار"}
        </span>
      </div>

      {/* Timeline bar */}
      <div className="flex rounded-sm overflow-hidden h-10 border border-[#333]">
        {segments.map((seg, i) => {
          const widthPct = ((seg.endH - seg.startH) / totalHours) * 100;
          return (
            <div
              key={i}
              className={`relative flex flex-col items-center justify-center transition-colors ${
                seg.isRule
                  ? "bg-[#d4ff00]/15 border-x border-[#d4ff00]/30"
                  : "bg-[#1a1a1a]"
              }`}
              style={{ width: `${widthPct}%` }}
            >
              <span
                className={`text-[10px] font-bold leading-none ${
                  seg.isRule ? "text-[#d4ff00]" : "text-[#666]"
                }`}
              >
                {seg.price} {t("common.egp") || "ج.م"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hour labels */}
      <div className="flex justify-between mt-1">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex justify-between text-[9px] text-[#666]"
            style={{ width: `${((seg.endH - seg.startH) / totalHours) * 100}%` }}
          >
            <span>{formatTime(`${Math.floor(seg.startH).toString().padStart(2, "0")}:00`)}</span>
            {i === segments.length - 1 && (
              <span>
                {seg.endH === 24
                  ? "12:00 ص"
                  : formatTime(`${Math.floor(seg.endH).toString().padStart(2, "0")}:00`)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────

export function PriceRulesEditor({
  rules,
  onChange,
  dayMode,
  onDayModeChange,
  basePrice,
}: PriceRulesEditorProps) {
  const { t } = useTranslation();

  const updateRule = (idx: number, field: keyof PriceRuleData, value: string) => {
    const updated = [...rules];
    updated[idx] = { ...updated[idx], [field]: value };

    // If start time changed, clear end time if it's now invalid
    if (field === "startTime" && updated[idx].endTime) {
      const startMin = timeToMinutes(value);
      const endMin = endTimeToMinutes(updated[idx].endTime);
      if (endMin <= startMin) {
        updated[idx].endTime = "";
      }
    }

    onChange(updated);
  };

  const removeRule = (idx: number) => {
    onChange(rules.filter((_, i) => i !== idx));
  };

  const addRule = () => {
    onChange([
      ...rules,
      {
        dayGroup: dayMode === "all" ? "all" : "weekdays",
        startTime: "",
        endTime: "",
        pricePerHour: "",
      },
    ]);
  };

  return (
    <div className="border-t border-[#222] pt-3 mt-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#999]">
          {t("owner.timePricing") || "تسعير حسب الوقت"}
        </span>
        <span className="text-[10px] text-[#666]">
          {t("owner.timePricingHint") || "اختياري — السعر الأساسي هيتطبق لو مفيش قاعدة"}
        </span>
      </div>

      {/* Day mode toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => {
            onDayModeChange("all");
            onChange(rules.map((r) => ({ ...r, dayGroup: "all" })));
          }}
          className={`flex-1 text-xs py-2 rounded-sm border transition-colors ${
            dayMode === "all"
              ? "bg-[#d4ff00]/15 border-[#d4ff00]/40 text-[#d4ff00]"
              : "border-[#333] text-[#666] hover:border-[#666]"
          }`}
        >
          {t("owner.allDays") || "كل الأيام"}
        </button>
        <button
          type="button"
          onClick={() => onDayModeChange("split")}
          className={`flex-1 text-xs py-2 rounded-sm border transition-colors ${
            dayMode === "split"
              ? "bg-[#d4ff00]/15 border-[#d4ff00]/40 text-[#d4ff00]"
              : "border-[#333] text-[#666] hover:border-[#666]"
          }`}
        >
          {t("owner.weekdaysWeekends") || "أيام الأسبوع / ويكند"}
        </button>
      </div>

      {/* Timeline preview */}
      <PricingTimeline rules={rules} basePrice={basePrice} />

      {/* Rule cards */}
      <div className="space-y-2">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className="bg-[#222] rounded-sm p-3 border border-[#333]/50"
          >
            {/* Card header: day badge + delete */}
            <div className="flex items-center justify-between mb-2.5">
              {dayMode === "split" ? (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateRule(idx, "dayGroup", "weekdays")}
                    className={`text-[10px] px-2.5 py-1 rounded-sm border transition-colors ${
                      rule.dayGroup === "weekdays"
                        ? "bg-[#d4ff00]/15 border-[#d4ff00]/40 text-[#d4ff00]"
                        : "border-[#333] text-[#666] hover:border-[#666]"
                    }`}
                  >
                    {t("owner.weekdays") || "أسبوع"}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRule(idx, "dayGroup", "weekends")}
                    className={`text-[10px] px-2.5 py-1 rounded-sm border transition-colors ${
                      rule.dayGroup === "weekends"
                        ? "bg-[#d4ff00]/15 border-[#d4ff00]/40 text-[#d4ff00]"
                        : "border-[#333] text-[#666] hover:border-[#666]"
                    }`}
                  >
                    {t("owner.weekends") || "ويكند"}
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-[#666] px-2 py-1 rounded-sm border border-[#333]">
                  {t("owner.allDays") || "كل الأيام"}
                </span>
              )}

              <button
                type="button"
                onClick={() => removeRule(idx)}
                className="flex items-center justify-center h-7 w-7 rounded-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Time selectors row */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {/* Start time */}
              <div>
                <label className="text-[10px] text-[#666] mb-1 block">
                  {t("owner.from") || "من"}
                </label>
                <select
                  value={rule.startTime}
                  onChange={(e) => updateRule(idx, "startTime", e.target.value)}
                  dir="ltr"
                  className="w-full rounded-sm bg-[#1a1a1a] border border-[#333] px-2.5 py-2 text-sm text-white outline-none focus:border-[#d4ff00] transition-colors"
                >
                  <option value="">{t("owner.from") || "من"}</option>
                  {getStartTimeOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* End time */}
              <div>
                <label className="text-[10px] text-[#666] mb-1 block">
                  {t("owner.to") || "إلى"}
                </label>
                <select
                  value={rule.endTime}
                  onChange={(e) => updateRule(idx, "endTime", e.target.value)}
                  dir="ltr"
                  className="w-full rounded-sm bg-[#1a1a1a] border border-[#333] px-2.5 py-2 text-sm text-white outline-none focus:border-[#d4ff00] transition-colors"
                >
                  <option value="">{t("owner.to") || "إلى"}</option>
                  {getEndTimeOptions(rule.startTime).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price input */}
            <div>
              <label className="text-[10px] text-[#666] mb-1 block">
                {t("owner.pricePerHourLabel") || "ج.م / ساعة"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={rule.pricePerHour}
                  onChange={(e) => updateRule(idx, "pricePerHour", e.target.value)}
                  placeholder="350"
                  min="1"
                  dir="ltr"
                  className="w-full rounded-sm bg-[#1a1a1a] border border-[#333] px-2.5 py-2 text-sm text-white outline-none focus:border-[#d4ff00] transition-colors"
                />
                <span className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#666] pointer-events-none">
                  {t("common.egp") || "ج.م"}
                </span>
              </div>
            </div>

            {/* Rule summary */}
            {rule.startTime && rule.endTime && rule.pricePerHour && (
              <div className="mt-2 pt-2 border-t border-[#333]/50">
                <p className="text-[10px] text-[#999]">
                  {formatTime(rule.startTime)} → {rule.endTime === "00:00" ? "12:00 ص" : formatTime(rule.endTime)}
                  {" · "}
                  <span className="text-[#d4ff00] font-bold">{rule.pricePerHour} {t("common.egp") || "ج.م"}</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add rule button */}
      <button
        type="button"
        onClick={addRule}
        className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs text-[#d4ff00]/70 hover:text-[#d4ff00] py-3 rounded-sm border border-dashed border-[#333] hover:border-[#d4ff00]/40 transition-colors"
      >
        <Plus size={14} />
        {t("owner.addPriceRule") || "إضافة قاعدة تسعير"}
      </button>
    </div>
  );
}
