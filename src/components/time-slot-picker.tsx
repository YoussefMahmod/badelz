"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
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
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-3 gap-3 sm:grid-cols-4"
      >
        {slots.map((slot) => {
          const isSelected = selectedStartTime === slot.startTime;
          const slotPrice = slot.pricePerHour
            ? typeof slot.pricePerHour === "string"
              ? parseFloat(slot.pricePerHour)
              : slot.pricePerHour
            : null;

          return (
            <motion.button
              key={slot.startTime}
              variants={staggerItem}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onSelectTime(slot.startTime);
                onSelectBlocks(1);
              }}
              className={`relative rounded-xl border p-3.5 text-center transition-all duration-200 ${
                isSelected
                  ? "bg-gradient-to-b from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                  : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-white/90"
              }`}
            >
              <div className={`text-lg font-bold ${isSelected ? "text-white" : "text-white/90"}`}>
                {formatTime(slot.startTime)}
              </div>
              {slotPrice !== null && (
                <div className={`text-[11px] mt-1 font-medium ${isSelected ? "text-white/80" : "text-emerald-400/70"}`}>
                  {formatPrice(slotPrice * (slot.slotDuration || 60) / 60)}
                </div>
              )}
              {isSelected && (
                <motion.div
                  layoutId="slot-indicator"
                  className="absolute inset-0 rounded-xl ring-2 ring-emerald-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Block count selector - shown after selecting a time */}
      {selectedStartTime && maxBlocks > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-5"
        >
          <p className="text-xs font-semibold text-white/50 mb-3">
            {locale === "ar" ? "مدة اللعب" : "Session Duration"}
          </p>
          <div className="flex gap-2">
            {Array.from({ length: maxBlocks }, (_, i) => i + 1).map((count) => {
              const isActive = selectedBlockCount === count;
              return (
                <motion.button
                  key={count}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectBlocks(count)}
                  className={`flex-1 rounded-xl border p-3 text-center transition-all ${
                    isActive
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                  }`}
                >
                  <div className={`text-sm font-bold ${isActive ? "text-emerald-400" : "text-white/80"}`}>
                    {getBlockLabel(count)}
                  </div>
                  <div className={`text-[11px] mt-0.5 font-medium ${isActive ? "text-emerald-400/70" : "text-white/40"}`}>
                    {formatPrice(getBlockPrice(count))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
