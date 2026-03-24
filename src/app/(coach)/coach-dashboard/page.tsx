"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Banknote,
  Eye,
  MessageCircle,
  ExternalLink,
  Edit3,
  Power,
  Sparkles,
  AlertCircle,
  Check,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useTranslation, useLocale } from "@/i18n";
import { CoachCard } from "@/components/cards/coach-card";
import { EmptyState } from "@/components/empty-state";
import { AREAS } from "@/lib/constants";
import {
  slideUp,
  fadeIn,
  scaleInGlow,
  staggerDarkBento,
  darkBentoItem,
} from "@/lib/animations";
import { OnboardingBanner } from "@/components/onboarding-banner";
import { PhotoUpload } from "@/components/photo-upload";

interface CoachProfileData {
  id: string;
  name: string;
  nameAr?: string | null;
  phone: string;
  whatsapp?: string | null;
  bio?: string | null;
  bioAr?: string | null;
  photo?: string | null;
  areas: string[];
  areasAr: string[];
  pricePerHour: number | null;
  experience?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function CoachDashboardPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const [profile, setProfile] = useState<CoachProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    photo: "",
    areas: [] as string[],
    pricePerHour: "",
    experience: "",
    whatsapp: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/coach/profile");
      const json = await res.json();
      if (res.ok && json.data) {
        setProfile(json.data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleToggleStatus = async () => {
    if (!profile || toggling) return;
    setToggling(true);
    try {
      const res = await fetch("/api/coach/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !profile.isActive }),
      });
      const json = await res.json();
      if (res.ok) {
        setProfile((prev) =>
          prev ? { ...prev, isActive: !prev.isActive } : prev
        );
      }
    } catch {
      // Failed to toggle
    } finally {
      setToggling(false);
    }
  };

  const handleSaveProfile = useCallback(async () => {
    if (saving || !editForm.name.trim() || editForm.areas.length === 0) return;
    setSaving(true);
    try {
      const areasAr = editForm.areas.map((areaKey) => {
        const found = AREAS.find((a) => a.key === areaKey);
        return found?.labelAr ?? areaKey;
      });
      const payload: Record<string, unknown> = {
        name: editForm.name.trim(),
        areas: editForm.areas,
        areasAr,
      };
      if (editForm.bio.trim()) payload.bio = editForm.bio.trim();
      if (editForm.photo) payload.photo = editForm.photo;
      if (editForm.pricePerHour) payload.pricePerHour = Number(editForm.pricePerHour);
      if (editForm.experience.trim()) payload.experience = editForm.experience.trim();
      if (editForm.whatsapp.trim()) payload.whatsapp = editForm.whatsapp.trim();

      const res = await fetch("/api/coach/profile", {
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

  const toggleArea = useCallback((areaKey: string) => {
    setEditForm((prev) => ({
      ...prev,
      areas: prev.areas.includes(areaKey)
        ? prev.areas.filter((a) => a !== areaKey)
        : [...prev.areas, areaKey],
    }));
  }, []);

  const displayName =
    profile && locale === "ar" && profile.nameAr
      ? profile.nameAr
      : profile?.name ?? "";

  const displayBio =
    profile && locale === "ar" && profile.bioAr
      ? profile.bioAr
      : profile?.bio;

  const getAreaLabel = (areaKey: string): string => {
    const area = AREAS.find((a) => a.key === areaKey);
    if (!area) return areaKey;
    return locale === "ar" ? area.labelAr : area.labelEn;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6 pb-28">
        <div className="flex flex-col items-center gap-6">
          <div className="w-64 card-ratio rounded-2xl animate-pulse bg-white/5 border border-white/10" />
          <div className="w-full space-y-4">
            <div className="h-14 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            <div className="h-14 rounded-2xl bg-white/5 border border-white/10 animate-pulse" style={{ animationDelay: "100ms" }} />
            <div className="h-28 rounded-2xl bg-white/5 border border-white/10 animate-pulse" style={{ animationDelay: "200ms" }} />
          </div>
        </div>
      </div>
    );
  }

  // Error / no profile
  if (error || !profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6 pb-28">
        <EmptyState
          icon={<AlertCircle size={28} />}
          title={t("coachDashboard.noProfile")}
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

      {/* ── Header ── */}
      <motion.div {...slideUp} className="mb-6">
        <h1 className="text-2xl font-bold text-white/90">
          {t("coachDashboard.title")}
        </h1>
      </motion.div>

      {/* ── Profile Card ── */}
      <motion.div {...scaleInGlow} className="flex justify-center mb-6 relative">
        {/* Ambient lime glow */}
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full blur-[100px] opacity-10 pointer-events-none bg-[#c8ff00]" />
        <CoachCard
          coach={{
            id: profile.id,
            name: profile.name,
            nameAr: profile.nameAr,
            photo: profile.photo,
            areas: profile.areas,
            areasAr: profile.areasAr,
            pricePerHour: profile.pricePerHour,
            experience: profile.experience,
          }}
          size="lg"
          interactive
        />
      </motion.div>

      {/* ── Status Toggle ── */}
      <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="mb-6">
        <button
          onClick={handleToggleStatus}
          disabled={toggling}
          className={`w-full flex items-center justify-between rounded-2xl p-4 border transition-all active:scale-[0.99] ${
            profile.isActive
              ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15"
              : "bg-white/5 border-white/10 hover:bg-white/[0.07]"
          } ${toggling ? "opacity-60" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                profile.isActive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/10 text-white/40"
              }`}
            >
              <Power size={18} />
            </div>
            <div className="text-start">
              <p className="text-sm font-semibold text-white/90">
                {t("coachDashboard.toggleStatus")}
              </p>
              <p
                className={`text-xs font-medium ${
                  profile.isActive ? "text-emerald-400" : "text-white/40"
                }`}
              >
                {profile.isActive
                  ? t("coachDashboard.active")
                  : t("coachDashboard.inactive")}
              </p>
            </div>
          </div>

          {/* Toggle pill */}
          <div
            className={`relative h-7 w-12 rounded-full transition-colors ${
              profile.isActive ? "bg-emerald-500" : "bg-white/15"
            }`}
          >
            <motion.div
              className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm"
              animate={{
                left: profile.isActive ? "calc(100% - 1.625rem)" : "0.125rem",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </button>
      </motion.div>

      {/* ── Quick Info Cards ── */}
      <motion.div
        variants={staggerDarkBento}
        initial="initial"
        animate="animate"
        className="space-y-3 mb-6"
      >
        {/* Price per hour */}
        {profile.pricePerHour !== null && (
          <motion.div variants={darkBentoItem}>
            <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c8ff00]/10 text-[#c8ff00]">
                <Banknote size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/40 text-[11px] uppercase tracking-wider font-medium">
                  {t("coachDashboard.pricePerHour")}
                </p>
                <p className="text-white/90 font-bold text-lg font-[family-name:var(--font-display)]">
                  {profile.pricePerHour} {t("common.egp")}{" "}
                  <span className="text-white/40 text-xs font-normal">
                    {t("common.perHour")}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Experience */}
        {profile.experience && (
          <motion.div variants={darkBentoItem}>
            <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Clock size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/40 text-[11px] uppercase tracking-wider font-medium">
                  {t("coachDashboard.experience")}
                </p>
                <p className="text-white/90 font-semibold text-sm">
                  {profile.experience}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Areas */}
        {profile.areas.length > 0 && (
          <motion.div variants={darkBentoItem}>
            <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-4">
              <p className="text-white/40 text-[11px] uppercase tracking-wider font-medium mb-3">
                {t("coachDashboard.areas")}
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.areas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/20 px-3 py-1.5 text-xs font-medium text-[#c8ff00]"
                  >
                    <MapPin size={10} />
                    {getAreaLabel(area)}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Bio */}
        <motion.div variants={darkBentoItem}>
          <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-4">
            <p className="text-white/40 text-[11px] uppercase tracking-wider font-medium mb-2">
              {t("coachDashboard.bio")}
            </p>
            {displayBio ? (
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                {displayBio}
              </p>
            ) : (
              <p className="text-white/30 text-sm italic">
                {t("coachDashboard.noBio")}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Stats Placeholder ── */}
      <motion.div
        {...fadeIn}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-lg font-bold text-white/90 mb-4">
          {t("coachDashboard.stats")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-4 text-center">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-2">
              <Eye size={18} />
            </div>
            <p className="text-2xl font-black text-white/20 font-[family-name:var(--font-display)]">
              --
            </p>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mt-1">
              {t("coachDashboard.profileViews")}
            </p>
            <p className="text-white/20 text-[9px] mt-1">
              {t("coachDashboard.comingSoon")}
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-4 text-center">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-green-500/10 text-green-400 mb-2">
              <MessageCircle size={18} />
            </div>
            <p className="text-2xl font-black text-white/20 font-[family-name:var(--font-display)]">
              --
            </p>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mt-1">
              {t("coachDashboard.whatsappClicks")}
            </p>
            <p className="text-white/20 text-[9px] mt-1">
              {t("coachDashboard.comingSoon")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Action Buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3"
      >
        {/* View public profile */}
        <Link
          href={`/coaches/${profile.id}`}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-[#c8ff00] py-3.5 text-sm font-bold text-[#111827] shadow-lg shadow-[#c8ff00]/20 transition-all hover:shadow-[0_0_30px_rgba(200,255,0,0.3)] active:scale-[0.98]"
        >
          <ExternalLink size={16} />
          {t("coachDashboard.viewPublicProfile")}
        </Link>

        {/* Edit profile */}
        <button
          onClick={() => {
            if (editing) {
              setEditing(false);
            } else if (profile) {
              setEditForm({
                name: profile.name,
                bio: profile.bio || "",
                photo: profile.photo || "",
                areas: [...profile.areas],
                pricePerHour: profile.pricePerHour ? String(profile.pricePerHour) : "",
                experience: profile.experience || "",
                whatsapp: profile.whatsapp || "",
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
          {editing ? t("common.cancel") : t("coachDashboard.editProfile")}
        </button>

        {/* ── Edit Form (slide down) ── */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-5 space-y-5">
                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    {t("coachDashboard.profilePhoto")}
                  </label>
                  <PhotoUpload
                    photos={editForm.photo ? [editForm.photo] : []}
                    onChange={(photos) =>
                      setEditForm((prev) => ({ ...prev, photo: photos[0] || "" }))
                    }
                    max={1}
                  />
                </div>

                {/* Name field */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    {t("coachDashboard.name")}
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

                {/* Bio field */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    {t("coachDashboard.bio")}
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    maxLength={500}
                    rows={3}
                    placeholder={t("coachDashboard.bioPlaceholder")}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    dir="auto"
                  />
                  <p className="text-end text-[10px] text-white/30 mt-1">
                    {editForm.bio.length}/500
                  </p>
                </div>

                {/* Areas multi-select */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    {t("coachDashboard.selectAreas")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AREAS.filter((a) => a.key !== "all").map((area) => (
                      <button
                        key={area.key}
                        type="button"
                        onClick={() => toggleArea(area.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          editForm.areas.includes(area.key)
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                            : "bg-white/5 border border-white/10 text-white/50 hover:text-white/70"
                        }`}
                      >
                        {locale === "ar" ? area.labelAr : area.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price per hour */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    {t("coachDashboard.pricePerHourLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={editForm.pricePerHour}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, pricePerHour: e.target.value }))
                      }
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pe-16 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      dir="ltr"
                    />
                    <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-white/30 pointer-events-none">
                      {t("common.egp")}
                    </span>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    {t("coachDashboard.experience")}
                  </label>
                  <input
                    type="text"
                    value={editForm.experience}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, experience: e.target.value }))
                    }
                    placeholder={t("coachDashboard.experiencePlaceholder")}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    dir="auto"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    {t("coachDashboard.whatsapp")}
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={editForm.whatsapp}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    dir="ltr"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving || !editForm.name.trim() || editForm.areas.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {t("coachDashboard.saving")}
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
              className="flex items-center justify-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/25 py-2.5 px-4 text-sm font-medium text-emerald-400"
            >
              <Check size={14} />
              {t("coachDashboard.profileUpdated")}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign Out */}
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
      </motion.div>
    </div>
  );
}
