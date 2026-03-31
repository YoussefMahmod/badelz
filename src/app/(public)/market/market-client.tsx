"use client";

import Image from "next/image";
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

export default function MarketClient() {
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
      <div className="mx-auto max-w-5xl pb-40 bg-[#0d0d0d]">

        {/* ════════════════════════════════════════════════════════
            Section 1: Block Header
            ════════════════════════════════════════════════════════ */}
        <div className="bg-[#111] border-b-[3px] border-b-[#d4ff00] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display-en)] text-2xl uppercase tracking-wide text-white">
                {t("market.title")}
              </h1>
              <p className="text-[10px] text-[#666] mt-1">
                {t("market.listingsCount", { count: total })} &middot; {t("market.newItemsDaily")}
              </p>
            </div>

            {/* Search + Filter icon buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-11 h-11 rounded-sm bg-[#0d0d0d] border border-[#333] flex items-center justify-center text-[#999] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                aria-label={t("common.search")}
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>
              <button
                onClick={openFilter}
                className="relative w-11 h-11 rounded-sm bg-[#0d0d0d] border border-[#333] flex items-center justify-center text-[#999] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                aria-label={t("market.filterTitle")}
              >
                <SlidersHorizontal size={18} />
                {hasActiveFilters && (
                  <span className="absolute top-1.5 end-1.5 w-2.5 h-2.5 rounded-sm bg-[#d4ff00]" />
                )}
              </button>
            </div>
          </div>

          {/* My Listings link */}
          {isAuthenticated && (
            <div className="mt-2">
              <Link
                href="/market/mine"
                className="text-xs font-semibold text-[#d4ff00]/70 hover:text-[#d4ff00] transition-colors"
              >
                {t("market.myListings")}
              </Link>
            </div>
          )}
        </div>

        {/* ─── Expandable Search Bar ─── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="overflow-hidden bg-[#111] border-b-2 border-b-[#222]"
            >
              <div className="relative px-4 py-3">
                <Search
                  size={20}
                  className="absolute start-8 top-1/2 -translate-y-1/2 text-[#d4ff00]/50"
                />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t("common.search")}
                  className="w-full rounded-sm bg-[#0d0d0d] border-2 border-[#333] focus:border-[#d4ff00] ps-12 pe-4 py-3 text-base text-white outline-none placeholder:text-[#666] transition-colors"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════
            Section 2: Category Block Bar
            ════════════════════════════════════════════════════════ */}
        <div className="flex gap-0 bg-[#111] border-b-[3px] border-b-[#d4ff00] overflow-x-auto scrollbar-hide">
          {CATEGORY_ENTRIES.map((cat, idx) => {
            const isActive =
              selectedCategory === ""
                ? cat.key === "all"
                : selectedCategory === cat.key;
            const labelKey = CATEGORY_LABEL_KEYS[cat.key] ?? "common.viewAll";
            const count =
              cat.key === "all" ? totalCount : (categoryCounts[cat.key] ?? 0);
            const isLast = idx === CATEGORY_ENTRIES.length - 1;

            return (
              <button
                key={cat.key}
                onClick={() =>
                  setSelectedCategory(cat.key === "all" ? "" : cat.key)
                }
                className={`flex-1 text-center py-3 px-1 relative cursor-pointer transition-colors min-w-0 ${
                  !isLast ? "border-e border-e-[#0d0d0d]" : ""
                }`}
              >
                <span
                  className={`block font-[family-name:var(--font-display-en)] text-sm ${
                    isActive ? "text-[#d4ff00]" : "text-[#444]"
                  }`}
                >
                  {count}
                </span>
                <span
                  className={`block text-[9px] font-bold uppercase tracking-wide mt-0.5 ${
                    isActive ? "text-[#d4ff00]" : "text-[#666]"
                  }`}
                >
                  {t(labelKey as Parameters<typeof t>[0])}
                </span>
                {/* Active underbar */}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-[3px] bg-[#d4ff00]" />
                )}
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════════
            Section 3: Dual Marquees — Recently Added + Trending
            ════════════════════════════════════════════════════════ */}
        {(recentItems.length > 0 || trending.length > 0) && (
          <div className="relative overflow-hidden bg-[#111] border-b-2 border-b-[#222]">
            {/* Row 1: Recently Added */}
            {recentItems.length > 0 && (
              <div className="py-2 px-4">
                <div className="flex gap-3 animate-marquee hover:[animation-play-state:paused]">
                  {[...recentItems, ...recentItems].map((item, i) => (
                    <Link
                      key={`recent-${item.id}-${i}`}
                      href={`/market/${item.id}`}
                      className="flex items-center gap-2.5 shrink-0 rounded-sm bg-[#0d0d0d] border border-[#222] px-3 py-2 hover:bg-[#1a1a1a] transition-colors"
                    >
                      <span className="text-[8px] font-bold bg-[#d4ff00] text-[#0d0d0d] px-1.5 py-0.5 rounded-sm shrink-0 whitespace-nowrap">
                        {t("market.newBadge")}
                      </span>
                      <div className="relative w-7 h-7 rounded-sm overflow-hidden shrink-0 bg-[#1a1a1a] flex items-center justify-center">
                        {item.photos?.[0] ? (
                          <Image src={item.photos[0]} alt="" fill sizes="28px" className="object-cover" />
                        ) : (
                          <Package size={12} className="text-[#666]" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-[#999] truncate max-w-[120px]">
                        {locale === "ar" && item.titleAr ? item.titleAr : item.title}
                      </span>
                      <span className="text-xs font-bold text-[#d4ff00] shrink-0">
                        {item.price} {t("common.egp")}
                      </span>
                      <span className="text-[10px] text-[#666] shrink-0">
                        {getTimeAgo(item.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Row 2: Trending */}
            {trending.length > 0 && (
              <div className="py-2 px-4">
                <div className="flex gap-3 animate-marquee-reverse hover:[animation-play-state:paused]">
                  {[...trending, ...trending].map((item, i) => (
                    <Link
                      key={`trend-${item.id}-${i}`}
                      href={`/market/${item.id}`}
                      className="flex items-center gap-2.5 shrink-0 rounded-sm bg-[#0d0d0d] border border-[#222] px-3 py-2 hover:bg-[#1a1a1a] transition-colors"
                    >
                      <span className="text-[8px] font-bold bg-[#ff4d4d] text-white px-1.5 py-0.5 rounded-sm shrink-0 flex items-center gap-0.5">
                        <Flame size={8} />
                        {t("market.hot" as Parameters<typeof t>[0])}
                      </span>
                      <div className="relative w-7 h-7 rounded-sm overflow-hidden shrink-0 bg-[#1a1a1a] flex items-center justify-center">
                        {item.photos?.[0] ? (
                          <Image src={item.photos[0]} alt="" fill sizes="28px" className="object-cover" />
                        ) : (
                          <Package size={12} className="text-[#666]" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-[#999] truncate max-w-[120px]">
                        {locale === "ar" && (item as ListingWithSeller).titleAr ? (item as ListingWithSeller).titleAr : item.title}
                      </span>
                      <span className="text-xs font-bold text-[#ff4d4d] shrink-0">
                        {item.price} {t("common.egp")}
                      </span>
                      <span className="text-[10px] text-[#666] shrink-0 flex items-center gap-0.5">
                        <Eye size={8} />
                        {(item as ListingWithSeller).views ?? 0}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            Section 4: Main Listings Grid
            ════════════════════════════════════════════════════════ */}
        <section>
          {/* Grid header bar */}
          <div className="bg-[#111] px-4 py-2.5 flex justify-between items-center border-b-2 border-b-[#222]">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-[family-name:var(--font-display-en)] text-sm uppercase tracking-wide text-white">
                {t("market.allListings")}
              </h2>

              {/* Dismissible area chip */}
              {selectedArea !== "all" && (
                <button
                  onClick={() => setSelectedArea("all")}
                  className="flex items-center gap-1 rounded-sm bg-[#0d0d0d] border border-[#333] px-2.5 py-1 text-[10px] text-[#999] hover:bg-[#1a1a1a] transition-colors"
                >
                  <MapPin size={10} />
                  {locale === "ar"
                    ? AREAS.find((a) => a.key === selectedArea)?.labelAr
                    : AREAS.find((a) => a.key === selectedArea)?.labelEn}
                  <X size={10} className="ms-1 text-[#666]" />
                </button>
              )}

              {/* Dismissible search chip */}
              {debouncedSearch && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                  }}
                  className="flex items-center gap-1 rounded-sm bg-[#0d0d0d] border border-[#333] px-2.5 py-1 text-[10px] text-[#999] hover:bg-[#1a1a1a] transition-colors"
                >
                  <Search size={10} />
                  &ldquo;{debouncedSearch}&rdquo;
                  <X size={10} className="ms-1 text-[#666]" />
                </button>
              )}
            </div>

            {/* Inline sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 text-[10px] text-[#666] uppercase tracking-wide hover:text-[#999] transition-colors"
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
                    className="absolute top-full mt-1 end-0 z-30 min-w-[160px] rounded-sm bg-[#1a1a1a] border border-[#333] py-1 shadow-xl"
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
                            ? "text-[#d4ff00] bg-[#d4ff00]/5"
                            : "text-[#999] hover:text-white hover:bg-[#111]"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-[2px] bg-[#161616]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#0d0d0d] overflow-hidden">
                  <div className="aspect-[4/3] dark-skeleton" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-4 w-3/4 rounded-sm dark-skeleton" />
                    <div className="h-5 w-1/2 rounded-sm dark-skeleton" />
                    <div className="h-3 w-2/3 rounded-sm dark-skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="px-4 py-12">
              <EmptyState
                icon={<Package size={28} />}
                title={t("market.noListings")}
                description={t("market.noListingsDesc")}
                action={{
                  label: t("market.createListing"),
                  onClick: () => router.push("/market/sell"),
                }}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-[2px] bg-[#161616]">
                <AnimatePresence mode="popLayout">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-[#0d0d0d]"
                    >
                      <ListingCard
                        listing={listing}
                        variant="default"
                        onClick={() => router.push(`/market/${listing.id}`)}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Load More button */}
              {hasMore && (
                <div className="flex justify-center mt-6 px-4">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-sm bg-[#111] border border-[#333] px-8 py-3 text-sm font-semibold text-[#999] hover:text-white hover:bg-[#1a1a1a] transition-colors disabled:opacity-40"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#333] border-t-[#d4ff00] rounded-full animate-spin" />
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
          Section 5: Live Activity Ticker (floats above sell CTA)
          ════════════════════════════════════════════════════════ */}
      {recentItems.length > 0 && currentActivityItem && (
        <div className="fixed bottom-48 start-4 end-4 z-20 pointer-events-none">
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
                className="flex items-center gap-3 rounded-sm bg-[#111] border border-[#333] px-4 py-2.5 shadow-lg"
              >
                <div className="w-2 h-2 rounded-sm bg-[#d4ff00] animate-pulse shrink-0" />
                <span className="text-xs text-[#999] truncate">
                  {currentActivityItem.sellerName}{" "}
                  {t("market.justListed")}{" "}
                  <strong className="text-white">
                    {locale === "ar" && currentActivityItem.titleAr
                      ? currentActivityItem.titleAr
                      : currentActivityItem.title}
                  </strong>
                </span>
                <span className="text-[10px] text-[#666] shrink-0">
                  {getTimeAgo(currentActivityItem.createdAt)}
                </span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          Section 6: Sticky Sell CTA — Brutalist underbar button
          ════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-28 start-4 end-4 z-30">
        <Link
          href="/market/sell"
          className="flex items-center justify-center gap-2 w-full bg-[#d4ff00] text-[#0d0d0d] font-[family-name:var(--font-display-en)] text-base uppercase tracking-wide py-3.5 relative transition-all active:scale-[0.98]"
        >
          <ShoppingBag size={18} />
          {t("market.listForSale")}
          <span className="absolute bottom-0 inset-x-0 h-1 bg-[#a0c200]" />
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
              className="fixed top-0 end-0 bottom-0 w-80 max-w-[85vw] z-50 bg-[#0d0d0d] border-s border-[#333] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-[#111] border-b-[3px] border-b-[#d4ff00]">
                <h2 className="text-lg font-bold text-white font-[family-name:var(--font-display-en)] uppercase tracking-wide">
                  {t("market.filterTitle")}
                </h2>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="min-w-[44px] min-h-[44px] rounded-sm bg-[#0d0d0d] flex items-center justify-center text-[#999] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                  aria-label={t("common.close")}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                {/* Area */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#666] font-[family-name:var(--font-display-en)] mb-3">
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
                          className={`w-full flex items-center justify-between rounded-sm px-3 py-3 text-sm transition-colors ${
                            isSelected
                              ? "bg-[#d4ff00]/10 text-[#d4ff00]"
                              : "text-[#999] hover:bg-[#1a1a1a] hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {area.key !== "all" && <MapPin size={14} />}
                            {label}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-sm bg-[#d4ff00]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Apply button */}
              <div className="px-5 py-4 border-t border-[#222]">
                <button
                  onClick={applyFilters}
                  className="w-full rounded-sm bg-[#d4ff00] py-3.5 text-sm font-bold text-[#0d0d0d] font-[family-name:var(--font-display-en)] uppercase tracking-wide relative"
                >
                  {t("market.apply")}
                  <span className="absolute bottom-0 inset-x-0 h-1 bg-[#a0c200] rounded-b-sm" />
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
