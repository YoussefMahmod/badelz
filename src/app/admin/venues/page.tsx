"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation, useLocale } from "@/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { buildWhatsAppDirectLink } from "@/lib/whatsapp";
import {
  Search,
  Building2,
  ExternalLink,
  MessageCircle,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MapPin,
} from "lucide-react";

// ─── Types ───

interface VenueOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface VenueCompleteness {
  hasSlots: boolean;
  hasCoverPhoto: boolean;
  hasWhatsApp: boolean;
  hasArabicName: boolean;
  hasLocation: boolean;
  score: number;
}

interface Venue {
  id: string;
  name: string;
  nameAr: string | null;
  owner: VenueOwner;
  city: string;
  cityAr: string | null;
  phone: string;
  whatsapp: string | null;
  isActive: boolean;
  isFoundingVenue: boolean;
  createdAt: string;
  courtsCount: number;
  bookingsCount: number;
  completeness: VenueCompleteness;
}

type StatusFilter = "all" | "active" | "inactive";

const COMPLETENESS_KEYS: (keyof Omit<VenueCompleteness, "score">)[] = [
  "hasSlots",
  "hasCoverPhoto",
  "hasWhatsApp",
  "hasArabicName",
  "hasLocation",
];

const COMPLETENESS_LABELS: Record<string, string> = {
  hasSlots: "Time Slots",
  hasCoverPhoto: "Cover Photo",
  hasWhatsApp: "WhatsApp",
  hasArabicName: "Arabic Name",
  hasLocation: "Location",
};

// ─── Component ───

export default function AdminVenuesPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Fetch venues
  const fetchVenues = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter,
        page: String(page),
        limit: "20",
      });
      const res = await fetch(`/api/admin/venues?${params}`);
      const json = await res.json();
      if (json.data) {
        setVenues(json.data.venues);
        setTotal(json.data.total);
        setTotalPages(json.data.totalPages);
      }
    } catch {
      // Silently handle — venues stay empty, empty state shown
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // Toggle active status (optimistic)
  const handleToggle = async (venueId: string) => {
    setTogglingId(venueId);

    // Optimistic update
    setVenues((prev) =>
      prev.map((v) => (v.id === venueId ? { ...v, isActive: !v.isActive } : v))
    );

    try {
      const res = await fetch(`/api/admin/venues/${venueId}/toggle`, {
        method: "PATCH",
      });
      if (!res.ok) {
        // Revert on failure
        setVenues((prev) =>
          prev.map((v) =>
            v.id === venueId ? { ...v, isActive: !v.isActive } : v
          )
        );
      }
    } catch {
      // Revert on error
      setVenues((prev) =>
        prev.map((v) =>
          v.id === venueId ? { ...v, isActive: !v.isActive } : v
        )
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleWhatsApp = (venue: Venue) => {
    const phone = venue.phone || venue.owner.phone;
    if (phone) {
      window.open(buildWhatsAppDirectLink(phone), "_blank");
    }
  };

  const handleStatusFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("admin.all") },
    { key: "active", label: t("admin.active") },
    { key: "inactive", label: t("admin.inactive") },
  ];

  const getDisplayName = (venue: Venue) =>
    locale === "ar" && venue.nameAr ? venue.nameAr : venue.name;

  const getDisplayCity = (venue: Venue) =>
    locale === "ar" && venue.cityAr ? venue.cityAr : venue.city;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-xl font-bold text-white/90">
          {t("admin.venues")}
        </h1>
        {!isLoading && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-300"
          >
            {total}
          </motion.span>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.searchVenues")}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 ps-10 pe-4 text-sm text-white/90 placeholder:text-white/30 backdrop-blur-lg outline-none transition-colors focus:border-indigo-500/50 focus:bg-white/[0.07]"
        />
      </div>

      {/* Status filter chips */}
      <div className="mb-5 flex gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => handleStatusFilterChange(filter.key)}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              statusFilter === filter.key
                ? "bg-indigo-500/20 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : venues.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-7 w-7" />}
          title={t("admin.noVenues")}
        />
      ) : (
        <>
          {/* Venue cards */}
          <motion.div
            {...staggerContainer}
            className="flex flex-col gap-3"
          >
            <AnimatePresence mode="popLayout">
              {venues.map((venue) => (
                <motion.div
                  key={venue.id}
                  {...staggerItem}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg"
                >
                  {/* Top row: Name + founding badge + status */}
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-white/90">
                          {getDisplayName(venue)}
                        </h3>
                        {venue.isFoundingVenue && (
                          <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                            Founding
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-white/40">
                        {venue.owner.name} &middot; {venue.owner.email}
                      </p>
                    </div>

                    {/* Active toggle */}
                    <button
                      onClick={() => handleToggle(venue.id)}
                      disabled={togglingId === venue.id}
                      className="shrink-0 cursor-pointer rounded-lg p-1 transition-colors hover:bg-white/5 disabled:opacity-50"
                      title={t("admin.toggleStatus")}
                      aria-label={`${t("admin.toggleStatus")}: ${venue.name}`}
                    >
                      {venue.isActive ? (
                        <ToggleRight className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-white/25" />
                      )}
                    </button>
                  </div>

                  {/* City */}
                  <div className="mb-3 flex items-center gap-1.5 text-xs text-white/50">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{getDisplayCity(venue)}</span>
                  </div>

                  {/* Stats row */}
                  <div className="mb-3 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <span className="font-semibold text-white/70">
                        {venue.courtsCount}
                      </span>
                      <span>{t("admin.courts")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <span className="font-semibold text-white/70">
                        {venue.bookingsCount}
                      </span>
                      <span>{t("admin.bookings")}</span>
                    </div>
                  </div>

                  {/* Completeness dots */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-white/30">
                      {t("admin.completeness")}
                    </span>
                    <div className="flex items-center gap-1">
                      {COMPLETENESS_KEYS.map((key) => (
                        <span
                          key={key}
                          title={COMPLETENESS_LABELS[key]}
                          className={`inline-block h-2 w-2 rounded-full transition-colors ${
                            venue.completeness[key]
                              ? "bg-indigo-400"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-white/30">
                      {venue.completeness.score}/5
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                    <button
                      onClick={() => handleWhatsApp(venue)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                      aria-label={`${t("admin.contactOwner")}: ${venue.owner.name}`}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {t("admin.contactOwner")}
                    </button>
                    <a
                      href={`/venues/${venue.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/80"
                      aria-label={`${t("admin.viewVenue")}: ${venue.name}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t("admin.viewVenue")}
                    </a>

                    {/* Status indicator */}
                    <div className="ms-auto flex items-center gap-1 text-[10px]">
                      {venue.isActive ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400/70">
                            {t("admin.active")}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 text-red-400/60" />
                          <span className="text-red-400/50">
                            {t("admin.inactive")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex cursor-pointer items-center gap-1 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-white/40">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex cursor-pointer items-center gap-1 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
