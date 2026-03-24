"use client";

import { motion } from "framer-motion";
import { Eye, Package } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { LISTING_CATEGORY_COLORS } from "@/lib/constants";

export interface ListingData {
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
  variant?: "default" | "compact";
  onClick?: () => void;
}

const CONDITION_KEYS: Record<string, string> = {
  NEW: "market.new",
  LIKE_NEW: "market.likeNew",
  USED: "market.used",
  WELL_USED: "market.wellUsed",
};

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

function isNew(dateString: string): boolean {
  return Date.now() - new Date(dateString).getTime() < 24 * 60 * 60 * 1000;
}

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
  const hasPhoto = listing.photos.length > 0;
  const showNewBadge = isNew(listing.createdAt);

  /* ─── Compact Variant (for trending carousel) ─── */
  if (variant === "compact") {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="h-24 rounded-xl overflow-hidden flex bg-[#0d1220] cursor-pointer group"
      >
        {/* Photo */}
        <div className="w-24 h-24 shrink-0 overflow-hidden">
          {hasPhoto ? (
            <img
              src={listing.photos[0]}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}14` }}
            >
              <Package size={24} style={{ color: accentColor }} className="opacity-30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col justify-center min-w-0">
          <p className="text-xs font-bold text-white/90 line-clamp-1">
            {displayTitle}
          </p>
          <p className="text-sm font-bold mt-0.5" style={{ color: accentColor }}>
            {listing.price}{" "}
            <span className="text-[10px] text-white/30 font-normal">
              {t("common.egp")}
            </span>
          </p>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-white/30">
            <Eye size={10} />
            <span>{listing.views}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ─── Default Variant (main grid card) ─── */
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden bg-[#0d1220] group cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30 transition-all duration-300"
      style={{ borderTop: `4px solid ${accentColor}` }}
    >
      {/* Photo area */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {hasPhoto ? (
          <img
            src={listing.photos[0]}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}14` }}
          >
            <Package size={36} style={{ color: accentColor }} className="opacity-25" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1220] via-transparent to-transparent" />

        {/* Condition pill - top right */}
        <span className="absolute top-2.5 end-2.5 bg-black/50 backdrop-blur-sm text-[10px] text-white/80 uppercase tracking-wider px-2.5 py-1 rounded-full">
          {t(conditionKey as Parameters<typeof t>[0])}
        </span>

        {/* NEW badge - top left */}
        {showNewBadge && (
          <span className="absolute top-2.5 start-2.5 bg-emerald-500 text-white text-[8px] font-bold px-2.5 py-0.5 rounded-full animate-pulse whitespace-nowrap">
            {t("market.newBadge" as Parameters<typeof t>[0])}
          </span>
        )}
      </div>

      {/* Info area */}
      <div className="p-3.5">
        {/* Title */}
        <p className="text-sm font-bold text-white/90 line-clamp-1">
          {displayTitle}
        </p>

        {/* Price */}
        <p className="text-lg font-bold mt-1" style={{ color: accentColor }}>
          {listing.price}{" "}
          <span className="text-xs text-white/30 font-normal">
            {t("common.egp")}
          </span>
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 text-[10px] text-white/30 mt-1.5">
          <span className="flex items-center gap-0.5">
            <Eye size={10} />
            {listing.views}
          </span>
          <span>&middot;</span>
          <span>{getTimeAgo(listing.createdAt)}</span>
          <span>&middot;</span>
          <span className="truncate">{displayArea}</span>
        </div>
      </div>
    </motion.div>
  );
}
