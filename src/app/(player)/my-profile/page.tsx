"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Trophy,
  Star,
  TrendingUp,
  CalendarDays,
  MapPin,
  Edit3,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  Check,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation, useLocale } from "@/i18n";
import { PlayerCard } from "@/components/cards/player-card";
import { EmptyState } from "@/components/empty-state";
import { AREAS, PLAYER_TIER_COLORS, type PlayerTier } from "@/lib/constants";
import {
  slideUp,
  fadeIn,
  scaleInGlow,
  staggerDarkBento,
  darkBentoItem,
} from "@/lib/animations";
import { OnboardingBanner } from "@/components/onboarding-banner";
import { PhotoUpload } from "@/components/photo-upload";

interface PlayerProfileData {
  id: string;
  name: string;
  nameAr?: string | null;
  email: string;
  phone?: string | null;
  area?: string | null;
  areaAr?: string | null;
  avatar?: string | null;
  gamesPlayed: number;
  gamesWon: number;
  rating: number;
  tier: PlayerTier;
  memberSince: string;
}

interface BookingData {
  id: string;
  playerName: string;
  playerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  confirmationCode: string;
  totalPrice: number | string;
  court: { name: string; nameAr?: string | null };
  venue: { name: string; nameAr?: string | null };
}

const TIER_COLORS = PLAYER_TIER_COLORS;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  CONFIRMED: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  PENDING: { bg: "bg-amber-500/15", text: "text-amber-400" },
  COMPLETED: { bg: "bg-blue-500/15", text: "text-blue-400" },
  CANCELLED: { bg: "bg-red-500/15", text: "text-red-400" },
  NO_SHOW: { bg: "bg-white/5", text: "text-white/40" },
};

