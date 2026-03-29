"use client";

import { RectangleHorizontal } from "lucide-react";
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
    <div className="bg-[#1a1a1a] border-s-[3px] border-s-[#d4ff00] rounded-sm p-4 transition-colors duration-200 hover:bg-[#222]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-[#d4ff00]/10">
            <RectangleHorizontal size={22} className="text-[#d4ff00]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-white truncate">
              {displayName}
            </h4>
            <p className="text-sm text-[#d4ff00] font-semibold font-[family-name:var(--font-display-en)]">
              {t("venue.pricePerHour", { price: formatPrice(price) })}
            </p>
          </div>
        </div>
        <button
          onClick={() => onBook?.(court.id)}
          className="shrink-0 rounded-sm bg-[#d4ff00] px-5 py-2.5 text-sm font-bold text-[#0d0d0d] active:scale-[0.97] transition-transform duration-75"
        >
          {t("venue.bookNow")}
        </button>
      </div>
    </div>
  );
}
