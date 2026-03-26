"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  MapPin,
  Share2,
  Package,
  CheckCircle,
  Trash2,
  RotateCcw,
  Loader2,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/main-layout";
import { ListingCard, type ListingData as ListingCardData } from "@/components/cards/listing-card";
import { useTranslation, useLocale } from "@/i18n";
import { useAuth } from "@/lib/auth-context";
import { LISTING_CATEGORY_COLORS } from "@/lib/constants";
import { buildSellerContactLink, buildListingShareLink } from "@/lib/whatsapp";
import { slideUp } from "@/lib/animations";

interface ListingDetail {
  id: string;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  price: number;
  category: string;
  condition: string;
  photos: string[];
  area: string;
  areaAr?: string | null;
  sellerName: string;
  sellerPhone: string;
  sellerId?: string | null;
  status: "ACTIVE" | "SOLD" | "REMOVED";
  views: number;
  createdAt: string;
  sold?: boolean;
}

const CONDITION_KEYS: Record<string, string> = {
  NEW: "market.new",
  LIKE_NEW: "market.likeNew",
  USED: "market.used",
  WELL_USED: "market.wellUsed",
};

const CATEGORY_KEYS: Record<string, string> = {
  RACKETS: "market.rackets",
  SHOES: "market.shoes",
  BAGS: "market.bags",
  BALLS: "market.balls",
  APPAREL: "market.apparel",
  ACCESSORIES: "market.accessories",
  OTHER: "market.other",
};

