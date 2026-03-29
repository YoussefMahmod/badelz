"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  PartyPopper,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle,
  X,
  Building2,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation, useLocale } from "@/i18n";
import { Logo } from "@/components/logo";
import { AREAS } from "@/lib/constants";
import { getNearestArea } from "@/lib/geolocation";

// ─── Types ───

type UserRole = "PLAYER" | "COACH" | "VENUE_OWNER";

interface PlayerForm {
  area: string;
}

interface CoachForm {
  areas: string[];
  whatsapp: string;
  pricePerHour: string;
  experience: string;
  bio: string;
}

interface OwnerVenueForm {
  name: string;
  nameAr: string;
  address: string;
  addressAr: string;
  city: string;
  cityAr: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  whatsapp: string;
}

interface OwnerCourtForm {
  name: string;
  nameAr: string;
  pricePerHour: string;
}

// ─── Constants ───

const STEP_COUNTS: Record<UserRole, number> = {
  PLAYER: 2,
  COACH: 3,
  VENUE_OWNER: 3,
};

const inputClasses =
  "w-full rounded-sm bg-[#1a1a1a] border border-[#333] px-4 py-3 text-sm text-white outline-none placeholder:text-[#666] focus:border-[#d4ff00] focus:ring-2 focus:ring-0 transition-all";

const labelClasses = "block text-sm font-medium text-[#999] mb-1.5";

// ─── Page wrapper with Suspense ───

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d0d]">
          <Loader2 size={28} className="animate-spin text-[#d4ff00]" />
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}

// ─── Main wizard ───

