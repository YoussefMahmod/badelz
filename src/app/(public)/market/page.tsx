"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  X,
  SlidersHorizontal,
  Package,
  ArrowUpRight,
  Zap,
  Footprints,
  Briefcase,
  Circle,
  Shirt,
  Watch,
  LayoutGrid,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { ListingCard } from "@/components/cards/listing-card";
import { EmptyState } from "@/components/empty-state";
import { useTranslation, useLocale } from "@/i18n";
import { AREAS, LISTING_CATEGORY_COLORS } from "@/lib/constants";
import { heroTextReveal, staggerItem } from "@/lib/animations";

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

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  all: LayoutGrid,
  RACKETS: Zap,
  SHOES: Footprints,
  BAGS: Briefcase,
  BALLS: Circle,
  APPAREL: Shirt,
  ACCESSORIES: Watch,
};

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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Pending filter state (applied on "Apply")
  const [pendingArea, setPendingArea] = useState("all");
  const [pendingSort, setPendingSort] = useState<SortOption>("newest");

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
        setTotal(json.total ?? json.data?.length ?? 0);
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

  const openFilter = () => {
    setPendingArea(selectedArea);
    setPendingSort(sortBy);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setSelectedArea(pendingArea);
    setSortBy(pendingSort);
    setFilterOpen(false);
  };

  const spotlightListing = useMemo(() => {
    if (listings.length <= 2) return null;
    return listings[0];
  }, [listings]);

  const gridListings = useMemo(() => {
    if (!spotlightListing) return listings;
    return listings.slice(1);
  }, [listings, spotlightListing]);

  // Count unique categories in results
  const activeCategoriesCount = useMemo(() => {
    const cats = new Set(listings.map((l) => l.category));
    return cats.size;
  }, [listings]);

  const hasActiveFilters = selectedArea !== "all" || sortBy !== "newest";

  return (
    <MainLayout showNav navType="public">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* ─── Bold Header ─── */}
        <div className="flex items-start justify-between mb-2">
          <motion.div {...heroTextReveal}>
            <h1 className="text-5xl sm:text-7xl font-extrabold uppercase tracking-tight font-[family-name:var(--font-display)] text-white glow-lime-text leading-none">
              {t("market.title")}
            </h1>
            <p className="text-white/40 text-sm mt-2">
              {t("market.tagline")}
            </p>
          </motion.div>

          {/* Search + Filter icons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mt-2"
          >
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
            <button
              onClick={openFilter}
              className="relative w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <SlidersHorizontal size={18} />
              {hasActiveFilters && (
                <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-[#c8ff00]" />
              )}
            </button>
          </motion.div>
        </div>

        {/* Stats bar */}
        {!loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/25 text-xs font-[family-name:var(--font-display)] tracking-wider uppercase mb-5"
          >
            {t("market.listingsCount", { count: total })} &middot;{" "}
            {t("market.categoriesCount", { count: activeCategoriesCount })}
          </motion.p>
        )}

        {/* ─── Expandable Search Bar ─── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="overflow-hidden mb-4"
            >
              <div className="relative">
                <Search size={20} className="absolute start-4 top-1/2 -translate-y-1/2 text-[#c8ff00]/50" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t("common.search")}
                  className="w-full rounded-xl bg-white/5 border border-[#c8ff00]/20 ps-12 pe-4 py-3.5 text-base text-white outline-none placeholder:text-white/25 focus:border-[#c8ff00]/50 focus:ring-2 focus:ring-[#c8ff00]/20 transition-all"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Category Tab Navigation ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex overflow-x-auto hide-scrollbar border-b border-white/5 mb-6"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            const Icon = CATEGORY_ICONS[cat.key] ?? Package;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className="relative shrink-0 flex items-center gap-2 px-4 py-3.5 transition-colors"
              >
                <Icon
                  size={16}
                  style={{ color: isSelected ? cat.color : undefined }}
                  className={isSelected ? "" : "text-white/30"}
                />
                <span
                  className={`text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-display)] whitespace-nowrap ${
                    isSelected ? "text-white" : "text-white/30"
                  }`}
                >
                  {t(cat.labelKey)}
                </span>
                {isSelected && (
                  <motion.div
                    layoutId="market-tab-underline"
                    className="absolute bottom-0 inset-x-0 h-[3px] rounded-full"
                    style={{ backgroundColor: cat.color }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ─── Content ─── */}
        {loading ? (
          <div className="space-y-4">
            {/* Spotlight skeleton */}
            <div className="h-48 rounded-2xl animate-pulse dark-skeleton" />
            {/* Grid skeletons */}
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden animate-pulse">
                  <div className="h-1 dark-skeleton" />
                  <div className="h-44 dark-skeleton" />
                  <div className="bg-[#0d1220] p-3 space-y-2">
                    <div className="h-3 w-1/3 rounded dark-skeleton" />
                    <div className="h-4 w-3/4 rounded dark-skeleton" />
                    <div className="h-6 w-1/2 rounded dark-skeleton" />
                  </div>
                </div>
              ))}
            </div>
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
          <div className="space-y-4">
            {/* Spotlight card */}
            {spotlightListing && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ListingCard
                  listing={spotlightListing}
                  variant="spotlight"
                  onClick={() => router.push(`/market/${spotlightListing.id}`)}
                />
              </motion.div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {gridListings.map((listing, i) => (
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
            </div>
          </div>
        )}

        {/* ─── Bottom Sell CTA ─── */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/market/sell")}
          className="w-full mt-8 mb-4 rounded-xl bg-gradient-to-r from-[#c8ff00] to-[#a3d900] py-4 px-6 flex items-center justify-between group cursor-pointer"
        >
          <div className="text-start">
            <p className="text-base font-extrabold text-[#111827] font-[family-name:var(--font-display)] uppercase tracking-wide">
              {t("market.listYourGear")}
            </p>
            <p className="text-xs text-[#111827]/50 mt-0.5">
              {t("market.tagline")}
            </p>
          </div>
          <ArrowUpRight
            size={22}
            className="text-[#111827] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </motion.button>
      </div>

      {/* ─── Filter Drawer ─── */}
      <AnimatePresence>
        {filterOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setFilterOpen(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: locale === "ar" ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: locale === "ar" ? "-100%" : "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 end-0 bottom-0 w-80 max-w-[85vw] z-50 bg-[#0a0f1a] border-s border-white/10 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white font-[family-name:var(--font-display)] uppercase tracking-wide">
                  {t("market.filterTitle")}
                </h2>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                {/* Area */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 font-[family-name:var(--font-display)] mb-3">
                    {t("market.location")}
                  </h3>
                  <div className="space-y-1">
                    {AREAS.map((area) => {
                      const isSelected = pendingArea === area.key;
                      const label = locale === "ar" ? area.labelAr : area.labelEn;
                      return (
                        <button
                          key={area.key}
                          onClick={() => setPendingArea(area.key)}
                          className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-sm transition-all ${
                            isSelected
                              ? "bg-[#c8ff00]/10 text-[#c8ff00]"
                              : "text-white/50 hover:bg-white/5 hover:text-white/70"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {area.key !== "all" && <MapPin size={14} />}
                            {label}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#c8ff00]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 font-[family-name:var(--font-display)] mb-3">
                    {t("market.newest")}
                  </h3>
                  <div className="space-y-1">
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = pendingSort === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => setPendingSort(opt.key)}
                          className={`w-full flex items-center justify-between rounded-lg px-3 py-3 text-sm transition-all ${
                            isSelected
                              ? "bg-[#c8ff00]/10 text-[#c8ff00]"
                              : "text-white/50 hover:bg-white/5 hover:text-white/70"
                          }`}
                        >
                          {t(opt.labelKey as Parameters<typeof t>[0])}
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#c8ff00]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Apply button */}
              <div className="px-5 py-4 border-t border-white/5">
                <button
                  onClick={applyFilters}
                  className="w-full rounded-xl bg-[#c8ff00] py-3.5 text-sm font-bold text-[#111827] font-[family-name:var(--font-display)] uppercase tracking-wide"
                >
                  {t("market.apply")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
