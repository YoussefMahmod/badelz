"use client";

import { useState, useEffect, useCallback } from "react";
import { track } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  MapPin,
  CheckCircle,
  Loader2,
  Share2,
  Link2,
  ArrowUpRight,
  Zap,
  Footprints,
  Briefcase,
  Circle,
  Shirt,
  Watch,
  ShoppingBag,
  User,
  Package,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/main-layout";
import { PhotoUpload } from "@/components/photo-upload";
import { useTranslation, useLocale } from "@/i18n";
import { useAuth } from "@/lib/auth-context";
import { AREAS, LISTING_CATEGORY_COLORS } from "@/lib/constants";
import { buildListingShareLink } from "@/lib/whatsapp";

interface FormData {
  category: string;
  title: string;
  description: string;
  price: string;
  condition: string;
  photos: string[];
  area: string;
  sellerName: string;
  phone: string;
}
interface FormErrors {
  category?: string;
  title?: string;
  price?: string;
  condition?: string;
  area?: string;
  sellerName?: string;
  phone?: string;
  server?: string;
}

const EMPTY: FormData = {
  category: "",
  title: "",
  description: "",
  price: "",
  condition: "",
  photos: [],
  area: "",
  sellerName: "",
  phone: "",
};

const CATS = [
  { key: "RACKETS", lk: "market.rackets" as const, Icon: Zap },
  { key: "SHOES", lk: "market.shoes" as const, Icon: Footprints },
  { key: "BAGS", lk: "market.bags" as const, Icon: Briefcase },
  { key: "BALLS", lk: "market.balls" as const, Icon: Circle },
  { key: "APPAREL", lk: "market.apparel" as const, Icon: Shirt },
  { key: "ACCESSORIES", lk: "market.accessories" as const, Icon: Watch },
  { key: "OTHER", lk: "market.other" as const, Icon: Package },
] as const;

const CONDS = [
  {
    key: "NEW",
    lk: "market.new" as const,
    descKey: "market.newDesc" as const,
    color: "#10b981",
  },
  {
    key: "LIKE_NEW",
    lk: "market.likeNew" as const,
    descKey: "market.likeNewDesc" as const,
    color: "#84cc16",
  },
  {
    key: "USED",
    lk: "market.used" as const,
    descKey: "market.usedDesc" as const,
    color: "#f59e0b",
  },
  {
    key: "WELL_USED",
    lk: "market.wellUsed" as const,
    descKey: "market.wellUsedDesc" as const,
    color: "#ef4444",
  },
] as const;

const INPUT =
  "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all";
const ERR = "text-xs text-red-400 mt-1";

const TOTAL_STEPS = 4;

// Direction-aware step animations
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.98,
  }),
};

const stepTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1] as const,
};

