"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  X,
  SlidersHorizontal,
  Package,
  ShoppingBag,
  Flame,
  Zap,
  Footprints,
  Briefcase,
  Circle,
  Shirt,
  Watch,
  Layers,
  ChevronDown,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/main-layout";
import { ListingCard } from "@/components/cards/listing-card";
import type { ListingData } from "@/components/cards/listing-card";
import { EmptyState } from "@/components/empty-state";
import { useTranslation, useLocale } from "@/i18n";
import { useAuth } from "@/lib/auth-context";
import { AREAS, LISTING_CATEGORY_COLORS } from "@/lib/constants";
import { heroTextReveal, staggerItem } from "@/lib/animations";

// ─── Types ───

type SortOption = "newest" | "price_asc" | "price_desc";

// Extend ListingData with seller info for the activity ticker
interface ListingWithSeller extends ListingData {
  sellerName?: string;
}

// ─── Constants ───

const CATEGORY_ENTRIES = [
  { key: "all", icon: Layers, color: "#9ca3af" },
  { key: "RACKETS", icon: Zap, color: LISTING_CATEGORY_COLORS.RACKETS },
  { key: "SHOES", icon: Footprints, color: LISTING_CATEGORY_COLORS.SHOES },
  { key: "BAGS", icon: Briefcase, color: LISTING_CATEGORY_COLORS.BAGS },
  { key: "BALLS", icon: Circle, color: LISTING_CATEGORY_COLORS.BALLS },
  { key: "APPAREL", icon: Shirt, color: LISTING_CATEGORY_COLORS.APPAREL },
  { key: "ACCESSORIES", icon: Watch, color: LISTING_CATEGORY_COLORS.ACCESSORIES },
] as const;

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  all: "common.viewAll",
  RACKETS: "market.rackets",
  SHOES: "market.shoes",
  BAGS: "market.bags",
  BALLS: "market.balls",
  APPAREL: "market.apparel",
  ACCESSORIES: "market.accessories",
};

const SORT_OPTIONS: { key: SortOption; labelKey: string }[] = [
  { key: "newest", labelKey: "market.newest" },
  { key: "price_asc", labelKey: "market.priceLowHigh" },
  { key: "price_desc", labelKey: "market.priceHighLow" },
];

const ITEMS_PER_PAGE = 20;

// ─── Helpers ───

function getTimeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

// ─── Page Component ───