function OnboardingWizard() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Player state
  const [playerForm, setPlayerForm] = useState<PlayerForm>({ area: "" });

  // Coach state
  const [coachForm, setCoachForm] = useState<CoachForm>({
    areas: [],
    whatsapp: "",
    pricePerHour: "",
    experience: "",
    bio: "",
  });

  // Owner state
  const [venueForm, setVenueForm] = useState<OwnerVenueForm>({
    name: "",
    nameAr: "",
    address: "",
    addressAr: "",
    city: "",
    cityAr: "",
    latitude: null,
    longitude: null,
    phone: "",
    whatsapp: "",
  });
  const [courtForm, setCourtForm] = useState<OwnerCourtForm>({
    name: "",
    nameAr: "",
    pricePerHour: "",
  });

  // Pre-fill phone from user
  useEffect(() => {
    if (user?.phone) {
      setCoachForm((prev) => ({ ...prev, whatsapp: prev.whatsapp || user.phone || "" }));
      setVenueForm((prev) => ({ ...prev, phone: prev.phone || user.phone || "" }));
    }
  }, [user?.phone]);

  // ─── Auth guards ───

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d0d]">
        <Loader2 size={28} className="animate-spin text-[#d4ff00]" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    router.replace("/login");
    return null;
  }

  if (user.isOnboarded) {
    const dest =
      user.role === "VENUE_OWNER"
        ? "/dashboard"
        : user.role === "COACH"
          ? "/coach-dashboard"
          : "/my-profile";
    router.replace(dest);
    return null;
  }

  const role = user.role as UserRole;
  const totalSteps = STEP_COUNTS[role];

  // ─── Navigation ───

  const goNext = () => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep((s) => s + 1);
      setError("");
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
      setError("");
    }
  };

  // ─── Submit handlers ───

  const submitPlayer = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area: playerForm.area }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.message || t("common.error"));
        setLoading(false);
        return;
      }
      // Hard redirect to force fresh session
      window.location.href = "/my-profile";
    } catch {
      setError(t("common.error"));
      setLoading(false);
    }
  };

  const submitCoach = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areas: coachForm.areas,
          whatsapp: coachForm.whatsapp.replace(/\D/g, "") || undefined,
          pricePerHour: coachForm.pricePerHour ? Number(coachForm.pricePerHour) : undefined,
          experience: coachForm.experience.trim() || undefined,
          bio: coachForm.bio.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.message || t("common.error"));
        setLoading(false);
        return;
      }
      // Hard redirect to force fresh session
      window.location.href = "/coach-dashboard";
    } catch {
      setError(t("common.error"));
      setLoading(false);
    }
  };

  const submitOwner = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venue: {
            name: venueForm.name.trim(),
            nameAr: venueForm.nameAr.trim() || undefined,
            address: venueForm.address.trim(),
            addressAr: venueForm.addressAr.trim() || undefined,
            city: venueForm.city.trim(),
            cityAr: venueForm.cityAr.trim() || undefined,
            latitude: venueForm.latitude,
            longitude: venueForm.longitude,
            phone: venueForm.phone.replace(/\D/g, ""),
            whatsapp: venueForm.whatsapp.replace(/\D/g, "") || undefined,
          },
          court: {
            name: courtForm.name.trim(),
            nameAr: courtForm.nameAr.trim() || undefined,
            pricePerHour: Number(courtForm.pricePerHour),
          },
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.message || t("common.error"));
        setLoading(false);
        return;
      }
      // Hard redirect to force fresh session
      window.location.href = "/dashboard";
    } catch {
      setError(t("common.error"));
      setLoading(false);
    }
  };

  // ─── Can proceed? ───

  const canProceed = (): boolean => {
    if (role === "PLAYER") {
      if (step === 0) return !!playerForm.area;
      return true;
    }
    if (role === "COACH") {
      if (step === 0) return coachForm.areas.length > 0;
      return true; // step 1 is optional, step 2 is preview
    }
    if (role === "VENUE_OWNER") {
      if (step === 0) return !!(venueForm.name.trim() && venueForm.address.trim() && venueForm.city.trim());
      if (step === 1) return !!venueForm.phone.trim();
      if (step === 2) return !!(courtForm.name.trim() && courtForm.pricePerHour);
    }
    return false;
  };

  // ─── Is final step? ───

  const isFinalStep = step === totalSteps - 1;

  const handleFinalAction = () => {
    if (role === "PLAYER") submitPlayer();
    else if (role === "COACH") submitCoach();
    else submitOwner();
  };

  // ─── Step transition variants ───

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const NextIcon = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0d0d0d]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size={28} variant="full" colorMode="dark" />
        </div>

        {/* Progress indicator */}
        <div className="flex flex-col items-center mb-6">
          <p className="text-xs text-[#666] mb-3">
            {t("onboarding.step", { current: step + 1, total: totalSteps })}
          </p>
          <div className="flex items-center gap-2" dir="ltr">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: i === step ? 1.2 : 1,
                  backgroundColor:
                    i < step
                      ? "rgb(16 185 129)" // emerald-500, completed
                      : i === step
                        ? "rgb(52 211 153)" // emerald-400, current
                        : "rgba(255, 255, 255, 0.15)", // upcoming
                }}
                transition={{ duration: 0.3 }}
                className="h-2 w-2 rounded-sm"
              />
            ))}
          </div>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-2 rounded-sm bg-[#ff4d4d]/100/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
            >
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-400/60 hover:text-red-400 transition-colors"
                aria-label={t("common.close")}
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step content */}
        <div className="flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${role}-${step}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {role === "PLAYER" && (
                <PlayerStep
                  step={step}
                  form={playerForm}
                  setForm={setPlayerForm}
                  userName={user.name || ""}
                />
              )}
              {role === "COACH" && (
                <CoachStep
                  step={step}
                  form={coachForm}
                  setForm={setCoachForm}
                  userName={user.name || ""}
                />
              )}
              {role === "VENUE_OWNER" && (
                <OwnerStep
                  step={step}
                  venueForm={venueForm}
                  setVenueForm={setVenueForm}
                  courtForm={courtForm}
                  setCourtForm={setCourtForm}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={goBack}
              className="flex items-center gap-1.5 rounded-sm px-5 py-3 text-sm text-[#999] transition-colors hover:text-white"
            >
              <BackIcon size={16} />
              <span>{t("onboarding.back")}</span>
            </motion.button>
          ) : (
            <div />
          )}

          {isFinalStep ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleFinalAction}
              disabled={loading || !canProceed()}
              className="flex items-center gap-2 rounded-sm bg-[#d4ff00] text-[#d4ff00] px-8 py-3 text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span>
                    {role === "PLAYER"
                      ? t("onboarding.goToProfile")
                      : t("onboarding.completeSetup")}
                  </span>
                  <CheckCircle size={16} />
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={goNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 rounded-sm bg-[#d4ff00] text-[#d4ff00] px-8 py-3 text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{t("onboarding.next")}</span>
              <NextIcon size={16} />
            </motion.button>
          )}
        </div>

        {/* Coach step 1: Skip option */}
        {role === "COACH" && step === 1 && !isFinalStep && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={goNext}
            className="mt-3 text-center text-xs text-[#666] transition-colors hover:text-[#999]"
          >
            {t("onboarding.skip")}
          </motion.button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PLAYER STEPS
// ═══════════════════════════════════════════

function PlayerStep({
  step,
  form,
  setForm,
  userName,
}: {
  step: number;
  form: PlayerForm;
  setForm: React.Dispatch<React.SetStateAction<PlayerForm>>;
  userName: string;
}) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  if (step === 0) {
    return (
      <div className="glass-dark rounded-sm p-6">
        <h2 className="text-xl font-bold text-white mb-1">
          {t("onboarding.whereDoYouPlay")}
        </h2>
        <p className="text-sm text-[#999] mb-5">
          {t("onboarding.selectYourArea")}
        </p>
        <DarkAreaSelector
          mode="single"
          selected={form.area}
          onChange={(val) => setForm({ area: val as string })}
        />
      </div>
    );
  }

  // Step 1: Welcome
  const areas = AREAS.filter((a) => a.key !== "all");
  const selectedArea = areas.find((a) => a.key === form.area);
  const areaLabel = selectedArea
    ? locale === "ar"
      ? selectedArea.labelAr
      : selectedArea.labelEn
    : "";

  return (
    <div className="flex flex-col items-center text-center py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-sm bg-[#d4ff00]/10 border-2 border-emerald-500"
      >
        <PartyPopper size={36} className="text-[#d4ff00]" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-2"
      >
        {t("onboarding.welcomePlayer")}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-[#999] mb-8"
      >
        {t("onboarding.welcomePlayerDesc")}
      </motion.p>

      {/* Player info card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-dark rounded-sm p-5 w-full max-w-xs"
      >
        <div className="flex flex-col items-center gap-3">
          {/* Avatar placeholder */}
          <div className="h-14 w-14 rounded-sm bg-[#d4ff00] text-[#d4ff00] flex items-center justify-center text-white font-bold text-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-bold text-white">{userName}</p>
            {areaLabel && (
              <p className="text-xs text-[#666] mt-0.5">{areaLabel}</p>
            )}
          </div>
          {/* Bronze tier badge */}
          <div className="flex items-center gap-1.5 rounded-sm bg-[#cd7f32]/15 border border-[#cd7f32]/30 px-3 py-1">
            <div className="h-2 w-2 rounded-sm bg-[#cd7f32]" />
            <span className="text-xs font-semibold text-[#cd7f32]">
              {t("player.bronze")}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════
// COACH STEPS
// ═══════════════════════════════════════════

function CoachStep({
  step,
  form,
  setForm,
  userName,
}: {
  step: number;
  form: CoachForm;
  setForm: React.Dispatch<React.SetStateAction<CoachForm>>;
  userName: string;
}) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  if (step === 0) {
    return (
      <div className="glass-dark rounded-sm p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            {t("onboarding.whereDoYouCoach")}
          </h2>
          <p className="text-sm text-[#999] mb-5">
            {t("onboarding.selectCoachAreas")}
          </p>
          <DarkAreaSelector
            mode="multi"
            selected={form.areas}
            onChange={(val) => setForm((prev) => ({ ...prev, areas: val as string[] }))}
          />
        </div>

        {/* WhatsApp field */}
        <div>
          <label className={labelClasses}>
            <span className="flex items-center gap-2">
              <MessageCircle size={14} className="text-[#666]" />
              {t("onboarding.whatsappNumber")}
            </span>
          </label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
            placeholder="01XXXXXXXXX"
            dir="ltr"
            inputMode="tel"
            className={inputClasses}
          />
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="glass-dark rounded-sm p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            {t("onboarding.yourDetails")}
          </h2>
          <p className="text-sm text-[#666]">
            {t("common.optional")}
          </p>
        </div>

        {/* Price per hour */}
        <div>
          <label className={labelClasses}>{t("onboarding.pricePerHour")}</label>
          <div className="relative">
            <input
              type="number"
              value={form.pricePerHour}
              onChange={(e) => setForm((prev) => ({ ...prev, pricePerHour: e.target.value }))}
              placeholder="500"
              dir="ltr"
              inputMode="numeric"
              min={0}
              className={`${inputClasses} pe-16`}
            />
            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm text-[#666] pointer-events-none select-none">
              EGP
            </span>
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className={labelClasses}>{t("onboarding.experience")}</label>
          <input
            type="text"
            value={form.experience}
            onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))}
            placeholder={t("onboarding.experiencePlaceholder")}
            className={inputClasses}
          />
        </div>

        {/* Bio */}
        <div>
          <label className={labelClasses}>{t("onboarding.bio")}</label>
          <textarea
            value={form.bio}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setForm((prev) => ({ ...prev, bio: e.target.value }));
              }
            }}
            placeholder={t("onboarding.bioPlaceholder")}
            rows={4}
            className={`${inputClasses} resize-none`}
          />
          <p className="mt-1 text-end text-xs text-white/20">
            {form.bio.length}/500
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Preview
  const areas = AREAS.filter((a) => a.key !== "all");
  const selectedAreas = areas.filter((a) => form.areas.includes(a.key));

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white mb-1">
          {t("onboarding.previewListing")}
        </h2>
      </div>

      {/* Preview card */}
      <div className="glass-dark rounded-sm p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="h-14 w-14 shrink-0 rounded-sm bg-[#d4ff00] text-[#d4ff00] flex items-center justify-center text-white font-bold text-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white truncate">{userName}</p>

            {/* Areas as pills */}
            {selectedAreas.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedAreas.map((area) => (
                  <span
                    key={area.key}
                    className="inline-flex items-center gap-1 rounded-sm bg-[#d4ff00]/10 border border-[#d4ff00]/20 px-2.5 py-0.5 text-xs text-[#d4ff00]"
                  >
                    <MapPin size={10} />
                    {locale === "ar" ? area.labelAr : area.labelEn}
                  </span>
                ))}
              </div>
            )}

            {/* Price */}
            {form.pricePerHour && (
              <p className="mt-2 text-sm text-[#999]">
                {form.pricePerHour} {t("common.egp")} {t("common.perHour")}
              </p>
            )}

            {/* Bio snippet */}
            {form.bio.trim() && (
              <p className="mt-2 text-xs text-[#666] line-clamp-2">
                {form.bio.trim()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// OWNER STEPS
// ═══════════════════════════════════════════

function OwnerStep({
  step,
  venueForm,
  setVenueForm,
  courtForm,
  setCourtForm,
}: {
  step: number;
  venueForm: OwnerVenueForm;
  setVenueForm: React.Dispatch<React.SetStateAction<OwnerVenueForm>>;
  courtForm: OwnerCourtForm;
  setCourtForm: React.Dispatch<React.SetStateAction<OwnerCourtForm>>;
}) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedAreaName, setDetectedAreaName] = useState("");
  const [showArabic, setShowArabic] = useState(false);
  const [showCourtArabic, setShowCourtArabic] = useState(false);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            // Find nearest area using haversine
            let minDist = Infinity;
            let nearest: (typeof AREAS)[number] = AREAS[1]; // default to first real area
            for (const area of AREAS) {
              if (area.key === "all") continue;
              const R = 6371;
              const dLat = ((area.lat - latitude) * Math.PI) / 180;
              const dLng = ((area.lng - longitude) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos((latitude * Math.PI) / 180) *
                  Math.cos((area.lat * Math.PI) / 180) *
                  Math.sin(dLng / 2) ** 2;
              const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              if (dist < minDist) {
                minDist = dist;
                nearest = area;
              }
            }

            setVenueForm((prev) => ({
              ...prev,
              latitude,
              longitude,
              city: nearest.labelEn,
              cityAr: nearest.labelAr,
            }));
            setDetectedAreaName(
              locale === "ar" ? nearest.labelAr : nearest.labelEn
            );
            setDetectingLocation(false);
          },
          () => {
            setDetectingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      } else {
        setDetectingLocation(false);
      }
    } catch {
      setDetectingLocation(false);
    }
  };

  // Auto-expand Arabic section if Arabic fields already have data
  useEffect(() => {
    if (venueForm.nameAr || venueForm.addressAr || venueForm.cityAr) {
      setShowArabic(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (courtForm.nameAr) {
      setShowCourtArabic(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (step === 0) {
    return (
      <div className="glass-dark rounded-sm p-6 space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            {t("onboarding.venueInfo")}
          </h2>
          <p className="text-sm text-[#666]">
            {t("onboarding.venueInfoSubtitle")}
          </p>
        </div>

        {/* Venue Name */}
        <div>
          <label className={labelClasses}>
            <span className="flex items-center gap-2">
              <Building2 size={14} className="text-[#d4ff00]/60" />
              {t("onboarding.venueName")}
              <span className="text-[#d4ff00] text-[10px]">●</span>
            </span>
          </label>
          <input
            type="text"
            value={venueForm.name}
            onChange={(e) =>
              setVenueForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder={t("onboarding.venueNamePlaceholder")}
            className={inputClasses}
          />
        </div>

        {/* Address */}
        <div>
          <label className={labelClasses}>
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-[#d4ff00]/60" />
              {t("onboarding.venueAddress")}
              <span className="text-[#d4ff00] text-[10px]">●</span>
            </span>
          </label>
          <input
            type="text"
            value={venueForm.address}
            onChange={(e) =>
              setVenueForm((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder={t("onboarding.venueAddressPlaceholder")}
            className={inputClasses}
          />
        </div>

        {/* City */}
        <div>
          <label className={labelClasses}>
            <span className="flex items-center gap-2">
              <Globe size={14} className="text-[#d4ff00]/60" />
              {t("onboarding.venueCity")}
              <span className="text-[#d4ff00] text-[10px]">●</span>
            </span>
          </label>
          <input
            type="text"
            value={venueForm.city}
            onChange={(e) =>
              setVenueForm((prev) => ({ ...prev, city: e.target.value }))
            }
            placeholder={t("onboarding.venueCityPlaceholder")}
            className={inputClasses}
          />
        </div>

        {/* Arabic toggle + collapsible section */}
        <div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowArabic((prev) => !prev)}
            className="flex items-center gap-2 text-sm text-[#666] transition-colors hover:text-[#999]"
          >
            {showArabic ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
            <span>
              {showArabic
                ? t("onboarding.hideArabicNames")
                : t("onboarding.addArabicNames")}
            </span>
          </motion.button>

          <AnimatePresence>
            {showArabic && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 border-s-2 border-[#d4ff00]/20 ps-4 space-y-4">
                  {/* Name Arabic */}
                  <div>
                    <label className={labelClasses}>
                      {t("onboarding.venueNameAr")}
                    </label>
                    <input
                      type="text"
                      value={venueForm.nameAr}
                      onChange={(e) =>
                        setVenueForm((prev) => ({
                          ...prev,
                          nameAr: e.target.value,
                        }))
                      }
                      dir="rtl"
                      placeholder={t("onboarding.venueNameArPlaceholder")}
                      className={inputClasses}
                    />
                  </div>

                  {/* Address Arabic */}
                  <div>
                    <label className={labelClasses}>
                      {t("onboarding.venueAddressAr")}
                    </label>
                    <input
                      type="text"
                      value={venueForm.addressAr}
                      onChange={(e) =>
                        setVenueForm((prev) => ({
                          ...prev,
                          addressAr: e.target.value,
                        }))
                      }
                      dir="rtl"
                      placeholder={t("onboarding.venueAddressArPlaceholder")}
                      className={inputClasses}
                    />
                  </div>

                  {/* City Arabic */}
                  <div>
                    <label className={labelClasses}>
                      {t("onboarding.venueCityAr")}
                    </label>
                    <input
                      type="text"
                      value={venueForm.cityAr}
                      onChange={(e) =>
                        setVenueForm((prev) => ({
                          ...prev,
                          cityAr: e.target.value,
                        }))
                      }
                      dir="rtl"
                      placeholder={t("onboarding.venueCityArPlaceholder")}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detect location — full width, prominent */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={handleDetectLocation}
          disabled={detectingLocation}
          className="w-full flex items-center justify-center gap-3 rounded-sm border border-[#d4ff00]/20 bg-[#d4ff00]/5 px-4 py-4 text-sm transition-all hover:bg-[#d4ff00]/10 hover:border-[#d4ff00] disabled:opacity-50"
        >
          {detectingLocation ? (
            <>
              <Loader2 size={16} className="animate-spin text-[#d4ff00]" />
              <span className="text-[#999]">
                {t("onboarding.detectingLocation")}
              </span>
            </>
          ) : venueForm.latitude !== null ? (
            <>
              <CheckCircle size={16} className="text-[#d4ff00]" />
              <span className="text-[#d4ff00]">
                {t("onboarding.locationDetected")}
                {detectedAreaName && ` — ${detectedAreaName}`}
              </span>
            </>
          ) : (
            <>
              <MapPin size={16} className="text-[#d4ff00]" />
              <span className="text-[#d4ff00]">
                {t("onboarding.detectLocation")}
              </span>
            </>
          )}
        </motion.button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="glass-dark rounded-sm p-6 space-y-5">
        <h2 className="text-xl font-bold text-white mb-1">
          {t("onboarding.contactInfo")}
        </h2>

        {/* Phone */}
        <div>
          <label className={labelClasses}>
            <span className="flex items-center gap-2">
              <Phone size={14} className="text-[#d4ff00]/60" />
              {t("onboarding.venuePhone")}
              <span className="text-[#d4ff00] text-[10px]">●</span>
            </span>
          </label>
          <input
            type="tel"
            value={venueForm.phone}
            onChange={(e) =>
              setVenueForm((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="01XXXXXXXXX"
            dir="ltr"
            inputMode="tel"
            className={inputClasses}
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className={labelClasses}>
            <span className="flex items-center gap-2">
              <MessageCircle size={14} className="text-[#d4ff00]/60" />
              {t("onboarding.venueWhatsApp")}
              <span className="text-white/20 text-xs font-normal ms-1">
                ({t("common.optional")})
              </span>
            </span>
          </label>
          <input
            type="tel"
            value={venueForm.whatsapp}
            onChange={(e) =>
              setVenueForm((prev) => ({ ...prev, whatsapp: e.target.value }))
            }
            placeholder="01XXXXXXXXX"
            dir="ltr"
            inputMode="tel"
            className={inputClasses}
          />
        </div>
      </div>
    );
  }

  // Step 2: First court — single-column with collapsible Arabic
  return (
    <div className="glass-dark rounded-sm p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">
          {t("onboarding.firstCourt")}
        </h2>
        <p className="text-sm text-[#666]">
          {t("onboarding.firstCourtSubtitle")}
        </p>
      </div>

      {/* Court name */}
      <div>
        <label className={labelClasses}>
          <span className="flex items-center gap-2">
            {t("onboarding.courtName")}
            <span className="text-[#d4ff00] text-[10px]">●</span>
          </span>
        </label>
        <input
          type="text"
          value={courtForm.name}
          onChange={(e) =>
            setCourtForm((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder={t("onboarding.courtNamePlaceholder")}
          className={inputClasses}
        />
      </div>

      {/* Arabic court name toggle */}
      <div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCourtArabic((prev) => !prev)}
          className="flex items-center gap-2 text-sm text-[#666] transition-colors hover:text-[#999]"
        >
          {showCourtArabic ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
          <span>
            {showCourtArabic
              ? t("onboarding.hideArabicNames")
              : t("onboarding.addArabicNames")}
          </span>
        </motion.button>

        <AnimatePresence>
          {showCourtArabic && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 border-s-2 border-[#d4ff00]/20 ps-4">
                <label className={labelClasses}>
                  {t("onboarding.courtNameAr")}
                </label>
                <input
                  type="text"
                  value={courtForm.nameAr}
                  onChange={(e) =>
                    setCourtForm((prev) => ({
                      ...prev,
                      nameAr: e.target.value,
                    }))
                  }
                  dir="rtl"
                  placeholder={t("onboarding.courtNameArPlaceholder")}
                  className={inputClasses}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price per hour */}
      <div>
        <label className={labelClasses}>
          <span className="flex items-center gap-2">
            {t("onboarding.courtPricePerHour")}
            <span className="text-[#d4ff00] text-[10px]">●</span>
          </span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={courtForm.pricePerHour}
            onChange={(e) =>
              setCourtForm((prev) => ({
                ...prev,
                pricePerHour: e.target.value,
              }))
            }
            placeholder="500"
            dir="ltr"
            inputMode="numeric"
            min={0}
            className={`${inputClasses} pe-16`}
          />
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm text-[#666] pointer-events-none select-none">
            EGP
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// DARK AREA SELECTOR (adapted for dark bg)
// ═══════════════════════════════════════════

function DarkAreaSelector({
  mode,
  selected,
  onChange,
}: {
  mode: "single" | "multi";
  selected: string | string[];
  onChange: (value: string | string[]) => void;
}) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [detecting, setDetecting] = useState(false);

  const selectableAreas = AREAS.filter((a) => a.key !== "all");

  const isSelected = (key: string): boolean => {
    if (mode === "single") return selected === key;
    return Array.isArray(selected) && selected.includes(key);
  };

  const handleSelect = (key: string) => {
    if (mode === "single") {
      onChange(selected === key ? "" : key);
    } else {
      const current = Array.isArray(selected) ? selected : [];
      if (current.includes(key)) {
        onChange(current.filter((k) => k !== key));
      } else {
        onChange([...current, key]);
      }
    }
  };

  const handleDetect = async () => {
    setDetecting(true);
    try {
      const areaKey = await getNearestArea();
      if (areaKey) {
        if (mode === "single") {
          onChange(areaKey);
        } else {
          const current = Array.isArray(selected) ? selected : [];
          if (!current.includes(areaKey)) {
            onChange([...current, areaKey]);
          }
        }
      }
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* Detect button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={handleDetect}
          disabled={detecting}
          className="flex items-center justify-center gap-1.5 rounded-sm border border-dashed border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-xs text-[#999] transition-all hover:border-white/25 hover:text-[#999] disabled:opacity-50"
        >
          {detecting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>{t("location.detecting")}</span>
            </>
          ) : (
            <>
              <MapPin size={14} />
              <span>{t("location.detectLocation")}</span>
            </>
          )}
        </motion.button>

        {/* Area buttons */}
        {selectableAreas.map((area) => {
          const active = isSelected(area.key);
          return (
            <motion.button
              key={area.key}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(area.key)}
              className={`rounded-sm px-3 py-2.5 text-xs transition-all ${
                active
                  ? "border-2 border-emerald-500 bg-[#d4ff00]/10 text-[#d4ff00] font-medium"
                  : "border border-[#333] bg-[#1a1a1a] text-[#999] hover:border-[#333] hover:text-[#999]"
              }`}
            >
              {locale === "ar" ? area.labelAr : area.labelEn}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
