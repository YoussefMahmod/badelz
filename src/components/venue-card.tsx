"use client";

import Link from "next/link";
import { MapPin, Star, RectangleHorizontal, Sparkles } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { formatPrice } from "@/lib/format";

interface VenueCardProps {
  venue: {
    id: string;
    name: string;
    nameAr?: string | null;
    city: string;
    cityAr?: string | null;
    coverPhoto?: string | null;
    rating: number;
    ratingCount: number;
    courtCount: number;
    sportTypes?: string[];
    isFoundingVenue?: boolean;
  };
  minPrice?: number;
  size?: "standard" | "large";
}

export function VenueCard({ venue, minPrice, size = "standard" }: VenueCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const displayName = locale === "ar" && venue.nameAr ? venue.nameAr : venue.name;
  const displayCity = locale === "ar" && venue.cityAr ? venue.cityAr : venue.city;

  const isLarge = size === "large";

  return (
    <div className={isLarge ? "sm:col-span-2" : ""}>
      <Link href={`/venues/${venue.id}`} className="group block">
        <div
          className="relative overflow-hidden rounded-sm border-s-[3px] border-s-[#d4ff00] bg-[#1a1a1a] transition-colors duration-200 hover:bg-[#222] active:scale-[0.97] transition-transform duration-75"
        >
          {/* Cover image */}
          <div className={`relative overflow-hidden ${isLarge ? "h-56" : "h-48"}`}>
            {venue.coverPhoto ? (
              <>
                <img
                  src={venue.coverPhoto}
                  alt={displayName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Darker gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
              </>
            ) : (
              <div className="h-full w-full bg-[#222] flex items-center justify-center">
                <RectangleHorizontal className="h-14 w-14 text-[#666]" />
              </div>
            )}

            {/* Court count badge */}
            <div className="absolute top-3 start-3 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#d4ff00] px-3 py-1 text-xs font-bold text-[#0d0d0d]">
                <RectangleHorizontal size={11} />
                {t("browse.courts", { count: venue.courtCount })}
              </span>
            </div>

            {/* Founding venue badge */}
            {venue.isFoundingVenue && (
              <div className="absolute bottom-3 start-3 z-10">
                <span className="inline-flex items-center gap-1 rounded-sm bg-[#ffd700] px-3 py-1 text-xs font-bold text-[#0d0d0d]">
                  <Sparkles size={11} />
                  {t("venue.foundingVenue")}
                </span>
              </div>
            )}

            {/* Price badge */}
            {minPrice !== undefined && (
              <div className="absolute top-3 end-3 z-10">
                <span className="rounded-sm bg-[#0d0d0d]/80 px-3 py-1 text-xs font-bold text-[#d4ff00] font-[family-name:var(--font-display-en)]">
                  {t("browse.priceFrom", { price: formatPrice(minPrice) })}
                </span>
              </div>
            )}
          </div>

          {/* Info section */}
          <div className={`${isLarge ? "p-5" : "p-4"}`}>
            <h3 className={`font-bold text-white mb-1 line-clamp-1 ${isLarge ? "text-xl" : "text-lg"}`}>
              {displayName}
            </h3>

            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-[#999]">
                <MapPin size={13} className="text-[#666]" />
                {displayCity}
              </span>
              {venue.rating > 0 ? (
                <span className="flex items-center gap-1 text-[#d4ff00]">
                  <Star size={13} className="fill-[#d4ff00] text-[#d4ff00]" />
                  {venue.rating.toFixed(1)}
                  <span className="text-[#666]">({venue.ratingCount})</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[#666] text-xs">
                  {t("venue.noRating")}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
