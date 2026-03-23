"use client";

import { Eye, MapPin, Package } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { LISTING_CATEGORY_COLORS } from "@/lib/constants";
import { CardShell } from "./card-shell";

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
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
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
  size = "md",
  interactive = true,
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

  if (size === "sm") {
    return (
      <CardShell
        accentColor={accentColor}
        size="sm"
        interactive={interactive}
        onClick={onClick}
      >
        <div className="flex flex-col h-full">
          {/* Photo top half */}
          <div className="relative h-[55%] bg-white/5">
            {hasPhoto ? (
              <img
                src={listing.photos[0]}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}10` }}
              >
                <Package size={20} style={{ color: accentColor }} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          {/* Info */}
          <div className="flex-1 p-2 flex flex-col justify-between">
            <p className="text-white font-bold text-[10px] line-clamp-2 leading-tight">
              {displayTitle}
            </p>
            <p
              className="font-extrabold text-sm font-[family-name:var(--font-display)]"
              style={{ color: "#c8ff00" }}
            >
              {listing.price} {t("common.egp")}
            </p>
          </div>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell
      accentColor={accentColor}
      size={size}
      interactive={interactive}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Photo area — top 50% */}
        <div className="relative h-[50%] bg-white/5 overflow-hidden">
          {hasPhoto ? (
            <img
              src={listing.photos[0]}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}10` }}
            >
              <Package size={32} style={{ color: accentColor }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Category badge — top start */}
          <span
            className="absolute top-2 start-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
          >
            {t(categoryKey as Parameters<typeof t>[0])}
          </span>

          {/* Condition badge — top end */}
          <span className="absolute top-2 end-2 glass-dark text-[10px] font-medium px-2 py-0.5 rounded-full text-white/70">
            {t(conditionKey as Parameters<typeof t>[0])}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          {/* Title */}
          <p
            className={`text-white font-bold line-clamp-2 leading-tight ${
              size === "lg" ? "text-base" : "text-sm"
            }`}
          >
            {displayTitle}
          </p>

          {/* Price */}
          <p className="text-[#c8ff00] text-xl font-extrabold font-[family-name:var(--font-display)] mt-1">
            {listing.price}{" "}
            <span className="text-xs text-white/40 font-normal">
              {t("common.egp")}
            </span>
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-between mt-2 text-white/40 text-xs">
            <span className="flex items-center gap-1">
              <Eye size={10} />
              {listing.views}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {displayArea}
            </span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}
