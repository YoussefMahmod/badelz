"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { VenueCard } from "@/components/venue-card";
import { FeaturedVenueCard } from "@/components/featured-venue-card";
import { EmptyState } from "@/components/empty-state";
import { useVenues } from "@/hooks/use-venues";
import { useTranslation, useLocale } from "@/i18n";
import { formatPrice } from "@/lib/format";

const AREAS = [
  { key: "all", labelEn: "All Areas", labelAr: "كل المناطق" },
  { key: "New Cairo", labelEn: "New Cairo", labelAr: "القاهرة الجديدة" },
  { key: "Sheikh Zayed", labelEn: "Sheikh Zayed", labelAr: "الشيخ زايد" },
  { key: "Maadi", labelEn: "Maadi", labelAr: "المعادي" },
  { key: "Nasr City", labelEn: "Nasr City", labelAr: "مدينة نصر" },
  { key: "6th of October", labelEn: "6th of October", labelAr: "أكتوبر" },
  { key: "Heliopolis", labelEn: "Heliopolis", labelAr: "مصر الجديدة" },
];

const DEFAULT_MAX_PRICE = 5000;

export default function BrowsePage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [selectedArea, setSelectedArea] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState(DEFAULT_MAX_PRICE);

  const { venues, loading } = useVenues({
    city: selectedArea === "all" ? undefined : selectedArea,
    search: debouncedSearch || undefined,
  });

  const currencyLocale = locale === "ar" ? "ar-EG" : "en-EG";

  const highestPrice = useMemo(() => {
    const values = venues.map((venue) => venue.maxPrice ?? venue.minPrice ?? 0);
    return values.length > 0 ? Math.max(...values) : DEFAULT_MAX_PRICE;
  }, [venues]);

  useEffect(() => {
    if (highestPrice > 0) {
      setMaxPriceFilter((current) => (current === 0 || current > highestPrice ? highestPrice : current));
    }
  }, [highestPrice]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const timeout = setTimeout(() => setDebouncedSearch(value), 400);
    return () => clearTimeout(timeout);
  };

const filteredVenues = useMemo(() => {
  return venues.filter(
    (venue) =>
      venue.minPrice &&
      venue.minPrice > 0 &&
      venue.minPrice <= maxPriceFilter
  );
}, [venues, maxPriceFilter]);

  const featuredVenue = useMemo(() => {
    if (filteredVenues.length === 0) return null;
    const sorted = [...filteredVenues].sort((a, b) => b.rating - a.rating);
    return sorted[0];
  }, [filteredVenues]);

  const remainingVenues = useMemo(() => {
    if (!featuredVenue) return filteredVenues;
    return filteredVenues.filter((v) => v.id !== featuredVenue.id);
  }, [filteredVenues, featuredVenue]);

  const skeletons = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-sm overflow-hidden animate-pulse bg-[#1a1a1a] border border-[#333]">
          <div className="h-48 dark-skeleton" />
          <div className="p-4 space-y-3">
            <div className="h-5 w-3/4 rounded-lg dark-skeleton" />
            <div className="h-4 w-1/2 rounded-lg dark-skeleton" />
          </div>
        </div>
      )),
    []
  );

  const featuredSkeleton = useMemo(
    () => (
      <div className="h-64 sm:h-80 rounded-sm overflow-hidden animate-pulse dark-skeleton border border-[#333] mb-6" />
    ),
    []
  );

  return (
    <MainLayout showNav navType="public">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Page title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl uppercase font-[family-name:var(--font-display-en)] font-bold text-white mb-6"
        >
          {t("browse.title")}
        </motion.h1>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-5"
        >
          <div className="absolute start-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11">
            <Search size={20} className="text-[#666]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("browse.searchPlaceholder")}
            className="w-full rounded-sm bg-[#1a1a1a] border-2 border-[#333] ps-12 pe-4 py-4 text-base text-white outline-none placeholder:text-[#666] focus:border-[#d4ff00] transition-all"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-5 rounded-sm border border-[#333] bg-[#1a1a1a] p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{t("browse.maxPrice")}</p>
              <p className="text-xs text-[#666]">{t("browse.maxPriceHint")}</p>
            </div>
            <span className="text-sm font-bold text-[#d4ff00]">{formatPrice(maxPriceFilter, currencyLocale)}</span>
          </div>

          <input
            type="range"
            min={0}
            max={highestPrice}
            step={50}
            value={maxPriceFilter}
            onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#222] accent-[#d4ff00]"
          />

          <div className="mt-3 flex items-center justify-between text-xs text-[#666]">
            <span>{formatPrice(0, currencyLocale)}</span>
            <span>{formatPrice(highestPrice, currencyLocale)}</span>
          </div>
        </motion.div>

        {/* Area chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative flex gap-2 overflow-x-auto hide-scrollbar pb-5"
        >
          {AREAS.map((area) => {
            const isSelected = selectedArea === area.key;
            const label = locale === "ar" ? area.labelAr : area.labelEn;
            return (
              <button
                key={area.key}
                onClick={() => setSelectedArea(area.key)}
                className={`shrink-0 flex items-center gap-1.5 rounded-sm px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer active:scale-[0.97] transition-transform duration-75 ${isSelected
                    ? "bg-[#d4ff00] text-[#0d0d0d]"
                    : "border border-[#333] text-[#999] hover:text-white hover:bg-[#222]"
                  }`}
              >
                <span className="relative flex items-center gap-1.5">
                  {area.key !== "all" && <MapPin size={12} />}
                  {label}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div>
            {featuredSkeleton}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {skeletons}
            </div>
          </div>
        ) : filteredVenues.length === 0 ? (
          <EmptyState
            icon={<Search size={28} />}
            title={t("browse.noVenues")}
            description={t("browse.noVenuesDesc")}
            action={{
              label: t("browse.allAreas"),
              onClick: () => {
                setSelectedArea("all");
                setSearchQuery("");
                setDebouncedSearch("");
                setMaxPriceFilter(highestPrice);
              },
            }}
          />
        ) : (
          <>
            {/* Featured venue */}
            {featuredVenue && !debouncedSearch && (
              <FeaturedVenueCard venue={featuredVenue} />
            )}

            {/* Venue grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {(debouncedSearch ? filteredVenues : remainingVenues).map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
