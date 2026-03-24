"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Eye,
  MapPin,
  Package,
  Loader2,
  CheckCircle,
  Trash2,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/main-layout";
import { useTranslation, useLocale } from "@/i18n";
import { useAuth } from "@/lib/auth-context";
import { LISTING_CATEGORY_COLORS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { staggerItem } from "@/lib/animations";

interface MyListing {
  id: string;
  title: string;
  titleAr?: string | null;
  price: number | string;
  category: string;
  condition: string;
  photos: string[];
  area: string;
  areaAr?: string | null;
  status: "ACTIVE" | "SOLD" | "REMOVED";
  views: number;
  createdAt: string;
}

const CATEGORY_KEYS: Record<string, string> = {
  RACKETS: "market.rackets",
  SHOES: "market.shoes",
  BAGS: "market.bags",
  BALLS: "market.balls",
  APPAREL: "market.apparel",
  ACCESSORIES: "market.accessories",
  OTHER: "market.other",
};

function formatTimeAgo(dateStr: string, locale: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return locale === "ar" ? "النهاردة" : "today";
  if (diffDays === 1) return locale === "ar" ? "امبارح" : "yesterday";
  if (diffDays < 7)
    return locale === "ar" ? `${diffDays} ايام` : `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4)
    return locale === "ar" ? `${diffWeeks} اسابيع` : `${diffWeeks}w ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return locale === "ar" ? `${diffMonths} شهور` : `${diffMonths}mo ago`;
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const config: Record<string, { bg: string; text: string; key: string }> = {
    ACTIVE: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400", key: "market.active" },
    SOLD: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400", key: "market.sold" },
    REMOVED: { bg: "bg-white/5 border-white/10", text: "text-white/40", key: "market.removed" },
  };
  const c = config[status] ?? config.REMOVED;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      {t(c.key)}
    </span>
  );
}

export default function MyListingsPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/market/mine");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setListings(json.data ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?returnTo=/market/mine");
      return;
    }
    if (isAuthenticated) {
      fetchListings();
    }
  }, [isAuthenticated, authLoading, router, fetchListings]);

  const updateStatus = async (listingId: string, status: "ACTIVE" | "SOLD" | "REMOVED") => {
    setActionLoading(listingId);
    try {
      const res = await fetch(`/api/market/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) => (l.id === listingId ? { ...l, status } : l))
        );
      }
    } catch {
      // Silently fail
    } finally {
      setActionLoading(null);
    }
  };

  // Loading / auth redirect
  if (authLoading || (!isAuthenticated && !error)) {
    return (
      <MainLayout showNav={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-[#c8ff00]" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showNav={false}>
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: locale === "ar" ? 10 : -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <BackIcon size={18} />
          <span className="text-sm">{t("common.back")}</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-extrabold font-[family-name:var(--font-display)] uppercase tracking-tight text-white">
              {t("market.myListings")}
            </h1>
            {!loading && listings.length > 0 && (
              <p className="text-sm text-white/40 mt-1">
                {t("market.listingsCount", { count: listings.length })}
              </p>
            )}
          </div>
          <Link
            href="/market/sell"
            className="flex items-center gap-1.5 rounded-full bg-[#c8ff00] px-4 py-2.5 text-xs font-bold text-[#111827] transition-all hover:shadow-[0_0_20px_rgba(200,255,0,0.2)] active:scale-95"
          >
            <ArrowUpRight size={14} />
            {t("market.sell")}
          </Link>
        </motion.div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden animate-pulse">
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 rounded-xl dark-skeleton shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-16 rounded dark-skeleton" />
                    <div className="h-4 w-3/4 rounded dark-skeleton" />
                    <div className="h-5 w-1/3 rounded dark-skeleton" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center px-6 py-16 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40">
              <Package size={28} />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-white">{t("common.error")}</h3>
            <p className="mb-6 max-w-xs text-sm text-white/50">{t("errors.unexpectedError")}</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={fetchListings}
              className="rounded-full bg-[#c8ff00] px-6 py-2.5 text-sm font-bold text-[#111827]"
            >
              {t("errors.tryAgain")}
            </motion.button>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && listings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center px-6 py-16 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40">
              <ShoppingBag size={28} />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-white">
              {t("market.noListingsYet")}
            </h3>
            <p className="mb-6 max-w-xs text-sm text-white/50">
              {t("market.tagline")}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/market/sell")}
              className="rounded-full bg-[#c8ff00] px-6 py-2.5 text-sm font-bold text-[#111827] shadow-sm transition-all hover:shadow-[0_0_20px_rgba(200,255,0,0.2)]"
            >
              {t("market.listYourGear")}
            </motion.button>
          </motion.div>
        )}

        {/* Listings */}
        {!loading && !error && listings.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {listings.map((listing, i) => {
                const accentColor = LISTING_CATEGORY_COLORS[listing.category] ?? "#9ca3af";
                const displayTitle = locale === "ar" && listing.titleAr ? listing.titleAr : listing.title;
                const displayArea = locale === "ar" && listing.areaAr ? listing.areaAr : listing.area;
                const hasPhoto = listing.photos.length > 0;
                const isActioning = actionLoading === listing.id;
                const catKey = CATEGORY_KEYS[listing.category] ?? "market.other";

                return (
                  <motion.div
                    key={listing.id}
                    layout
                    {...staggerItem}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 overflow-hidden"
                  >
                    {/* Card content (clickable to detail) */}
                    <Link href={`/market/${listing.id}`} className="flex gap-4 p-4">
                      {/* Thumbnail */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-white/5">
                        {hasPhoto ? (
                          <img
                            src={listing.photos[0]}
                            alt={displayTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: `${accentColor}08` }}
                          >
                            <Package size={24} style={{ color: accentColor }} className="opacity-30" />
                          </div>
                        )}
                        {listing.status === "SOLD" && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <CheckCircle size={20} className="text-amber-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[9px] font-bold uppercase tracking-widest font-[family-name:var(--font-display)]"
                            style={{ color: accentColor }}
                          >
                            {t(catKey as Parameters<typeof t>[0])}
                          </span>
                          <StatusBadge status={listing.status} t={(k) => t(k as Parameters<typeof t>[0])} />
                        </div>
                        <p className="text-sm font-bold text-white line-clamp-1 leading-tight">
                          {displayTitle}
                        </p>
                        <p className="text-lg font-extrabold font-[family-name:var(--font-display)] text-[#c8ff00] mt-0.5">
                          {formatPrice(listing.price)}{" "}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-white/30">
                          <span className="flex items-center gap-1">
                            <Eye size={10} />
                            {listing.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={10} />
                            {displayArea}
                          </span>
                          <span>{formatTimeAgo(listing.createdAt, locale)}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Action buttons */}
                    <div className="flex border-t border-white/5">
                      {listing.status === "ACTIVE" && (
                        <>
                          <button
                            onClick={() => updateStatus(listing.id, "SOLD")}
                            disabled={isActioning}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                          >
                            {isActioning ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            {t("market.markSold")}
                          </button>
                          <div className="w-px bg-white/5" />
                          <button
                            onClick={() => updateStatus(listing.id, "REMOVED")}
                            disabled={isActioning}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-white/40 hover:bg-white/5 transition-colors disabled:opacity-50"
                          >
                            {isActioning ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            {t("market.remove")}
                          </button>
                        </>
                      )}
                      {(listing.status === "SOLD" || listing.status === "REMOVED") && (
                        <button
                          onClick={() => updateStatus(listing.id, "ACTIVE")}
                          disabled={isActioning}
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                        >
                          {isActioning ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <RotateCcw size={14} />
                          )}
                          {t("market.relist")}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
