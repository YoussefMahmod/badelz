"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ShoppingBag, ChevronDown, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { ListingCard } from "@/components/cards/listing-card";
import { EmptyState } from "@/components/empty-state";
import { useTranslation, useLocale } from "@/i18n";
import { AREAS, LISTING_CATEGORY_COLORS } from "@/lib/constants";
import { revealUp, staggerItem } from "@/lib/animations";

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

type SortOption = "newest" | "price_asc" | "price_desc";

const CATEGORIES = [
  { key: "all", labelKey: "common.viewAll" as const, color: "#9ca3af" },
  { key: "RACKETS", labelKey: "market.rackets" as const, color: LISTING_CATEGORY_COLORS.RACKETS },
  { key: "SHOES", labelKey: "market.shoes" as const, color: LISTING_CATEGORY_COLORS.SHOES },
  { key: "BAGS", labelKey: "market.bags" as const, color: LISTING_CATEGORY_COLORS.BAGS },
  { key: "BALLS", labelKey: "market.balls" as const, color: LISTING_CATEGORY_COLORS.BALLS },
  { key: "APPAREL", labelKey: "market.apparel" as const, color: LISTING_CATEGORY_COLORS.APPAREL },
  { key: "ACCESSORIES", labelKey: "market.accessories" as const, color: LISTING_CATEGORY_COLORS.ACCESSORIES },
] as const;

const SORT_OPTIONS: { key: SortOption; labelKey: string }[] = [
  { key: "newest", labelKey: "market.newest" },
  { key: "price_asc", labelKey: "market.priceLowHigh" },
  { key: "price_desc", labelKey: "market.priceHighLow" },
];

export default function MarketPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    const timeout = setTimeout(() => setDebouncedSearch(value), 400);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchListings() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (selectedArea !== "all") params.set("area", selectedArea);
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("sort", sortBy);

        const res = await fetch(`/api/market?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setListings(json.data ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setListings([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
    return () => controller.abort();
  }, [selectedCategory, selectedArea, debouncedSearch, sortBy]);

  const skeletons = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-white/5 border border-white/10">
          <div className="h-36 dark-skeleton" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 rounded-lg dark-skeleton" />
            <div className="h-5 w-1/3 rounded-lg dark-skeleton" />
            <div className="h-3 w-1/2 rounded-lg dark-skeleton" />
          </div>
        </div>
      )),
    []
  );

  return (
    <MainLayout showNav navType="public">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Page title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold text-white mb-6"
        >
          {t("market.title")}
        </motion.h1>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-5"
        >
          <Search size={20} className="absolute start-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("common.search")}
            className="w-full rounded-full bg-white/5 border border-white/10 ps-12 pe-4 py-4 text-base text-white outline-none placeholder:text-white/30 focus:border-[#c8ff00]/50 focus:ring-2 focus:ring-[#c8ff00]/30 transition-all"
          />
        </motion.div>

        {/* Category chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="relative flex gap-2 overflow-x-auto hide-scrollbar pb-4"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`shrink-0 relative flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all ${
                  isSelected
                    ? "shadow-sm"
                    : "border border-white/10 hover:bg-white/10"
                }`}
                style={
                  isSelected
                    ? { backgroundColor: cat.color, color: "#111827" }
                    : { color: cat.color }
                }
              >
                {t(cat.labelKey)}
              </button>
            );
          })}
        </motion.div>

        {/* Area chips + Sort */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-5"
        >
          {/* Area chips */}
          <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar">
            {AREAS.map((area) => {
              const isSelected = selectedArea === area.key;
              const label = locale === "ar" ? area.labelAr : area.labelEn;
              return (
                <button
                  key={area.key}
                  onClick={() => setSelectedArea(area.key)}
                  className={`shrink-0 relative flex items-center gap-1 rounded-full px-3 py-2 text-[11px] font-semibold transition-all ${
                    isSelected
                      ? "text-[#111827] shadow-sm"
                      : "border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="market-area-chip"
                      className="absolute inset-0 rounded-full bg-[#c8ff00]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1">
                    {area.key !== "all" && <MapPin size={10} />}
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none rounded-full bg-white/5 border border-white/10 ps-3 pe-8 py-2 text-[11px] font-semibold text-white/60 outline-none focus:border-[#c8ff00]/50 transition-all cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option
                  key={opt.key}
                  value={opt.key}
                  className="bg-[#0a0f1a] text-white"
                >
                  {t(opt.labelKey as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skeletons}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={<Package size={28} />}
            title={t("market.noListings")}
            description={t("market.noListingsDesc")}
            action={{
              label: t("market.createListing"),
              onClick: () => router.push("/market/sell"),
            }}
          />
        ) : (
          <motion.div
            {...revealUp}
            className="grid grid-cols-2 gap-4 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {listings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  {...staggerItem}
                  transition={{ delay: i * 0.04 }}
                >
                  <ListingCard
                    listing={listing}
                    onClick={() => router.push(`/market/${listing.id}`)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Floating Sell CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-24 end-4 z-30"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => router.push("/market/sell")}
          className="flex items-center gap-2 rounded-full bg-[#c8ff00] px-5 py-3.5 text-sm font-bold text-[#111827] shadow-lg shadow-[#c8ff00]/20 transition-shadow hover:shadow-[0_0_30px_rgba(200,255,0,0.3)]"
        >
          <ShoppingBag size={18} />
          {t("market.sell")}
        </motion.button>
      </motion.div>
    </MainLayout>
  );
}
