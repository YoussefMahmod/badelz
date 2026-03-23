"use client";

import { motion } from "framer-motion";
import { RectangleHorizontal } from "lucide-react";
import { cardHoverSubtle } from "@/lib/animations";
import { useTranslation, useLocale } from "@/i18n";
import { formatPrice } from "@/lib/format";

interface CourtCardProps {
  court: {
    id: string;
    name: string;
    nameAr?: string | null;
    pricePerHour: string | number;
    sportType?: string;
  };
  venueId: string;
  onBook?: (courtId: string) => void;
}

export function CourtCard({ court, venueId, onBook }: CourtCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const displayName = locale === "ar" && court.nameAr ? court.nameAr : court.name;
  const price = typeof court.pricePerHour === "string"
    ? parseFloat(court.pricePerHour)
    : court.pricePerHour;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...cardHoverSubtle}
      className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-[#c8ff00]/20 hover:shadow-[0_0_30px_rgba(200,255,0,0.06)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c8ff00]/10">
            <RectangleHorizontal size={22} className="text-[#c8ff00]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-white truncate">
              {displayName}
            </h4>
            <p className="text-sm text-[#c8ff00] font-semibold">
              {t("venue.pricePerHour", { price: formatPrice(price) })}
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => onBook?.(court.id)}
          className="shrink-0 rounded-full bg-[#c8ff00] px-5 py-2.5 text-sm font-bold text-[#111827] transition-all hover:shadow-[0_0_20px_rgba(200,255,0,0.25)] active:scale-95"
        >
          {t("venue.bookNow")}
        </motion.button>
      </div>
    </motion.div>
  );
}