export default function ListingDetailClient({ id }: { id: string }) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const listingId = id;
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [relatedItems, setRelatedItems] = useState<ListingCardData[]>([]);

  const galleryRef = useRef<HTMLDivElement>(null);
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const NextArrow = locale === "ar" ? ChevronLeft : ChevronRight;
  const PrevArrow = locale === "ar" ? ChevronRight : ChevronLeft;

  const isOwner =
    !!listing &&
    isAuthenticated &&
    !!user &&
    ((listing.sellerId && listing.sellerId === user.id) ||
      (!listing.sellerId && user.phone && listing.sellerPhone === user.phone));

  const isSold = listing?.status === "SOLD" || listing?.sold === true;
  const isRemoved = listing?.status === "REMOVED";

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/market/${listingId}`);
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        setListing(json.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [listingId]);

  // Fetch related items when listing loads
  useEffect(() => {
    if (!listing) return;
    async function fetchRelated() {
      try {
        const res = await fetch(
          `/api/market?category=${listing!.category}&limit=6`
        );
        if (!res.ok) return;
        const json = await res.json();
        const items = (json.data?.data ?? json.data ?? []) as ListingCardData[];
        setRelatedItems(items.filter((item) => item.id !== listing!.id).slice(0, 6));
      } catch {
        // silently ignore
      }
    }
    fetchRelated();
  }, [listing]);

  const handleShare = async () => {
    if (!listing) return;
    const shareLink = buildListingShareLink({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      area: listing.area,
    });

    if (navigator.share) {
      const displayTitle =
        locale === "ar" && listing.titleAr ? listing.titleAr : listing.title;
      try {
        await navigator.share({
          title: displayTitle,
          url: `${window.location.origin}/market/${listing.id}`,
        });
      } catch {
        // User cancelled
      }
    } else {
      window.open(shareLink, "_blank");
    }
  };

  const updateStatus = async (status: "ACTIVE" | "SOLD" | "REMOVED") => {
    if (!listing) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/market/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setListing((prev) =>
          prev ? { ...prev, status, sold: status === "SOLD" } : prev
        );
      }
    } catch {
      // Silently fail
    } finally {
      setActionLoading(false);
    }
  };

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!listing) return;
      const threshold = 50;
      if (
        info.offset.x < -threshold &&
        currentPhoto < listing.photos.length - 1
      ) {
        setCurrentPhoto((prev) => prev + 1);
      } else if (info.offset.x > threshold && currentPhoto > 0) {
        setCurrentPhoto((prev) => prev - 1);
      }
    },
    [listing, currentPhoto]
  );

  const formatTimeAgo = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60)
      return locale === "ar" ? `${diffMins} دقيقة` : `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return locale === "ar" ? `${diffHours} ساعة` : `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 0) return locale === "ar" ? "النهاردة" : "today";
    if (diffDays === 1) return locale === "ar" ? "امبارح" : "yesterday";
    if (diffDays < 7)
      return locale === "ar" ? `${diffDays} ايام` : `${diffDays}d`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4)
      return locale === "ar" ? `${diffWeeks} اسابيع` : `${diffWeeks}w`;
    const diffMonths = Math.floor(diffDays / 30);
    return locale === "ar" ? `${diffMonths} شهور` : `${diffMonths}mo`;
  };

  const accentColor = listing
    ? LISTING_CATEGORY_COLORS[listing.category] ?? "#9ca3af"
    : "#9ca3af";

  const displayTitle = listing
    ? locale === "ar" && listing.titleAr
      ? listing.titleAr
      : listing.title
    : "";

  const displayArea = listing
    ? locale === "ar" && listing.areaAr
      ? listing.areaAr
      : listing.area
    : "";

  const displayDesc = listing
    ? locale === "ar" && listing.descriptionAr
      ? listing.descriptionAr
      : listing.description
    : null;

  return (
    <MainLayout showNav={false}>
      <div className="mx-auto max-w-lg">
        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-0">
            <div className="aspect-[4/3] dark-skeleton animate-pulse" />
            <div className="px-4 -mt-5 relative z-10 space-y-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-16 rounded-full dark-skeleton" />
                  <div className="h-5 w-16 rounded-full dark-skeleton" />
                </div>
                <div className="h-7 w-3/4 rounded-lg dark-skeleton" />
                <div className="h-9 w-1/3 rounded-lg dark-skeleton" />
                <div className="h-4 w-2/3 rounded dark-skeleton" />
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full dark-skeleton" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 rounded dark-skeleton" />
                    <div className="h-3 w-1/4 rounded dark-skeleton" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16 px-4">
            <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40">
              <Package size={28} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {t("common.error")}
            </h3>
            <p className="text-sm text-white/50 mb-6">
              {t("common.noResults")}
            </p>
            <button
              onClick={() => router.push("/market")}
              className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white"
            >
              {t("market.title")}
            </button>
          </div>
        )}

        {/* Listing detail */}
        {listing && !loading && (
          <motion.div {...slideUp}>
            {/* ─── Photo Gallery ─── */}
            <div className="relative aspect-[4/3] sm:max-h-[400px] overflow-hidden bg-white/5">
              {listing.photos.length > 0 ? (
                <>
                  <div
                    ref={galleryRef}
                    className="relative w-full h-full overflow-hidden"
                  >
                    <motion.div
                      className="flex h-full"
                      drag={listing.photos.length > 1 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={handleDragEnd}
                      animate={{ x: `-${currentPhoto * 100}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      style={{
                        width: `${listing.photos.length * 100}%`,
                      }}
                    >
                      {listing.photos.map((photo, i) => (
                        <div
                          key={i}
                          className="relative shrink-0 h-full"
                          style={{
                            width: `${100 / listing.photos.length}%`,
                          }}
                        >
                          <img
                            src={photo}
                            alt={`${listing.title} ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  {/* Bottom gradient */}
                  <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0a0f1a] to-transparent pointer-events-none" />

                  {/* Photo counter pill */}
                  {listing.photos.length > 1 && (
                    <span className="absolute bottom-3 end-4 z-10 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-white/80 font-medium">
                      {currentPhoto + 1}/{listing.photos.length}
                    </span>
                  )}

                  {/* Arrow nav (desktop) */}
                  {listing.photos.length > 1 && (
                    <>
                      {currentPhoto > 0 && (
                        <button
                          onClick={() =>
                            setCurrentPhoto((p) => Math.max(0, p - 1))
                          }
                          className="absolute start-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors hidden sm:flex"
                        >
                          <PrevArrow size={16} />
                        </button>
                      )}
                      {currentPhoto < listing.photos.length - 1 && (
                        <button
                          onClick={() =>
                            setCurrentPhoto((p) =>
                              Math.min(listing.photos.length - 1, p + 1)
                            )
                          }
                          className="absolute end-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors hidden sm:flex"
                        >
                          <NextArrow size={16} />
                        </button>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}08` }}
                >
                  <Package
                    size={64}
                    style={{ color: accentColor }}
                    className="opacity-20"
                  />
                </div>
              )}

              {/* Back button */}
              <button
                onClick={() => router.back()}
                className="absolute top-4 start-4 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
              >
                <BackIcon size={18} />
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="absolute top-4 end-4 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70"
              >
                <Share2 size={16} />
              </button>

              {/* SOLD overlay */}
              {isSold && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <span className="text-3xl font-black text-white/80 uppercase tracking-widest -rotate-12">
                    {t("market.sold")}
                  </span>
                </div>
              )}
            </div>

            {/* ─── Listing Info Card (overlaps photo) ─── */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 -mt-5 relative z-10 mx-4">
              {/* Condition + Category pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/10 text-white/70 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium">
                  {t(
                    (CONDITION_KEYS[listing.condition] ??
                      "market.used") as Parameters<typeof t>[0]
                  )}
                </span>
                <span
                  className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    color: accentColor,
                  }}
                >
                  {t(
                    (CATEGORY_KEYS[listing.category] ??
                      "market.other") as Parameters<typeof t>[0]
                  )}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl font-bold text-white/90 mt-3 leading-tight">
                {displayTitle}
              </h1>

              {/* Price */}
              <p className="text-2xl font-bold mt-2" style={{ color: accentColor }}>
                {listing.price.toLocaleString()}{" "}
                <span className="text-sm text-white/30">{t("common.egp")}</span>
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {displayArea}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={11} />
                  {listing.views}
                </span>
                <span>{formatTimeAgo(listing.createdAt)}</span>
              </div>

              {/* Owner controls inline */}
              {isOwner && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  {listing.status === "ACTIVE" && !isSold && (
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => updateStatus("SOLD")}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 py-2.5 text-xs font-semibold text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        {t("market.markSold")}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => updateStatus("REMOVED")}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/40 transition-all hover:bg-white/10 disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        {t("market.remove")}
                      </motion.button>
                    </div>
                  )}

                  {(isSold || isRemoved) && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateStatus("ACTIVE")}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-1.5 w-full rounded-full bg-emerald-500/10 border border-emerald-500/30 py-2.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RotateCcw size={14} />
                      )}
                      {t("market.relist")}
                    </motion.button>
                  )}

                  <Link
                    href="/market/mine"
                    className="flex items-center justify-center gap-1.5 mt-2 py-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
                  >
                    <ShoppingBag size={12} />
                    {t("market.viewMyListings")}
                  </Link>
                </div>
              )}
            </div>

            {/* ─── Description ─── */}
            {displayDesc && (
              <div className="mx-4 mt-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-2.5">
                  {t("market.description")}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                  {displayDesc}
                </p>
              </div>
            )}

            {/* ─── Seller Card ─── */}
            <div className="mx-4 mt-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                {/* Avatar with gradient */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
                    color: "#0a0f1a",
                  }}
                >
                  {listing.sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/80">
                    {listing.sellerName}
                  </p>
                  <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {displayArea}
                  </p>
                </div>
              </div>

              {/* CTA buttons */}
              {!isOwner && !isSold && (
                <div className="mt-4 space-y-2.5">
                  <a
                    href={buildSellerContactLink({
                      title: listing.title,
                      phone: listing.sellerPhone,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.98]"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.664-1.388A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.352 0-4.556-.764-6.34-2.088l-.144-.108-3.489 1.04 1.072-3.377-.12-.151A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    {t("market.contactOnWhatsApp")}
                  </a>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 w-full rounded-full border border-white/10 py-3 text-sm font-medium text-white/60 transition-all hover:bg-white/5 active:scale-[0.98]"
                  >
                    <Share2 size={14} />
                    {t("market.shareListing")}
                  </button>
                </div>
              )}
            </div>

            {/* ─── Related Items ─── */}
            {relatedItems.length > 0 && (
              <div className="mt-6 pb-4">
                <h3 className="text-sm font-bold text-white/70 px-4 mb-3">
                  {t("market.moreInCategory", {
                    category: t(
                      (CATEGORY_KEYS[listing.category] ??
                        "market.other") as Parameters<typeof t>[0]
                    ),
                  })}
                </h3>
                <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
                  {relatedItems.map((item) => (
                    <div key={item.id} className="shrink-0 w-40">
                      <ListingCard
                        listing={item}
                        variant="compact"
                        onClick={() => router.push(`/market/${item.id}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom spacer */}
            <div className="h-8" />
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
