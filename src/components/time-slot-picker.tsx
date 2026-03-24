"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { formatTime, formatPrice } from "@/lib/format";
import { Clock } from "lucide-react";
import { useTranslation } from "@/i18n";
import { LoadingSpinner } from "./loading-spinner";
import { EmptyState } from "./empty-state";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  pricePerHour?: string | number;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelect: (slotId: string) => void;
  loading?: boolean;
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelect,
  loading = false,
}: TimeSlotPickerProps) {
  const { t } = useTranslation();

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

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {slots.map((slot) => {
        const isSelected = selectedSlot === slot.id;
        const slotPrice = slot.pricePerHour
          ? typeof slot.pricePerHour === "string"
            ? parseFloat(slot.pricePerHour)
            : slot.pricePerHour
          : null;

        return (
          <motion.button
            key={slot.id}
            variants={staggerItem}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(slot.id)}
            className={`relative rounded-xl border p-4 text-center transition-all duration-200 ${
              isSelected
                ? "bg-gradient-to-b from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-white/90"
            }`}
          >
            <div className={`text-lg font-bold ${isSelected ? "text-white" : "text-white/90"}`}>
              {formatTime(slot.startTime)}
            </div>
            <div className={`text-xs mt-1 ${isSelected ? "text-white/70" : "text-white/40"}`}>
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </div>
            {slotPrice !== null && (
              <div className={`text-xs mt-1 font-medium ${isSelected ? "text-white/90" : "text-emerald-400/70"}`}>
                {formatPrice(slotPrice)}
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
  );
}
