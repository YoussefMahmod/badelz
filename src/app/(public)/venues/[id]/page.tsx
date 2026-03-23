"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  RectangleHorizontal,
} from "lucide-react";
import { CourtCard } from "@/components/court-card";
import { MapEmbed } from "@/components/map-embed";
import { EmptyState } from "@/components/empty-state";
import { useVenueDetail } from "@/hooks/use-venue-detail";
import { useTranslation, useLocale } from "@/i18n";
import { buildVenueShareLink, buildWhatsAppDirectLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import { revealUp, staggerBento } from "@/lib/animations";

export default function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useTranslation();
  const { locale, dir } = useLocale();
  const router = useRouter();
  const { venue, loading, error } = useVenueDetail(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        {/* Skeleton cover */}
        <div className="h-72 sm:h-96 w-full animate-pulse dark-skeleton" />
        <div className="relative -mt-16 mx-4 sm:mx-auto sm:max-w-2xl">
          <div className="rounded-2xl bg-[#111827] border border-white/10 p-6 sm:p-8 animate-pulse space-y-4 shadow-dark-elevated">
            <div className="h-8 w-3/4 rounded-lg dark-skeleton" />
            <div className="h-5 w-1/2 rounded-lg dark-skeleton" />
            <div className="h-4 w-full rounded-lg dark-skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <EmptyState
          icon={<MapPin size={28} />}
          title={t("common.error")}
          description={t("common.noResults")}
          action={{ label: t("common.back"), onClick: () => router.push("/browse") }}
        />
      </div>
    );
  }

  const displayName = locale === "ar" && venue.nameAr ? venue.nameAr : venue.name;
  const displayAddress = locale === "ar" && venue.addressAr ? venue.addressAr : venue.address;
  const displayCity = locale === "ar" && venue.cityAr ? venue.cityAr : venue.city;
  const displayDesc = locale === "ar" && venue.descriptionAr ? venue.descriptionAr : venue.description;

  const shareUrl = buildVenueShareLink({ name: displayName, id: venue.id });
  const whatsappUrl = venue.whatsapp
    ? buildWhatsAppDirectLink(venue.whatsapp)
    : null;

  const coverPhoto = venue.coverPhoto || (venue.photos.length > 0 ? venue.photos[0] : null);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ url: window.location.href, title: displayName });
    } else {
      window.open(shareUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] pb-24">
      {/* Full-bleed cover photo */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={displayName}
            className="h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="h-full w-full bg-white/5 flex items-center justify-center">
            <RectangleHorizontal className="h-20 w-20 text-white/10" />
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/60 to-transparent" />

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => router.back()}
          className="absolute top-4 start-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label={t("common.back")}
        >
          <ArrowRight
            size={18}
            className={dir === "ltr" ? "rotate-180" : ""}
          />
        </motion.button>

        {/* Share button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          onClick={handleShare}
          className="absolute top-4 end-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label={t("venue.share")}
        >
          <Share2 size={18} />
        </motion.button>
      </div>

      {/* Floating info card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative -mt-16 mx-4 sm:mx-auto sm:max-w-2xl"
      >
        <div className="rounded-2xl bg-[#111827] border border-white/10 shadow-dark-elevated p-6 sm:p-8">
          {/* Name + location + rating */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {displayName}
          </h1>

          <div className="flex items-center gap-3 text-base text-white/50 mb-4">
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-white/30" />
              {displayCity}
            </span>
            {venue.rating > 0 ? (
              <span className="flex items-center gap-1 rounded-full bg-[#c8ff00]/10 px-2.5 py-0.5 text-[#c8ff00] text-sm font-medium">
                <Star size={13} className="fill-[#c8ff00] text-[#c8ff00]" />
                {t("venue.rating", {
                  rating: venue.rating.toFixed(1),
                  count: venue.ratingCount,
                })}
              </span>
            ) : (
              <span className="text-white/30 text-sm">
                {t("venue.noRating")}
              </span>
            )}
          </div>

          {/* Description */}
          {displayDesc && (
            <p className="text-sm text-white/60 leading-relaxed mb-5">
              {displayDesc}
            </p>
          )}

          {/* Contact buttons */}
          <div className="flex gap-2">
            <a
              href={`tel:${venue.phone}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 py-3 text-sm font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
            >
              <Phone size={16} />
              {t("venue.callVenue")}
            </a>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 py-3 text-sm font-semibold text-green-400 transition-all hover:bg-green-500/15 hover:text-green-300"
              >
                <MessageCircle size={16} />
                {t("venue.whatsapp")}
              </a>
            )}
            <button
              onClick={handleShare}
              className="flex items-center justify-center rounded-full bg-white/5 border border-white/10 px-3.5 text-white/50 transition-all hover:bg-white/10 hover:text-white/70"
              aria-label={t("venue.share")}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Below the card: map + courts */}
      <div className="mx-4 sm:mx-auto sm:max-w-2xl mt-6 space-y-6">
        {/* Map section */}
        <motion.div {...revealUp}>
          <MapEmbed
            latitude={venue.latitude}
            longitude={venue.longitude}
            address={displayAddress}
            venueName={displayName}
          />
        </motion.div>

        {/* Courts section */}
        <motion.div {...revealUp}>
          <h2 className="text-xl font-bold text-white mb-4">
            {t("venue.courts")}
          </h2>
          {venue.courts.length === 0 ? (
            <EmptyState
              icon={<RectangleHorizontal size={24} />}
              title={t("venue.noCourts")}
            />
          ) : (
            <motion.div
              variants={staggerBento}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              {venue.courts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  venueId={venue.id}
                  onBook={(courtId) => router.push(`/book/${courtId}`)}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Sticky Book Now bar */}
      {venue.courts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-0 start-0 end-0 z-50 bg-[#0a0f1a]/90 backdrop-blur-xl border-t border-white/5 p-4 safe-bottom"
        >
          <div className="mx-auto max-w-2xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{venue.courts[0].nameAr || venue.courts[0].name}</p>
              <p className="text-xs text-[#c8ff00] font-medium">
                {formatPrice(parseFloat(String(venue.courts[0].pricePerHour)))} {t("common.perHour")}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/book/${venue.courts[0].id}`)}
              className="shrink-0 rounded-full bg-[#c8ff00] px-8 py-3.5 text-sm font-bold text-[#111827] shadow-[0_0_20px_rgba(200,255,0,0.2)] hover:shadow-[0_0_30px_rgba(200,255,0,0.3)] transition-all"
            >
              {t("venue.bookNow")}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Floating WhatsApp share */}
      {whatsappUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="fixed bottom-24 end-4 z-40"
        >
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-13 w-13 items-center justify-center rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-transform hover:scale-110"
            style={{ width: 52, height: 52 }}
            aria-label={t("venue.share")}
          >
            <Share2 size={22} className="text-white" />
          </a>
        </motion.div>
      )}
    </div>
  );
}
