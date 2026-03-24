"use client";

import { motion } from "framer-motion";
import { MapPin, Package } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { LISTING_CATEGORY_COLORS } from "@/lib/constants";

interface ListingData {
  id: string;
  title: string;
  titleAr?: string | null;
  price: number | string;
  category: string;
  condition: string;
  photos: string[];
  area: string;
  areaAr?: string | null;
  views: number;
  createdAt: string;
}

interface ListingCardProps {
  listing: ListingData;
  variant?: "default" | "spotlight";
  onClick?: () => void;
}

const CONDITION_KEYS: Record<string, string> = {
  NEW: "market.new",
  LIKE_NEW: "market.likeNew",
  USED: "market.used",
  WELL_USED: "market.wellUsed",
};

const CATEGORY_KEYS: Record<string, string> = {
  RACKETS: "market.rackets",
  SHOES: "market.shoes",
  BAGS: "market.bags",
  BALLS: "market.balls",
  APPAREL: "market.apparel",
  ACCESSORIES: "market.accessories",
  OTHER: "market.other",
};

export function ListingCard({
  listing,
  variant = "default",
  onClick,
}: ListingCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const accentColor = LISTING_CATEGORY_COLORS[listing.category] ?? "#9ca3af";
  const displayTitle =
    locale === "ar" && listing.titleAr ? listing.titleAr : listing.title;
  const displayArea =
    locale === "ar" && listing.areaAr ? listing.areaAr : listing.area;
  const conditionKey = CONDITION_KEYS[listing.condition] ?? "market.used";
  const categoryKey = CATEGORY_KEYS[listing.category] ?? "market.other";
  const hasPhoto = listing.photos.length > 0;

  /* ─── Spotlight Card (full-width landscape hero) ─── */
  if (variant === "spotlight") {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative h-48 sm:h-56 rounded-2xl overflow-hidden cursor-pointer group"
        style={{
          background: `linear-gradient(135deg, ${accentColor}12 0%, #0a0f1a 60%)`,
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 70% 50%, ${accentColor}30, transparent 70%)`,
          }}
        />

        <div className="flex h-full">
          {/* Photo side */}
          <div className="relative w-1/2 h-full overflow-hidden">
            {hasPhoto ? (
              <img
                src={listing.photos[0]}
                alt={displayTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}08` }}
              >
                <Package size={48} style={{ color: accentColor }} className="opacity-30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0f1a]/80" />
          </div>

          {/* Info side */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between relative z-10">
            {/* Category label */}
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em] font-[family-name:var(--font-display)]"
              style={{ color: accentColor }}
            >
              {t(categoryKey as Parameters<typeof t>[0])}
            </span>

            <div>
              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2 leading-tight mb-1">
                {displayTitle}
              </h3>

              {/* Condition */}
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/35 font-[family-name:var(--font-display)]">
                {t(conditionKey as Parameters<typeof t>[0])}
              </span>
            </div>

            {/* Price */}
            <p className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-display)] text-[#c8ff00]">
              {listing.price}{" "}
              <span className="text-xs text-white/30 font-normal">
                {t("common.egp")}
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ─── Default Card (sport product style) ─── */
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative rounded-t-none rounded-b-2xl bg-[#0d1220] overflow-hidden cursor-pointer group"
    >
      {/* Category color band */}
      <div className="h-1" style={{ backgroundColor: accentColor }} />

      {/* Photo area - 70% */}
      <div className="relative h-44 bg-white/5 overflow-hidden">
        {hasPhoto ? (
          <img
            src={listing.photos[0]}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}08` }}
          >
            <Package size={36} style={{ color: accentColor }} className="opacity-25" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1220] via-transparent to-transparent" />
      </div>

      {/* Info area */}
      <div className="p-3 pt-2">
        {/* Condition */}
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/35 font-[family-name:var(--font-display)]">
          {t(conditionKey as Parameters<typeof t>[0])}
        </span>

        {/* Title */}
        <p className="text-sm font-bold text-white line-clamp-1 leading-tight mt-1">
          {displayTitle}
        </p>

        {/* Price */}
        <p className="text-[22px] font-extrabold font-[family-name:var(--font-display)] text-[#c8ff00] mt-1">
          {listing.price}{" "}
          <span className="text-[10px] text-white/30 font-normal">
            {t("common.egp")}
          </span>
        </p>

        {/* Area - shows on hover */}
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-white/0 group-hover:text-white/30 transition-colors duration-300">
          <MapPin size={9} />
          <span>{displayArea}</span>
        </div>
      </div>
    </motion.div>
  );
}
