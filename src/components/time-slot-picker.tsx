"use client";

import { formatTime, formatPrice } from "@/lib/format";
import { Clock } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { LoadingSpinner } from "./loading-spinner";
import { EmptyState } from "./empty-state";

interface TimeSlot {
  startTime: string;
  endTime: string;
  slotDuration?: number;
  availableBlocks?: number;
  pricePerHour?: string | number;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedStartTime: string | null;
  selectedBlockCount: number;
  onSelectTime: (startTime: string) => void;
  onSelectBlocks: (count: number) => void;
  loading?: boolean;
}

export function TimeSlotPicker({
  slots,
  selectedStartTime,
  selectedBlockCount,
  onSelectTime,
  onSelectBlocks,
  loading = false,
}: TimeSlotPickerProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  if (loading) {
    return <LoadingSpinner size="sm" />;
  }

  if (slots.length === 0) {
    return (
      <EmptyState
        icon={<Clock size={28} />}
        title={t("booking.noSlots")}
        description={t("booking.noSlotsDesc")}
      />
    );
  }

  const selectedSlot = slots.find((s) => s.startTime === selectedStartTime);
  const slotDuration = selectedSlot?.slotDuration || 60;
  const maxBlocks = selectedSlot?.availableBlocks || 1;
  const pricePerHour = selectedSlot?.pricePerHour
    ? typeof selectedSlot.pricePerHour === "string"
      ? parseFloat(selectedSlot.pricePerHour)
      : selectedSlot.pricePerHour
    : 0;

  const getBlockLabel = (count: number): string => {
    const totalMinutes = slotDuration * count;
    if (totalMinutes >= 60) {
      const hours = totalMinutes / 60;
      return locale === "ar" ? `${hours} ساعة` : `${hours}h`;
    }
    return locale === "ar" ? `${totalMinutes} دقيقة` : `${totalMinutes}m`;
  };

  const getBlockPrice = (count: number): number => {
    return pricePerHour * ((slotDuration * count) / 60);
  };

  return (
    <div>
      {/* Time grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {slots.map((slot) => {
          const isSelected = selectedStartTime === slot.startTime;
          const slotPrice = slot.pricePerHour
            ? typeof slot.pricePerHour === "string"
              ? parseFloat(slot.pricePerHour)
              : slot.pricePerHour
            : null;

          return (
            <button
              key={slot.startTime}
              onClick={() => {
                onSelectTime(slot.startTime);
                onSelectBlocks(1);
              }}
              className={`relative rounded-sm border p-3.5 text-center transition-colors duration-100 active:scale-[0.97] transition-transform duration-75 ${
                isSelected
                  ? "bg-[#d4ff00] text-[#0d0d0d] border-[#d4ff00]"
                  : "bg-[#1a1a1a] border-[#333] hover:border-[#d4ff00]/40 hover:bg-[#222] text-white"
              }`}
            >
              <div className={`text-lg font-bold font-[family-name:var(--font-display-en)] ${isSelected ? "text-[#0d0d0d]" : "text-white"}`}>
                {formatTime(slot.startTime)}
              </div>
              {slotPrice !== null && (
                <div className={`text-[11px] mt-1 font-medium font-[family-name:var(--font-display-en)] ${isSelected ? "text-[#0d0d0d]/70" : "text-[#d4ff00]/70"}`}>
                  {formatPrice(slotPrice * (slot.slotDuration || 60) / 60)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Block count selector - shown after selecting a time */}
      {selectedStartTime && maxBlocks > 1 && (
        <div className="mt-5">
          <p className="text-xs font-semibold text-[#999] mb-3">
            {locale === "ar" ? "مدة اللعب" : "Session Duration"}
          </p>
          <div className="flex gap-2">
            {Array.from({ length: maxBlocks }, (_, i) => i + 1).map((count) => {
              const isActive = selectedBlockCount === count;
              return (
                <button
                  key={count}
                  onClick={() => onSelectBlocks(count)}
                  className={`flex-1 rounded-sm border p-3 text-center transition-colors duration-100 active:scale-[0.97] transition-transform duration-75 ${
                    isActive
                      ? "bg-[#d4ff00]/15 border-[#d4ff00]/40 text-[#d4ff00]"
                      : "bg-[#1a1a1a] border-[#333] text-[#999] hover:border-[#d4ff00]/20"
                  }`}
                >
                  <div className={`text-sm font-bold font-[family-name:var(--font-display-en)] ${isActive ? "text-[#d4ff00]" : "text-white"}`}>
                    {getBlockLabel(count)}
                  </div>
                  <div className={`text-[11px] mt-0.5 font-medium font-[family-name:var(--font-display-en)] ${isActive ? "text-[#d4ff00]/70" : "text-[#666]"}`}>
                    {formatPrice(getBlockPrice(count))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
