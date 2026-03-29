"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { VenueCard } from "@/components/venue-card";
import { FeaturedVenueCard } from "@/components/featured-venue-card";
import { EmptyState } from "@/components/empty-state";
import { useVenues } from "@/hooks/use-venues";
import { useTranslation, useLocale } from "@/i18n";

const AREAS = [
  { key: "all", labelEn: "All Areas", labelAr: "كل المناطق" },
  { key: "New Cairo", labelEn: "New Cairo", labelAr: "القاهرة الجديدة" },
  { key: "Sheikh Zayed", labelEn: "Sheikh Zayed", labelAr: "الشيخ زايد" },
  { key: "Maadi", labelEn: "Maadi", labelAr: "المعادي" },
  { key: "Nasr City", labelEn: "Nasr City", labelAr: "مدينة نصر" },
  { key: "6th of October", labelEn: "6th of October", labelAr: "أكتوبر" },
  { key: "Heliopolis", labelEn: "Heliopolis", labelAr: "مصر الجديدة" },
];

export default function BrowsePage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [selectedArea, setSelectedArea] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { venues, loading } = useVenues({
    city: selectedArea === "all" ? undefined : selectedArea,
    search: debouncedSearch || undefined,
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const timeout = setTimeout(() => setDebouncedSearch(value), 400);
    return () => clearTimeout(timeout);
  };

  const featuredVenue = useMemo(() => {
    if (venues.length === 0) return null;
    const sorted = [...venues].sort((a, b) => b.rating - a.rating);
    return sorted[0];
  }, [venues]);

  const remainingVenues = useMemo(() => {
    if (!featuredVenue) return venues;
    return venues.filter((v) => v.id !== featuredVenue.id);
  }, [venues, featuredVenue]);

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
                className={`shrink-0 flex items-center gap-1.5 rounded-sm px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer active:scale-[0.97] transition-transform duration-75 ${
                  isSelected
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
        ) : venues.length === 0 ? (
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
            <div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {(debouncedSearch ? venues : remainingVenues).map((venue) => (
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
