"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Star, RectangleHorizontal, ArrowUpRight } from "lucide-react";
import { revealScale } from "@/lib/animations";
import { useTranslation, useLocale } from "@/i18n";

interface FeaturedVenueCardProps {
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
  };
}

export function FeaturedVenueCard({ venue }: FeaturedVenueCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const displayName = locale === "ar" && venue.nameAr ? venue.nameAr : venue.name;
  const displayCity = locale === "ar" && venue.cityAr ? venue.cityAr : venue.city;

  return (
    <motion.div {...revealScale} className="mb-6 [perspective:1200px]">
      <Link href={`/venues/${venue.id}`} className="group block">
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/10 transition-all duration-500 group-hover:border-[#c8ff00]/20 group-hover:shadow-[0_0_40px_rgba(200,255,0,0.1)] group-hover:[transform:rotateX(2deg)_translateY(-4px)]">
          {/* Cover photo */}
          {venue.coverPhoto ? (
            <img
              src={venue.coverPhoto}
              alt={displayName}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 h-full w-full bg-white/5 flex items-center justify-center">
              <RectangleHorizontal className="h-20 w-20 text-white/10" />
            </div>
          )}

          {/* Stronger dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/40 to-transparent" />

          {/* Featured badge -- lime with glow */}
          <div className="absolute top-4 start-4 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#c8ff00] px-3 py-1 text-xs font-bold text-[#111827] shadow-[0_0_20px_rgba(200,255,0,0.3)]">
              <Star size={11} className="fill-[#111827] text-[#111827]" />
              {t("landing.featuredVenue")}
            </span>
          </div>

          {/* Court count badge -- lime */}
          <div className="absolute top-4 end-4 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#c8ff00] px-3 py-1 text-xs font-bold text-[#111827]">
              <RectangleHorizontal size={11} />
              {t("browse.courts", { count: venue.courtCount })}
            </span>
          </div>

          {/* Content at bottom (white text on dark overlay) */}
          <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {displayName}
            </h2>

            <div className="flex items-center gap-3 text-sm text-white/55 mb-4">
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-white/30" />
                {displayCity}
              </span>
              {venue.rating > 0 && (
                <span className="flex items-center gap-1 text-[#c8ff00]">
                  <Star size={14} className="fill-[#c8ff00] text-[#c8ff00]" />
                  {venue.rating.toFixed(1)}
                  <span className="text-white/30">({venue.ratingCount})</span>
                </span>
              )}
            </div>

            <motion.span
              whileHover={{ gap: "0.75rem" }}
              className="inline-flex items-center gap-2 rounded-full bg-[#c8ff00] px-5 py-2.5 text-sm font-bold text-[#111827] shadow-[0_0_20px_rgba(200,255,0,0.25)] transition-all"
            >
              {t("venue.bookNow")}
              <ArrowUpRight size={14} />
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
