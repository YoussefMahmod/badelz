"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  MapPin,
  Share2,
  Package,
  CheckCircle,
  Calendar,
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
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [markingSold, setMarkingSold] = useState(false);

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

  return (
    <MainLayout showNav={false}>
      <div className="mx-auto max-w-lg">
        {/* Back button */}
        <div className="px-4 py-4">
          <motion.button
            initial={{ opacity: 0, x: locale === "ar" ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
          >
            <BackIcon size={18} />
            <span className="text-sm">{t("common.back")}</span>
          </motion.button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="px-4 space-y-4">
            <div className="h-72 rounded-2xl dark-skeleton animate-pulse" />
            <div className="space-y-3">
              <div className="h-6 w-3/4 rounded-lg dark-skeleton" />
              <div className="h-8 w-1/3 rounded-lg dark-skeleton" />
              <div className="h-20 rounded-xl dark-skeleton" />
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
            {/* Photo gallery */}
            <div className="relative">
              {listing.photos.length > 0 ? (
                <>
                  <div className="h-72 bg-white/5 overflow-hidden">
                    <img
                      src={listing.photos[selectedPhoto]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {listing.photos.length > 1 && (
                    <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar">
                      {listing.photos.map((photo, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPhoto(i)}
                          className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            selectedPhoto === i
                              ? "border-[#c8ff00] opacity-100"
                              : "border-white/10 opacity-50 hover:opacity-80"
                          }`}
                        >
                          <img
                            src={photo}
                            alt={`${listing.title} ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="h-72 flex items-center justify-center"
                  style={{
                    backgroundColor: `${LISTING_CATEGORY_COLORS[listing.category] ?? "#9ca3af"}10`,
                  }}
                >
                  <Package
                    size={64}
                    style={{
                      color: LISTING_CATEGORY_COLORS[listing.category] ?? "#9ca3af",
                    }}
                    className="opacity-40"
                  />
                </div>
              )}

              {/* Sold overlay */}
              {listing.sold && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="rounded-full bg-red-500/20 border border-red-500/50 px-6 py-3 text-red-400 font-bold text-lg">
                    {t("market.markSold")}
                  </div>
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="px-4 py-5 space-y-5">
              <div className="glass-dark rounded-2xl p-5 space-y-4">
                {/* Title */}
                <h1 className="text-xl font-bold text-white leading-tight">
                  {locale === "ar" && listing.titleAr
                    ? listing.titleAr
                    : listing.title}
                </h1>

                {/* Price */}
                <p className="text-[#c8ff00] text-3xl font-extrabold font-[family-name:var(--font-display)]">
                  {formatPrice(listing.price)}{" "}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${LISTING_CATEGORY_COLORS[listing.category] ?? "#9ca3af"}25`,
                      color: LISTING_CATEGORY_COLORS[listing.category] ?? "#9ca3af",
                    }}
                  >
                    {t(
                      (CATEGORY_KEYS[listing.category] ?? "market.other") as Parameters<typeof t>[0]
                    )}
                  </span>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                    {t(
                      (CONDITION_KEYS[listing.condition] ?? "market.used") as Parameters<typeof t>[0]
                    )}
                  </span>
                </div>

                {/* Description */}
                {listing.description && (
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                    {listing.description}
                  </p>
                )}

                {/* Seller info */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <p className="text-white/90 text-sm font-semibold">
                      {listing.sellerName}
                    </p>
                    <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {locale === "ar" && listing.areaAr
                        ? listing.areaAr
                        : listing.area}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-white/40 text-xs flex items-center gap-1 justify-end">
                      <Eye size={10} />
                      {t("market.views", { count: listing.views })}
                    </p>
                    <p className="text-white/30 text-xs flex items-center gap-1 justify-end mt-0.5">
                      <Calendar size={10} />
                      {t("market.listedAgo", {
                        time: formatTimeAgo(listing.createdAt),
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 pb-6">
                {/* WhatsApp CTA */}
                {!listing.sold && (
                  <a
                    href={buildSellerContactLink({
                      title: listing.title,
                      phone: listing.sellerPhone,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-full bg-green-500 py-4 text-base font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 active:scale-[0.98]"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.664-1.388A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.352 0-4.556-.764-6.34-2.088l-.144-.108-3.489 1.04 1.072-3.377-.12-.151A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    {t("market.contactSeller")}
                  </a>
                )}

                {/* Share button */}
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 w-full rounded-full border border-white/10 py-3.5 text-sm font-semibold text-white/70 transition-all hover:bg-white/5 hover:text-white active:scale-[0.98]"
                >
                  <Share2 size={16} />
                  {t("market.shareListing")}
                </button>

                {/* Mark as sold (seller management) */}
                {managePhone && !listing.sold && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleMarkSold}
                    disabled={markingSold}
                    className="flex items-center justify-center gap-2 w-full rounded-full bg-red-500/10 border border-red-500/30 py-3.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    {t("market.markSold")}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