// Confetti particle component
function ConfettiParticle({
  delay,
  x,
  y,
  color,
  size,
}: {
  delay: number;
  x: number;
  y: number;
  color: string;
  size: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: "50%",
        top: "50%",
      }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        x: x,
        y: y,
        scale: [1, 1.2, 0.5],
      }}
      transition={{
        duration: 1.2,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

export default function SellPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [success, setSuccess] = useState<{
    id: string;
    title: string;
    price: number;
    area: string;
  } | null>(null);

  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const areaOpts = AREAS.filter((a) => a.key !== "all");

  const set = (patch: Partial<FormData>) =>
    setForm((p) => ({ ...p, ...patch }));
  const clr = (key: keyof FormErrors) =>
    setErrors((p) => ({ ...p, [key]: undefined }));

  // Auto-fill seller info when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm((prev) => ({
        ...prev,
        sellerName: user.name ?? prev.sellerName,
        phone: user.phone ?? prev.phone,
      }));
    }
  }, [isAuthenticated, user]);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const validateStep = (s: number): boolean => {
    const e: FormErrors = {};
    if (s === 0 && !form.category) {
      e.category = t("common.required");
    }
    if (s === 1) {
      if (!form.title.trim()) e.title = t("common.required");
      if (!form.area) e.area = t("common.required");
    }
    if (s === 2) {
      if (!form.price || Number(form.price) <= 0) e.price = t("common.required");
      if (!form.condition) e.condition = t("common.required");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      goNext();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setSubmitting(true);
    setErrors({});
    try {
      const body = {
        category: form.category,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        condition: form.condition,
        photos: form.photos.length ? form.photos : undefined,
        area: form.area,
        sellerName:
          isAuthenticated && user?.name ? user.name : form.sellerName.trim(),
        sellerPhone:
          isAuthenticated && user?.phone
            ? user.phone
            : form.phone.replace(/\D/g, ""),
      };
      const res = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors({ server: json.message || t("common.error") });
        return;
      }
      track.listingCreated({ category: form.category, price: Number(form.price) });
      setSuccess({
        id: json.data?.id,
        title: form.title.trim(),
        price: Number(form.price),
        area: form.area,
      });
    } catch {
      setErrors({ server: t("common.error") });
    } finally {
      setSubmitting(false);
    }
  };

  const accentColor = form.category
    ? LISTING_CATEGORY_COLORS[form.category] ?? "#10b981"
    : "#10b981";

  // Loading state
  if (isLoading) {
    return (
      <MainLayout showNav={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
        </div>
      </MainLayout>
    );
  }

  // Auth gate: show interstitial if not authenticated
  if (!isAuthenticated) {
    return (
      <MainLayout showNav={false}>
        <div className="mx-auto max-w-lg px-4 py-6">
          <motion.button
            initial={{ opacity: 0, x: locale === "ar" ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <BackIcon size={18} />
            <span className="text-sm">{t("common.back")}</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ShoppingBag size={36} className="text-emerald-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3 font-[family-name:var(--font-display)] uppercase tracking-tight">
              {t("auth.signUpToSell")}
            </h2>
            <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-xs mx-auto">
              {t("auth.signUpToSellDesc")}
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/register?returnTo=/market/sell"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.98]"
              >
                {t("market.createFreeAccount")}
                <ArrowUpRight size={18} />
              </Link>

              <Link
                href="/login?returnTo=/market/sell"
                className="py-3 text-sm text-white/50 hover:text-white transition-colors"
              >
                {t("auth.alreadyHaveAccount")}{" "}
                <span className="text-emerald-400 font-semibold">
                  {t("auth.signIn")}
                </span>
              </Link>

              <Link
                href="/market"
                className="py-2 text-sm text-white/30 hover:text-white/50 transition-colors flex items-center justify-center gap-1"
              >
                {t("auth.browseMarket")}
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  // Confetti colors
  const confettiColors = ["#10b981", "#14b8a6", "#34d399", "#6ee7b7", "#a7f3d0"];
  const confettiParticles = Array.from({ length: 20 }, (_, i) => ({
    delay: Math.random() * 0.3,
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 200 - 50,
    color: confettiColors[i % confettiColors.length],
    size: Math.random() * 6 + 4,
  }));

  // Authenticated: show the wizard
  return (
    <MainLayout showNav={false}>
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: locale === "ar" ? 10 : -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => {
            if (success) {
              router.push("/market");
              return;
            }
            if (step > 0) {
              goBack();
            } else {
              router.back();
            }
          }}
          className="flex items-center gap-1.5 text-white/60 hover:text-white mb-4 transition-colors"
        >
          <BackIcon size={18} />
          <span className="text-sm">{t("common.back")}</span>
        </motion.button>

        <AnimatePresence mode="wait">
          {success ? (
            /* ─── Success Screen ─── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center py-8"
            >
              {/* Confetti */}
              <div className="relative mb-6">
                {confettiParticles.map((p, i) => (
                  <ConfettiParticle key={i} {...p} />
                ))}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500"
                >
                  <CheckCircle size={36} className="text-emerald-500" />
                </motion.div>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white mb-2 font-[family-name:var(--font-display)] uppercase"
              >
                {t("market.listedSuccess")}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-white/50 mb-6"
              >
                {t("market.createListing")}
              </motion.p>

              {/* Preview card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden mb-6"
              >
                {form.photos.length > 0 && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={form.photos[0]}
                      alt={form.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm font-bold text-white/90">
                    {form.title}
                  </p>
                  <p
                    className="text-lg font-bold mt-1"
                    style={{ color: accentColor }}
                  >
                    {Number(form.price).toLocaleString()}{" "}
                    <span className="text-xs text-white/30">
                      {t("common.egp")}
                    </span>
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="flex flex-col gap-3 w-full"
              >
                <Link
                  href={`/market/${success.id}`}
                  className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20"
                >
                  <Link2 size={16} />
                  {t("market.viewListing")}
                </Link>
                <button
                  onClick={() => {
                    const l = buildListingShareLink(success);
                    window.open(l, "_blank");
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border border-white/10 py-3 text-sm font-medium text-white/60 hover:bg-white/5"
                >
                  <Share2 size={16} />
                  {t("market.shareOnWhatsApp")}
                </button>
                <button
                  onClick={() => {
                    setSuccess(null);
                    setForm(EMPTY);
                    setStep(0);
                    setErrors({});
                  }}
                  className="py-3 text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  {t("market.listAnother")}
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Progress bar */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i <= step ? "bg-emerald-500" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Server error */}
              {errors.server && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-4">
                  {errors.server}
                </div>
              )}

              {/* Step content */}
              <AnimatePresence mode="wait" custom={direction}>
                {/* ─── Step 0: Choose Category ─── */}
                {step === 0 && (
                  <motion.div
                    key="step-0"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={stepTransition}
                  >
                    <h1 className="text-2xl font-bold text-white mb-1 font-[family-name:var(--font-display)] uppercase tracking-tight">
                      {t("market.whatAreYouSelling")}
                    </h1>
                    <p className="text-sm text-white/40 mb-6">
                      {t("market.tagline")}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {CATS.map((c) => {
                        const on = form.category === c.key;
                        const col =
                          LISTING_CATEGORY_COLORS[
                            c.key as keyof typeof LISTING_CATEGORY_COLORS
                          ] ?? "#9ca3af";
                        return (
                          <motion.button
                            key={c.key}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              set({ category: c.key });
                              clr("category");
                              // Auto-advance to step 1
                              setTimeout(() => {
                                setDirection(1);
                                setStep(1);
                              }, 200);
                            }}
                            className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all ${
                              on
                                ? "border-2"
                                : "bg-white/5 border border-white/10 hover:bg-white/8"
                            }`}
                            style={
                              on
                                ? {
                                    borderColor: col,
                                    backgroundColor: `${col}12`,
                                    boxShadow: `0 0 30px ${col}15`,
                                  }
                                : {}
                            }
                          >
                            <c.Icon
                              size={32}
                              style={{ color: col }}
                              className={on ? "" : "opacity-50"}
                            />
                            <span
                              className="text-sm font-bold"
                              style={{ color: on ? col : `${col}80` }}
                            >
                              {t(c.lk)}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                    {errors.category && (
                      <p className={ERR}>{errors.category}</p>
                    )}
                  </motion.div>
                )}

                {/* ─── Step 1: Photos + Details ─── */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={stepTransition}
                    className="space-y-6"
                  >
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1 font-[family-name:var(--font-display)] uppercase tracking-tight">
                        {t("market.addDetails")}
                      </h1>
                      <p className="text-sm text-white/40 mb-6">
                        {t("market.details")}
                      </p>
                    </div>

                    {/* Photos */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/30 font-[family-name:var(--font-display)] mb-2">
                        {t("market.showcaseGear")}
                      </label>
                      <PhotoUpload
                        photos={form.photos}
                        onChange={(photos) => set({ photos })}
                        max={5}
                      />
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/30 font-[family-name:var(--font-display)] mb-1.5">
                        {locale === "ar" ? "العنوان" : "Title"}{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => {
                          set({ title: e.target.value });
                          clr("title");
                        }}
                        placeholder={
                          locale === "ar"
                            ? "مثلاً: مضرب Babolat Viper"
                            : "e.g., Babolat Viper Racket"
                        }
                        className={INPUT}
                      />
                      {errors.title && <p className={ERR}>{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/30 font-[family-name:var(--font-display)] mb-1.5">
                        {t("market.description")}{" "}
                        <span className="text-white/15">
                          ({t("common.optional")})
                        </span>
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => set({ description: e.target.value })}
                        placeholder={
                          locale === "ar"
                            ? "اوصف المنتج بالتفصيل..."
                            : "Describe your item..."
                        }
                        rows={3}
                        maxLength={1000}
                        className={`${INPUT} resize-none`}
                      />
                      <p
                        className={`text-xs text-end mt-1 ${
                          form.description.length >= 1000
                            ? "text-red-400"
                            : form.description.length >= 900
                              ? "text-yellow-400"
                              : "text-white/15"
                        }`}
                      >
                        {form.description.length}/1000
                      </p>
                    </div>

                    {/* Area */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/30 font-[family-name:var(--font-display)] mb-2">
                        {t("market.location")}{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {areaOpts.map((a) => (
                          <button
                            key={a.key}
                            type="button"
                            onClick={() => {
                              set({ area: a.key });
                              clr("area");
                            }}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-all ${
                              form.area === a.key
                                ? "bg-emerald-500 text-white"
                                : "border border-white/10 text-white/50 hover:bg-white/10"
                            }`}
                          >
                            <MapPin size={11} />
                            {locale === "ar" ? a.labelAr : a.labelEn}
                          </button>
                        ))}
                      </div>
                      {errors.area && <p className={ERR}>{errors.area}</p>}
                    </div>

                    {/* Next button */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNext}
                      className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.98]"
                    >
                      {t("common.next")}
                    </motion.button>
                  </motion.div>
                )}

                {/* ─── Step 2: Price + Condition ─── */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={stepTransition}
                    className="space-y-8"
                  >
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1 font-[family-name:var(--font-display)] uppercase tracking-tight">
                        {t("market.setYourPrice")}
                      </h1>
                    </div>

                    {/* Price input - prominent center */}
                    <div className="text-center py-4">
                      {form.price && Number(form.price) > 0 ? (
                        <p className="text-4xl font-extrabold font-[family-name:var(--font-display)] text-emerald-500 mb-1">
                          {Number(form.price).toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-4xl font-extrabold font-[family-name:var(--font-display)] text-white/10 mb-1">
                          0
                        </p>
                      )}
                      <p className="text-sm text-white/30">{t("common.egp")}</p>
                      <div className="relative max-w-[200px] mx-auto mt-4">
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) => {
                            set({ price: e.target.value });
                            clr("price");
                          }}
                          placeholder="2500"
                          dir="ltr"
                          inputMode="numeric"
                          min={0}
                          className={`${INPUT} text-center text-lg font-bold`}
                        />
                      </div>
                      {errors.price && <p className={ERR}>{errors.price}</p>}
                    </div>

                    {/* Condition cards */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-white/30 font-[family-name:var(--font-display)] mb-3">
                        {t("market.condition")}{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {CONDS.map((c) => {
                          const isActive = form.condition === c.key;
                          return (
                            <motion.button
                              key={c.key}
                              type="button"
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                set({ condition: c.key });
                                clr("condition");
                              }}
                              className={`rounded-xl p-4 text-start transition-all ${
                                isActive
                                  ? "border-2 border-emerald-500 bg-emerald-500/10"
                                  : "bg-white/5 border border-white/10 hover:bg-white/8"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span
                                  className={`text-sm font-bold ${
                                    isActive ? "text-emerald-400" : "text-white/70"
                                  }`}
                                >
                                  {t(c.lk)}
                                </span>
                                {isActive && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                                  >
                                    <Check size={12} className="text-white" />
                                  </motion.div>
                                )}
                              </div>
                              <p
                                className={`text-[11px] leading-snug ${
                                  isActive ? "text-white/50" : "text-white/25"
                                }`}
                              >
                                {t(c.descKey)}
                              </p>
                            </motion.button>
                          );
                        })}
                      </div>
                      {errors.condition && (
                        <p className={ERR}>{errors.condition}</p>
                      )}
                    </div>

                    {/* Next button */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNext}
                      className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.98]"
                    >
                      {t("common.next")}
                    </motion.button>
                  </motion.div>
                )}

                {/* ─── Step 3: Review + Publish ─── */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={stepTransition}
                    className="space-y-6"
                  >
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1 font-[family-name:var(--font-display)] uppercase tracking-tight">
                        {t("market.readyToPublish")}
                      </h1>
                    </div>

                    {/* Preview card */}
                    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                      {/* Photo */}
                      {form.photos.length > 0 ? (
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <img
                            src={form.photos[0]}
                            alt={form.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          {form.photos.length > 1 && (
                            <span className="absolute bottom-2 end-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] text-white/80">
                              +{form.photos.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          className="aspect-[4/3] flex items-center justify-center"
                          style={{ backgroundColor: `${accentColor}08` }}
                        >
                          <Package
                            size={48}
                            style={{ color: accentColor }}
                            className="opacity-20"
                          />
                        </div>
                      )}

                      <div className="p-4 space-y-3">
                        {/* Pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {form.condition && (
                            <span className="bg-white/10 text-white/70 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium">
                              {t(
                                (CONDS.find((c) => c.key === form.condition)?.lk ??
                                  "market.used") as Parameters<typeof t>[0]
                              )}
                            </span>
                          )}
                          {form.category && (
                            <span
                              className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium"
                              style={{
                                backgroundColor: `${accentColor}15`,
                                color: accentColor,
                              }}
                            >
                              {t(
                                (CATS.find((c) => c.key === form.category)?.lk ??
                                  "market.other") as Parameters<typeof t>[0]
                              )}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <p className="text-lg font-bold text-white/90">
                          {form.title || "..."}
                        </p>

                        {/* Price */}
                        <p
                          className="text-xl font-bold"
                          style={{ color: accentColor }}
                        >
                          {form.price
                            ? Number(form.price).toLocaleString()
                            : "0"}{" "}
                          <span className="text-xs text-white/30">
                            {t("common.egp")}
                          </span>
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          {form.area && (
                            <span className="flex items-center gap-1">
                              <MapPin size={11} />
                              {locale === "ar"
                                ? areaOpts.find((a) => a.key === form.area)
                                    ?.labelAr ?? form.area
                                : areaOpts.find((a) => a.key === form.area)
                                    ?.labelEn ?? form.area}
                            </span>
                          )}
                        </div>

                        {/* Description preview */}
                        {form.description && (
                          <p className="text-xs text-white/40 line-clamp-2">
                            {form.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Logged-in badge */}
                    <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                        <User size={16} className="text-emerald-400" />
                      </div>
                      <span className="text-sm text-emerald-400 font-medium">
                        {t("market.loggedInAs", { name: user?.name ?? "" })}
                      </span>
                    </div>

                    {/* Publish CTA */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          {t("market.publish")}
                          <ArrowUpRight size={18} />
                        </>
                      )}
                    </motion.button>

                    {/* Back to edit link */}
                    <button
                      type="button"
                      onClick={goBack}
                      className="w-full py-2 text-sm text-white/40 hover:text-white/60 transition-colors text-center"
                    >
                      {t("common.back")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
