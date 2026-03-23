"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Star, RectangleHorizontal } from "lucide-react";
import { bentoItem, cardHover, cardHoverSubtle } from "@/lib/animations";
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
    <motion.div
      variants={bentoItem}
      {...(isLarge ? cardHover : cardHoverSubtle)}
      className={isLarge ? "sm:col-span-2" : ""}
    >
      <Link href={`/venues/${venue.id}`} className="group block">
        <div
          className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#111827] transition-all duration-300 hover:border-[#c8ff00]/20 hover:shadow-[0_0_30px_rgba(200,255,0,0.08)]`}
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
                {/* Darker gradient overlay for dark theme */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
              </>
            ) : (
              <div className="h-full w-full bg-white/5 flex items-center justify-center">
                <RectangleHorizontal className="h-14 w-14 text-white/10" />
              </div>
            )}

            {/* Court count badge -- lime chip on photo */}
            <div className="absolute top-3 start-3 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8ff00] px-3 py-1 text-xs font-bold text-[#111827]">
                <RectangleHorizontal size={11} />
                {t("browse.courts", { count: venue.courtCount })}
              </span>
            </div>

            {/* Price badge */}
            {minPrice !== undefined && (
              <div className="absolute top-3 end-3 z-10">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#c8ff00] backdrop-blur-sm">
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
              <span className="flex items-center gap-1 text-white/50">
                <MapPin size={13} className="text-white/30" />
                {displayCity}
              </span>
              {venue.rating > 0 ? (
                <span className="flex items-center gap-1 text-[#c8ff00]">
                  <Star size={13} className="fill-[#c8ff00] text-[#c8ff00]" />
                  {venue.rating.toFixed(1)}
                  <span className="text-white/30">({venue.ratingCount})</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-white/30 text-xs">
                  {t("venue.noRating")}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
