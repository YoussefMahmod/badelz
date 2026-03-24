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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { useTranslation, useLocale } from "@/i18n";
import { LISTING_CATEGORY_COLORS } from "@/lib/constants";
import { buildSellerContactLink, buildListingShareLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
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

export default function ListingDetailPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const listingId = params.id as string;
  const managePhone = searchParams.get("manage");

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [markingSold, setMarkingSold] = useState(false);
  const [descOpen, setDescOpen] = useState(false);

  const galleryRef = useRef<HTMLDivElement>(null);
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/market/${listingId}`);
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        setListing(json.data);
        // Auto-expand short descriptions
        if (json.data?.description && json.data.description.length <= 100) {
          setDescOpen(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [listingId]);

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

  const handleMarkSold = async () => {
    if (!listing || !managePhone) return;
    setMarkingSold(true);
    try {
      const res = await fetch(`/api/market/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sold: true, phone: managePhone }),
      });
      if (res.ok) {
        setListing((prev) => (prev ? { ...prev, sold: true } : prev));
      }
    } catch {
      // Silently fail
    } finally {
      setMarkingSold(false);
    }
  };

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!listing) return;
      const threshold = 50;
      if (info.offset.x < -threshold && currentPhoto < listing.photos.length - 1) {
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
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return locale === "ar" ? "النهاردة" : "today";
    if (diffDays === 1) return locale === "ar" ? "امبارح" : "yesterday";
    if (diffDays < 7)
      return locale === "ar" ? `${diffDays} ايام` : `${diffDays} days`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4)
      return locale === "ar" ? `${diffWeeks} اسابيع` : `${diffWeeks} weeks`;
    const diffMonths = Math.floor(diffDays / 30);
    return locale === "ar" ? `${diffMonths} شهور` : `${diffMonths} months`;
  };

  const accentColor = listing
    ? LISTING_CATEGORY_COLORS[listing.category] ?? "#9ca3af"
    : "#9ca3af";

  return (
    <MainLayout showNav={false}>
      <div className="mx-auto max-w-lg">
        {/* Loading */}
        {loading && (
          <div className="space-y-0">
            <div className="h-80 dark-skeleton animate-pulse" />
            <div className="px-4 py-5 space-y-4">
              <div className="h-8 w-2/3 rounded-lg dark-skeleton" />
              <div className="h-12 w-1/3 rounded-lg dark-skeleton" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl dark-skeleton" />
                ))}
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
            <h3 className="text-lg font-semibold text-white mb-1">{t("common.error")}</h3>
            <p className="text-sm text-white/50 mb-6">{t("common.noResults")}</p>
            <button
              onClick={() => router.push("/market")}
              className="rounded-full bg-[#c8ff00] px-6 py-2.5 text-sm font-bold text-[#111827]"
            >
              {t("market.title")}
            </button>
          </div>
        )}

        {/* Listing detail */}
        {listing && !loading && (
          <motion.div {...slideUp}>
            {/* ─── Hero Photo with Overlays ─── */}
            <div className="relative h-80 sm:h-96 overflow-hidden bg-white/5">
              {listing.photos.length > 0 ? (
                <>
                  {/* Swipeable gallery */}
                  <div ref={galleryRef} className="relative w-full h-full overflow-hidden">
                    <motion.div
                      className="flex h-full"
                      drag={listing.photos.length > 1 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={handleDragEnd}
                      animate={{ x: `-${currentPhoto * 100}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ width: `${listing.photos.length * 100}%` }}
                    >
                      {listing.photos.map((photo, i) => (
                        <div
                          key={i}
                          className="relative shrink-0 h-full"
                          style={{ width: `${100 / listing.photos.length}%` }}
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

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/20 to-transparent pointer-events-none" />

                  {/* Photo counter */}
                  {listing.photos.length > 1 && (
                    <span className="absolute bottom-16 end-4 z-10 rounded-full bg-black/50 px-3 py-1 text-xs text-white/80 font-[family-name:var(--font-display)]">
                      {currentPhoto + 1}/{listing.photos.length}
                    </span>
                  )}
                </>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}08` }}
                >
                  <Package size={64} style={{ color: accentColor }} className="opacity-20" />
                </div>
              )}

              {/* Back button overlay */}
              <button
                onClick={() => router.back()}
                className="absolute top-4 start-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white"
              >
                <BackIcon size={18} />
              </button>

              {/* Share button overlay */}
              <button
                onClick={handleShare}
                className="absolute top-4 end-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70"
              >
                <Share2 size={16} />
              </button>

              {/* Product name over gradient */}
              <div className="absolute bottom-4 start-4 end-4 z-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {locale === "ar" && listing.titleAr
                    ? listing.titleAr
                    : listing.title}
                </h1>
              </div>

              {/* Sold overlay */}
              {listing.sold && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                  <div className="rounded-full bg-red-500/20 border border-red-500/50 px-8 py-3 text-red-400 font-bold text-xl font-[family-name:var(--font-display)] uppercase">
                    {t("market.markSold")}
                  </div>
                </div>
              )}
            </div>

            {/* Dot indicators */}
            {listing.photos.length > 1 && (
              <div className="flex justify-center gap-2 py-3">
                {listing.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhoto(i)}
                    className={`rounded-full transition-all ${
                      currentPhoto === i
                        ? "w-4 h-2 bg-[#c8ff00]"
                        : "w-2 h-2 bg-white/20"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* ─── Price Section ─── */}
            <div className="px-4 pt-2">
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] font-[family-name:var(--font-display)]">
                {t("market.price")}
              </span>
              <p className="text-4xl sm:text-5xl font-extrabold font-[family-name:var(--font-display)] text-[#c8ff00] mt-1">
                {formatPrice(listing.price)}
              </p>
            </div>

            {/* ─── Spec Sheet ─── */}
            <div className="grid grid-cols-2 gap-3 px-4 mt-6">
              {/* Category */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-[family-name:var(--font-display)]">
                  {t("market.category")}
                </span>
                <p className="text-sm font-bold mt-1" style={{ color: accentColor }}>
                  {t(
                    (CATEGORY_KEYS[listing.category] ?? "market.other") as Parameters<typeof t>[0]
                  )}
                </p>
              </div>

              {/* Condition */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-[family-name:var(--font-display)]">
                  {t("market.condition")}
                </span>
                <p className="text-sm font-bold text-white mt-1">
                  {t(
                    (CONDITION_KEYS[listing.condition] ?? "market.used") as Parameters<typeof t>[0]
                  )}
                </p>
              </div>

              {/* Area */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-[family-name:var(--font-display)]">
                  {t("market.location")}
                </span>
                <p className="text-sm font-bold text-white mt-1 flex items-center gap-1">
                  <MapPin size={12} />
                  {locale === "ar" && listing.areaAr
                    ? listing.areaAr
                    : listing.area}
                </p>
              </div>

              {/* Listed */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-[family-name:var(--font-display)]">
                  {t("market.listed")}
                </span>
                <p className="text-sm font-bold text-white mt-1">
                  {formatTimeAgo(listing.createdAt)}
                </p>
              </div>
            </div>

            {/* ─── Description (Collapsible) ─── */}
            {listing.description && (
              <div className="px-4 mt-6">
                <button
                  onClick={() => setDescOpen(!descOpen)}
                  className="flex items-center justify-between w-full text-sm font-bold text-white"
                >
                  {t("market.description")}
                  {descOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {descOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap mt-3">
                        {locale === "ar" && listing.descriptionAr
                          ? listing.descriptionAr
                          : listing.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ─── Seller Card ─── */}
            <div className="px-4 mt-6">
              <div className="glass-dark rounded-2xl p-4 flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-[#111827]"
                  style={{ backgroundColor: "#c8ff00" }}
                >
                  {listing.sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-white">
                    {listing.sellerName}
                  </p>
                  <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {locale === "ar" && listing.areaAr
                      ? listing.areaAr
                      : listing.area}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-white/30 text-xs flex items-center gap-1 justify-end">
                    <Eye size={10} />
                    {listing.views}
                  </p>
                </div>
              </div>
            </div>

            {/* Mark as sold (seller management) */}
            {managePhone && !listing.sold && (
              <div className="px-4 mt-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleMarkSold}
                  disabled={markingSold}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-red-500/10 border border-red-500/30 py-3.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  {t("market.markSold")}
                </motion.button>
              </div>
            )}

            {/* Spacer for sticky CTA */}
            <div className="h-28" />
          </motion.div>
        )}
      </div>

      {/* ─── Sticky WhatsApp CTA ─── */}
      {listing && !loading && !listing.sold && (
        <div className="fixed bottom-0 inset-x-0 z-40">
          <div className="bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a] to-transparent pt-6 pb-safe">
            <div className="max-w-lg mx-auto px-4 pb-4">
              <a
                href={buildSellerContactLink({
                  title: listing.title,
                  phone: listing.sellerPhone,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-4 text-base font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-green-500/30 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.664-1.388A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.352 0-4.556-.764-6.34-2.088l-.144-.108-3.489 1.04 1.072-3.377-.12-.151A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                {t("market.contactSeller")}
              </a>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