export default function MarketPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Filter & search state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Pending filter state (applied on confirm in drawer)
  const [pendingArea, setPendingArea] = useState("all");

  // Data state
  const [listings, setListings] = useState<ListingData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Auxiliary data
  const [recentItems, setRecentItems] = useState<ListingWithSeller[]>([]);
  const [trending, setTrending] = useState<ListingData[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Activity ticker
  const [activityIndex, setActivityIndex] = useState(0);

  // Debounce ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Debounced search ───
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 400);
  }, []);

  // ─── Parallel initial fetches (recent, trending, counts) ───
  useEffect(() => {
    const controller = new AbortController();

    Promise.allSettled([
      fetch("/api/market?recent=true&limit=10", { signal: controller.signal })
        .then((r) => r.json())
        .then((d) => setRecentItems(d.data ?? [])),

      fetch("/api/market?trending=true", { signal: controller.signal })
        .then((r) => r.json())
        .then((d) => setTrending(d.data ?? [])),

      fetch("/api/market?counts=true", { signal: controller.signal })
        .then((r) => r.json())
        .then((d) => setCategoryCounts(d.data ?? {})),
    ]);

    return () => controller.abort();
  }, []);

  // ─── Main listings fetch (re-runs on filter changes) ───
  useEffect(() => {
    const controller = new AbortController();

    async function fetchListings() {
      setLoading(true);
      setPage(1);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.set("category", selectedCategory);
        if (selectedArea !== "all") params.set("area", selectedArea);
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("sort", sortBy);
        params.set("page", "1");
        params.set("limit", String(ITEMS_PER_PAGE));

        const res = await fetch(`/api/market?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        const data: ListingData[] = json.data ?? [];
        setListings(data);
        setTotal(json.total ?? data.length);
        setHasMore(data.length >= ITEMS_PER_PAGE);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setListings([]);
          setTotal(0);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
    return () => controller.abort();
  }, [selectedCategory, selectedArea, debouncedSearch, sortBy]);

  // ─── Load more ───
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedArea !== "all") params.set("area", selectedArea);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("sort", sortBy);
      params.set("page", String(nextPage));
      params.set("limit", String(ITEMS_PER_PAGE));

      const res = await fetch(`/api/market?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const data: ListingData[] = json.data ?? [];
      setListings((prev) => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length >= ITEMS_PER_PAGE);
    } catch {
      // Silent fail on load more -- user can retry
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, selectedCategory, selectedArea, debouncedSearch, sortBy]);

  // ─── Activity ticker rotation ───
  useEffect(() => {
    if (recentItems.length === 0) return;
    const interval = setInterval(() => {
      setActivityIndex((i) => (i + 1) % recentItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [recentItems.length]);

  // ─── Filter drawer handlers ───
  const openFilter = () => {
    setPendingArea(selectedArea);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setSelectedArea(pendingArea);
    setFilterOpen(false);
  };

  // ─── Computed values ───
  const hasActiveFilters = selectedArea !== "all" || debouncedSearch.length > 0;
  const totalCount = Object.values(categoryCounts).reduce((sum, c) => sum + c, 0);
  const currentActivityItem = recentItems[activityIndex];

  return (
    <MainLayout showNav navType="public">
      <div className="mx-auto max-w-5xl px-4 py-6 pb-40">

        {/* ════════════════════════════════════════════════════════
            Section 1: Hero Header
            ════════════════════════════════════════════════════════ */}
        <div className="flex items-start justify-between mb-1">
          <motion.div {...heroTextReveal}>
            <h1 className="text-5xl sm:text-7xl font-extrabold uppercase tracking-tight font-[family-name:var(--font-display)] text-white glow-lime-text leading-none">
              {t("market.title")}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/40 text-sm mt-2"
            >
              <span className="text-white/60 font-semibold">{t("market.listingsCount", { count: total })}</span> &middot;{" "}
              {t("market.newItemsDaily")}
            </motion.p>
          </motion.div>

          {/* Search + Filter icon buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mt-2"
          >
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              aria-label={t("common.search")}
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
            <button
              onClick={openFilter}
              className="relative w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              aria-label={t("market.filterTitle")}
            >
              <SlidersHorizontal size={18} />
              {hasActiveFilters && (
                <span className="absolute top-1.5 end-1.5 w-2.5 h-2.5 rounded-full bg-[#c8ff00] shadow-[0_0_6px_rgba(200,255,0,0.5)]" />
              )}
            </button>
          </motion.div>
        </div>

        {/* My Listings link */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Link
              href="/market/mine"
              className="text-xs font-semibold text-[#c8ff00]/70 hover:text-[#c8ff00] transition-colors"
            >
              {t("market.myListings")}
            </Link>
          </motion.div>
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
                <Search
                  size={20}
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-[#c8ff00]/50"
                />
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

        {/* ════════════════════════════════════════════════════════
            Section 2: Dual Marquees — Recently Added + Trending
            ════════════════════════════════════════════════════════ */}
        {(recentItems.length > 0 || trending.length > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden mb-5"
          >
            {/* Shared fade edges */}
            <div className="absolute inset-y-0 start-0 w-16 bg-gradient-to-e from-[#0a0f1a] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 end-0 w-16 bg-gradient-to-s from-[#0a0f1a] to-transparent z-10 pointer-events-none" />

            {/* Row 1: Recently Added → scrolls left-to-right */}
            {recentItems.length > 0 && (
              <div className="py-2">
                <div className="flex gap-3 animate-marquee hover:[animation-play-state:paused]">
                  {[...recentItems, ...recentItems].map((item, i) => (
                    <Link
                      key={`recent-${item.id}-${i}`}
                      href={`/market/${item.id}`}
                      className="flex items-center gap-2.5 shrink-0 rounded-lg bg-white/5 border border-white/10 px-3 py-2 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-[8px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                        {t("market.newBadge")}
                      </span>
                      <div className="w-7 h-7 rounded-md overflow-hidden shrink-0 bg-white/5 flex items-center justify-center">
                        {item.photos?.[0] ? (
                          <img src={item.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package size={12} className="text-white/20" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-white/70 truncate max-w-[120px]">
                        {locale === "ar" && item.titleAr ? item.titleAr : item.title}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 shrink-0">
                        {item.price} {t("common.egp")}
                      </span>
                      <span className="text-[10px] text-white/25 shrink-0">
                        {getTimeAgo(item.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Row 2: Trending → scrolls opposite direction */}
            {trending.length > 0 && (
              <div className="py-2">
                <div className="flex gap-3 animate-marquee-reverse hover:[animation-play-state:paused]">
                  {[...trending, ...trending].map((item, i) => (
                    <Link
                      key={`trend-${item.id}-${i}`}
                      href={`/market/${item.id}`}
                      className="flex items-center gap-2.5 shrink-0 rounded-lg bg-white/5 border border-white/10 px-3 py-2 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-[8px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                        <Flame size={8} />
                        {t("market.hot" as Parameters<typeof t>[0])}
                      </span>
                      <div className="w-7 h-7 rounded-md overflow-hidden shrink-0 bg-white/5 flex items-center justify-center">
                        {item.photos?.[0] ? (
                          <img src={item.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package size={12} className="text-white/20" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-white/70 truncate max-w-[120px]">
                        {locale === "ar" && (item as ListingWithSeller).titleAr ? (item as ListingWithSeller).titleAr : item.title}
                      </span>
                      <span className="text-xs font-bold text-orange-400 shrink-0">
                        {item.price} {t("common.egp")}
                      </span>
                      <span className="text-[10px] text-white/25 shrink-0 flex items-center gap-0.5">
                        <Eye size={8} />
                        {(item as ListingWithSeller).views ?? 0}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════
            Section 3: Category Cards
            ════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 mb-6 scrollbar-hide"
        >
          {CATEGORY_ENTRIES.map((cat) => {
            const isActive =
              selectedCategory === ""
                ? cat.key === "all"
                : selectedCategory === cat.key;
            const Icon = cat.icon;
            const labelKey = CATEGORY_LABEL_KEYS[cat.key] ?? "common.viewAll";
            const count =
              cat.key === "all" ? totalCount : (categoryCounts[cat.key] ?? 0);

            return (
              <button
                key={cat.key}
                onClick={() =>
                  setSelectedCategory(cat.key === "all" ? "" : cat.key)
                }
                className={`shrink-0 snap-start flex flex-col items-center gap-1.5 rounded-xl px-4 py-3 w-[5.5rem] transition-all border ${
                  isActive
                    ? "bg-white/10 border-white/20"
                    : "border-white/10 bg-white/5 hover:bg-white/8"
                }`}
                style={
                  isActive
                    ? {
                        borderColor: cat.color,
                        backgroundColor: `${cat.color}10`,
                      }
                    : undefined
                }
              >
                <Icon
                  size={20}
                  style={{
                    color: isActive ? cat.color : "rgba(255,255,255,0.3)",
                  }}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                    isActive ? "text-white/90" : "text-white/40"
                  }`}
                >
                  {t(labelKey as Parameters<typeof t>[0])}
                </span>
                <span className="text-[10px] text-white/25">{count}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Trending section moved to dual marquee above */}

        {/* ════════════════════════════════════════════════════════
            Section 5: Main Listings Grid
            ════════════════════════════════════════════════════════ */}
        <section>
          {/* Section header: title, active filter chips, sort dropdown */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white font-[family-name:var(--font-display)] uppercase tracking-wide">
                {t("market.allListings")}
              </h2>

              {/* Dismissible area chip */}
              {selectedArea !== "all" && (
                <button
                  onClick={() => setSelectedArea("all")}
                  className="flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] text-white/50 hover:bg-white/10 transition-colors"
                >
                  <MapPin size={10} />
                  {locale === "ar"
                    ? AREAS.find((a) => a.key === selectedArea)?.labelAr
                    : AREAS.find((a) => a.key === selectedArea)?.labelEn}
                  <X size={10} className="ms-1 text-white/30" />
                </button>
              )}

              {/* Dismissible search chip */}
              {debouncedSearch && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                  }}
                  className="flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] text-white/50 hover:bg-white/10 transition-colors"
                >
                  <Search size={10} />
                  &ldquo;{debouncedSearch}&rdquo;
                  <X size={10} className="ms-1 text-white/30" />
                </button>
              )}
            </div>

            {/* Inline sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[11px] text-white/50 hover:text-white/70 hover:bg-white/10 transition-all"
              >
                {t(
                  SORT_OPTIONS.find((o) => o.key === sortBy)
                    ?.labelKey as Parameters<typeof t>[0]
                )}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-1 end-0 z-30 min-w-[160px] rounded-xl bg-[#111827] border border-white/10 py-1 shadow-xl"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setSortBy(opt.key);
                          setSortOpen(false);
                        }}
                        className={`w-full text-start px-4 py-2.5 text-xs transition-colors ${
                          sortBy === opt.key
                            ? "text-[#c8ff00] bg-[#c8ff00]/5"
                            : "text-white/50 hover:text-white/70 hover:bg-white/5"
                        }`}
                      >
                        {t(opt.labelKey as Parameters<typeof t>[0])}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Grid content */}
          {loading ? (
            /* Skeleton grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3] dark-skeleton" />
                  <div className="bg-[#0d1220] p-3.5 space-y-2">
                    <div className="h-4 w-3/4 rounded dark-skeleton" />
                    <div className="h-5 w-1/2 rounded dark-skeleton" />
                    <div className="h-3 w-2/3 rounded dark-skeleton" />
                  </div>
                </div>
              ))}
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
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <AnimatePresence mode="popLayout">
                  {listings.map((listing, i) => (
                    <motion.div
                      key={listing.id}
                      {...staggerItem}
                      transition={{ delay: i * 0.04 }}
                    >
                      <ListingCard
                        listing={listing}
                        variant="default"
                        onClick={() => router.push(`/market/${listing.id}`)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Load More button */}
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-full bg-white/5 border border-white/10 px-8 py-3 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                        {t("common.loading")}
                      </span>
                    ) : (
                      t("market.loadMore")
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ════════════════════════════════════════════════════════
          Section 7: Live Activity Ticker (floats above sell CTA)
          ════════════════════════════════════════════════════════ */}
      {recentItems.length > 0 && currentActivityItem && (
        <div className="fixed bottom-44 start-4 end-4 z-20 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activityIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-auto"
            >
              <Link
                href={`/market/${currentActivityItem.id}`}
                className="flex items-center gap-3 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 px-4 py-2.5 shadow-lg"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs text-white/60 truncate">
                  {currentActivityItem.sellerName}{" "}
                  {t("market.justListed")}{" "}
                  <strong className="text-white/90">
                    {locale === "ar" && currentActivityItem.titleAr
                      ? currentActivityItem.titleAr
                      : currentActivityItem.title}
                  </strong>
                </span>
                <span className="text-[10px] text-white/25 shrink-0">
                  {getTimeAgo(currentActivityItem.createdAt)}
                </span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          Section 6: Sticky Sell CTA
          ════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-24 start-4 end-4 z-30">
        <Link
          href="/market/sell"
          className="flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-[0.98]"
        >
          <ShoppingBag size={18} />
          {t("market.listForSale")}
        </Link>
      </div>

      {/* ════════════════════════════════════════════════════════
          Filter Drawer (area only — sort moved inline)
          ════════════════════════════════════════════════════════ */}
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
                  className="min-w-[44px] min-h-[44px] rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label={t("common.close")}
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
                      const label =
                        locale === "ar" ? area.labelAr : area.labelEn;
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

      {/* Invisible overlay to close sort dropdown on outside click */}
      {sortOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setSortOpen(false)}
        />
      )}
    </MainLayout>
  );
}