export default function PlayerProfilePage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user } = useAuth();

  const [profile, setProfile] = useState<PlayerProfileData | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState(false);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", area: "", avatar: "" });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/player/profile");
      const json = await res.json();
      if (res.ok && json.data) {
        setProfile(json.data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchBookings = useCallback(async (phone: string) => {
    setLoadingBookings(true);
    try {
      const res = await fetch(`/api/bookings?phone=${phone}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setBookings(Array.isArray(json.data) ? json.data : []);
      }
    } catch {
      // Silently fail for bookings — non-critical
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (saving || !editForm.name.trim()) return;
    setSaving(true);
    try {
      const areaObj = AREAS.find((a) => a.key === editForm.area);
      const payload: Record<string, string> = { name: editForm.name.trim() };
      if (editForm.area) {
        payload.area = editForm.area;
        payload.areaAr = areaObj?.labelAr ?? editForm.area;
      }
      if (editForm.avatar) {
        payload.avatar = editForm.avatar;
      }
      const res = await fetch("/api/player/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        await fetchProfile();
      }
    } catch {
      // Save failed silently — user can retry
    } finally {
      setSaving(false);
    }
  }, [saving, editForm, fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?.phone) {
      fetchBookings(profile.phone);
    } else if (user?.phone) {
      fetchBookings(user.phone);
    } else {
      setLoadingBookings(false);
    }
  }, [profile?.phone, user?.phone, fetchBookings]);

  const winRate = useMemo(() => {
    if (!profile || profile.gamesPlayed === 0) return 0;
    return Math.round((profile.gamesWon / profile.gamesPlayed) * 100);
  }, [profile]);

  const displayName = useMemo(() => {
    if (!profile) return "";
    return locale === "ar" && profile.nameAr ? profile.nameAr : profile.name;
  }, [profile, locale]);

  const tierColor = profile ? TIER_COLORS[profile.tier] : "#c8ff00";
  const tierLabel = profile
    ? t(`player.${profile.tier.toLowerCase()}` as "player.bronze")
    : "";

  const memberSince = profile
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
      }).format(new Date(profile.memberSince))
    : "";

  // Separate bookings into upcoming and past
  const now = new Date();
  const upcomingBookings = useMemo(
    () =>
      bookings.filter((b) => {
        const bookingDate = new Date(b.date);
        return bookingDate >= now && b.status !== "CANCELLED";
      }),
    [bookings, now]
  );

  const recentBookings = useMemo(
    () => bookings.slice(0, 5),
    [bookings]
  );

  const formatBookingDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      CONFIRMED: t("myBookings.confirmed"),
      PENDING: t("myBookings.pending"),
      CANCELLED: t("myBookings.cancelled"),
      COMPLETED: t("myBookings.completed"),
      NO_SHOW: t("myBookings.noShow"),
    };
    return map[status] ?? status;
  };

  // Loading skeleton
  if (loadingProfile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6 pb-28">
        {/* Header skeleton */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-64 card-ratio rounded-2xl animate-pulse bg-white/5 border border-white/10" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        {/* Bookings skeleton */}
        <div className="space-y-3">
          <div className="h-6 w-32 rounded dark-skeleton" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6 pb-28">
        <EmptyState
          icon={<Gamepad2 size={28} />}
          title={t("common.error")}
          description={t("errors.unexpectedError")}
          action={{
            label: t("errors.tryAgain"),
            onClick: fetchProfile,
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-28">
      <OnboardingBanner />

      {/* ── Player Card ── */}
      <motion.div {...scaleInGlow} className="flex justify-center mb-8 relative">
        {/* Ambient glow */}
        <div
          className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-15 pointer-events-none"
          style={{ backgroundColor: tierColor }}
        />
        <PlayerCard
          player={{
            name: profile.name,
            nameAr: profile.nameAr,
            area: profile.area,
            areaAr: profile.areaAr,
            gamesPlayed: profile.gamesPlayed,
            gamesWon: profile.gamesWon,
            rating: profile.rating,
            tier: profile.tier,
            avatar: profile.avatar,
          }}
          size="lg"
          interactive
        />
      </motion.div>

      {/* ── Stats Grid ── */}
      <motion.div
        variants={staggerDarkBento}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3 mb-8"
      >
        <motion.div variants={darkBentoItem}>
          <StatCard
            icon={<Gamepad2 size={18} />}
            label={t("playerProfile.gamesPlayed")}
            value={String(profile.gamesPlayed)}
            color={tierColor}
          />
        </motion.div>
        <motion.div variants={darkBentoItem}>
          <StatCard
            icon={<Trophy size={18} />}
            label={t("playerProfile.gamesWon")}
            value={String(profile.gamesWon)}
            color="#ffd700"
          />
        </motion.div>
        <motion.div variants={darkBentoItem}>
          <StatCard
            icon={<TrendingUp size={18} />}
            label={t("playerProfile.winRate")}
            value={`${winRate}%`}
            color="#50c878"
          />
        </motion.div>
        <motion.div variants={darkBentoItem}>
          <StatCard
            icon={<Star size={18} />}
            label={t("playerProfile.rating")}
            value={String(profile.rating)}
            color="#c8ff00"
          />
        </motion.div>
      </motion.div>

      {/* ── Member info ── */}
      <motion.div
        {...fadeIn}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-4 mb-8"
      >
        {profile.area && (
          <span className="flex items-center gap-1.5 text-white/40 text-xs">
            <MapPin size={12} />
            {locale === "ar" && profile.areaAr ? profile.areaAr : profile.area}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-white/40 text-xs">
          <CalendarDays size={12} />
          {t("player.memberSince")} {memberSince}
        </span>
      </motion.div>

      {/* ── My Bookings ── */}
      <motion.div {...slideUp} transition={{ delay: 0.35 }} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white/90">
            {t("playerProfile.myBookings")}
          </h2>
          {bookings.length > 5 && (
            <Link
              href="/my-bookings"
              className="text-xs font-medium text-[#c8ff00] hover:text-[#c8ff00]/80 transition-colors"
            >
              {t("playerProfile.viewAllBookings")}
            </Link>
          )}
        </div>

        {loadingBookings ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-8 text-center">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/30 mb-3">
              <Search size={20} />
            </div>
            <p className="text-white/50 text-sm mb-4">
              {t("playerProfile.noBookings")}
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.98]"
            >
              {t("playerProfile.bookNow")}
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {recentBookings.map((booking, index) => {
                const statusStyle =
                  STATUS_COLORS[booking.status] ?? STATUS_COLORS.PENDING;
                const venueName =
                  locale === "ar" && booking.venue.nameAr
                    ? booking.venue.nameAr
                    : booking.venue.name;
                const courtName =
                  locale === "ar" && booking.court.nameAr
                    ? booking.court.nameAr
                    : booking.court.name;

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-4 hover:bg-white/[0.07] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-white/90 font-semibold text-sm truncate">
                          {venueName}
                        </p>
                        <p className="text-white/40 text-xs mt-0.5 truncate">
                          {courtName}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-white/50 text-xs">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={11} />
                            {formatBookingDate(booking.date)}
                          </span>
                          <span className="flex items-center gap-1" dir="ltr">
                            <Clock size={11} />
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* ── Edit Profile Button ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-3"
      >
        <button
          onClick={() => {
            if (editing) {
              setEditing(false);
            } else {
              setEditForm({
                name: profile.name,
                area: profile.area || "",
                avatar: profile.avatar || "",
              });
              setEditing(true);
            }
          }}
          className={`w-full flex items-center justify-center gap-2 rounded-full border py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${
            editing
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-white/10 text-white/60 hover:bg-white/5 hover:text-white/90"
          }`}
        >
          {editing ? <X size={16} /> : <Edit3 size={16} />}
          {editing ? t("common.cancel") : t("playerProfile.editProfile")}
        </button>
      </motion.div>

      {/* ── Edit Form (slide down) ── */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden mb-3"
          >
            <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-5 space-y-5">
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  {t("playerProfile.profilePhoto")}
                </label>
                <PhotoUpload
                  photos={editForm.avatar ? [editForm.avatar] : []}
                  onChange={(photos) =>
                    setEditForm((prev) => ({ ...prev, avatar: photos[0] || "" }))
                  }
                  max={1}
                />
              </div>

              {/* Name field */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  {t("playerProfile.name")}
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  dir="auto"
                />
              </div>

              {/* Area selection */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  {t("playerProfile.selectArea")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {AREAS.filter((a) => a.key !== "all").map((area) => (
                    <button
                      key={area.key}
                      type="button"
                      onClick={() =>
                        setEditForm((prev) => ({ ...prev, area: area.key }))
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        editForm.area === area.key
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                          : "bg-white/5 border border-white/10 text-white/50 hover:text-white/70"
                      }`}
                    >
                      {locale === "ar" ? area.labelAr : area.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !editForm.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t("playerProfile.saving")}
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {t("common.save")}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white/70"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Save Success Toast ── */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 flex items-center justify-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/25 py-2.5 px-4 text-sm font-medium text-emerald-400"
          >
            <Check size={14} />
            {t("playerProfile.profileUpdated")}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sign Out ── */}
      <button
        onClick={() => {
          import("next-auth/react").then(({ signOut }) =>
            signOut({ callbackUrl: "/" })
          );
        }}
        className="w-full flex items-center justify-center gap-2 rounded-full border border-red-500/20 py-3 text-sm font-medium text-red-400/70 transition-all hover:bg-red-500/5 hover:text-red-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        {t("auth.signOut")}
      </button>
    </div>
  );
}

/* ── Stat Card sub-component ── */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-4">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl mb-3"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <p className="text-2xl font-black text-white/90 font-[family-name:var(--font-display)] tabular-nums">
        {value}
      </p>
      <p className="text-white/40 text-[11px] font-medium uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  );
}
