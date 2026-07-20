"use client";

import Link from "next/link";
import { MapPin, Star, RectangleHorizontal, ArrowUpRight, Sparkles } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import { formatPrice } from "@/lib/format";

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
    isFoundingVenue?: boolean;
    minPrice?: number;
    maxPrice?: number;
  };
}

export function FeaturedVenueCard({ venue }: FeaturedVenueCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const displayName = locale === "ar" && venue.nameAr ? venue.nameAr : venue.name;
  const displayCity = locale === "ar" && venue.cityAr ? venue.cityAr : venue.city;
  const currencyLocale = locale === "ar" ? "ar-EG" : "en-EG";
  const hasPriceRange = typeof venue.minPrice === "number" || typeof venue.maxPrice === "number";
  const priceLabel =
    hasPriceRange && typeof venue.minPrice === "number" && typeof venue.maxPrice === "number" && venue.maxPrice > 0
      ? venue.minPrice === venue.maxPrice
        ? t("browse.priceSingle", {
          price: formatPrice(venue.minPrice, currencyLocale),
        })
        : t("browse.priceRange", {
          minPrice: formatPrice(venue.minPrice, currencyLocale),
          maxPrice: formatPrice(venue.maxPrice, currencyLocale),
        })
      : undefined;

  return (
    <div className="mb-6">
      <Link href={`/venues/${venue.id}`} className="group block">
        <div className="relative rounded-sm overflow-hidden bg-[#d4ff00] active:scale-[0.97] transition-transform duration-75">
          {/* Cover photo with dark overlay for text */}
          {venue.coverPhoto ? (
            <div className="relative h-64 sm:h-80 overflow-hidden">
              <img
                src={venue.coverPhoto}
                alt={displayName}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Dark overlay so lime elements pop */}
              <div className="absolute inset-0 bg-[#0d0d0d]/60" />

              {/* Featured badge */}
              <div className="absolute top-4 start-4 z-10">
                <span className="inline-flex items-center gap-1 rounded-sm bg-[#d4ff00] px-3 py-1 text-xs font-bold text-[#0d0d0d]">
                  <Star size={11} className="fill-[#0d0d0d] text-[#0d0d0d]" />
                  {t("landing.featuredVenue")}
                </span>
              </div>

              {/* Founding venue badge */}
              {venue.isFoundingVenue && (
                <div className="absolute top-14 start-4 z-10">
                  <span className="inline-flex items-center gap-1 rounded-sm bg-[#ffd700] px-3 py-1 text-xs font-bold text-[#0d0d0d]">
                    <Sparkles size={11} />
                    {t("venue.foundingVenue")}
                  </span>
                </div>
              )}

              {/* Court count badge */}
              <div className="absolute top-4 end-4 z-10">
                <span className="inline-flex items-center gap-1 rounded-sm bg-[#d4ff00] px-3 py-1 text-xs font-bold text-[#0d0d0d]">
                  <RectangleHorizontal size={11} />
                  {t("browse.courts", { count: venue.courtCount })}
                </span>
              </div>

              {/* Content at bottom */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 z-10">
                <h2 className="font-[family-name:var(--font-display-en)] text-2xl sm:text-3xl uppercase font-bold text-[#d4ff00] mb-2 line-clamp-1">
                  {displayName}
                </h2>

                <div className="flex items-center gap-3 text-sm text-white/70 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-white/50" />
                    {displayCity}
                  </span>
                  {venue.rating > 0 && (
                    <span className="flex items-center gap-1 text-[#d4ff00]">
                      <Star size={14} className="fill-[#d4ff00] text-[#d4ff00]" />
                      {venue.rating.toFixed(1)}
                      <span className="text-white/50">({venue.ratingCount})</span>
                    </span>
                  )}
                </div>

                {priceLabel && (
                  <div className="mb-4">
                    <span className="inline-flex rounded-sm bg-[#0d0d0d]/70 px-3 py-1 text-sm font-semibold text-[#d4ff00]">
                      {priceLabel}
                    </span>
                  </div>
                )}

                <span className="inline-flex items-center gap-2 rounded-sm bg-[#d4ff00] px-5 py-2.5 text-sm font-bold text-[#0d0d0d] transition-all hover:gap-3">
                  {t("venue.bookNow")}
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          ) : (
            /* No cover photo — full lime block */
            <div className="p-6 sm:p-8">
              {/* Badges row */}
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center gap-1 rounded-sm bg-[#0d0d0d] px-3 py-1 text-xs font-bold text-[#d4ff00]">
                  <Star size={11} className="fill-[#d4ff00] text-[#d4ff00]" />
                  {t("landing.featuredVenue")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-sm bg-[#0d0d0d] px-3 py-1 text-xs font-bold text-[#d4ff00]">
                  <RectangleHorizontal size={11} />
                  {t("browse.courts", { count: venue.courtCount })}
                </span>
              </div>

              {venue.isFoundingVenue && (
                <span className="inline-flex items-center gap-1 rounded-sm bg-[#0d0d0d]/20 px-3 py-1 text-xs font-bold text-[#0d0d0d] mb-4">
                  <Sparkles size={11} />
                  {t("venue.foundingVenue")}
                </span>
              )}

              <h2 className="font-[family-name:var(--font-display-en)] text-2xl sm:text-3xl uppercase font-bold text-[#0d0d0d] mb-2 line-clamp-1">
                {displayName}
              </h2>

              <div className="flex items-center gap-3 text-sm text-[#0d0d0d]/70 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-[#0d0d0d]/50" />
                  {displayCity}
                </span>
                {venue.rating > 0 && (
                  <span className="flex items-center gap-1 text-[#0d0d0d]">
                    <Star size={14} className="fill-[#0d0d0d] text-[#0d0d0d]" />
                    {venue.rating.toFixed(1)}
                    <span className="text-[#0d0d0d]/50">({venue.ratingCount})</span>
                  </span>
                )}
              </div>

              {priceLabel && (
                <div className="mb-6">
                  <span className="inline-flex rounded-sm bg-[#0d0d0d]/80 px-3 py-1 text-sm font-semibold text-[#d4ff00]">
                    {priceLabel}
                  </span>
                </div>
              )}

              <span className="inline-flex items-center gap-2 rounded-sm bg-[#0d0d0d] px-5 py-2.5 text-sm font-bold text-[#d4ff00] transition-all hover:gap-3">
                {t("venue.bookNow")}
                <ArrowUpRight size={14} />
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
