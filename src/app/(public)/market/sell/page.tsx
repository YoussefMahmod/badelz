"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/main-layout";
import { PhotoUpload } from "@/components/photo-upload";
import { useTranslation, useLocale } from "@/i18n";
import { useAuth } from "@/lib/auth-context";
import { AREAS, LISTING_CATEGORY_COLORS } from "@/lib/constants";
import { buildListingShareLink } from "@/lib/whatsapp";
import { scaleIn } from "@/lib/animations";

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
] as const;

const CONDS = [
  { key: "NEW", lk: "market.new" as const, descKey: "market.newDesc" as const, color: "#c8ff00" },
  { key: "LIKE_NEW", lk: "market.likeNew" as const, descKey: "market.likeNewDesc" as const, color: "#84cc16" },
  { key: "USED", lk: "market.used" as const, descKey: "market.usedDesc" as const, color: "#f59e0b" },
  { key: "WELL_USED", lk: "market.wellUsed" as const, descKey: "market.wellUsedDesc" as const, color: "#ef4444" },
] as const;

const INPUT =
  "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#c8ff00]/50 focus:ring-2 focus:ring-[#c8ff00]/20 transition-all";
const ERR = "text-xs text-red-400 mt-1";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-bold font-[family-name:var(--font-display)] uppercase tracking-wide text-white mb-3">
      {children}
    </h3>
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

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.category) e.category = t("common.required");
    if (!form.title.trim()) e.title = t("common.required");
    if (!form.price || Number(form.price) <= 0) e.price = t("common.required");
    if (!form.condition) e.condition = t("common.required");
    if (!form.area) e.area = t("common.required");
    // Only validate seller fields if not authenticated
    if (!isAuthenticated) {
      if (!form.sellerName.trim()) e.sellerName = t("common.required");
      const ph = form.phone.replace(/\D/g, "");
      if (!ph || ph.length !== 11 || !/^01[0125]/.test(ph))
        e.phone = t("common.required");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
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
        sellerName: isAuthenticated && user?.name ? user.name : form.sellerName.trim(),
        sellerPhone: isAuthenticated && user?.phone ? user.phone : form.phone.replace(/\D/g, ""),
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

  // Active condition index for scale visualization
  const activeCondIdx = CONDS.findIndex((c) => c.key === form.condition);

  // Loading state
  if (isLoading) {
    return (
      <MainLayout showNav={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-[#c8ff00]" />
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
                <span className="text-emerald-400 font-semibold">{t("auth.signIn")}</span>
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

  // Authenticated: show the form
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

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              {...scaleIn}
              className="flex flex-col items-center text-center py-12"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#c8ff00]/10 border-2 border-[#c8ff00]">
                <CheckCircle size={36} className="text-[#c8ff00]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 font-[family-name:var(--font-display)] uppercase">
                {t("common.success")}
              </h2>
              <p className="text-sm text-white/50 mb-8">
                {t("market.createListing")}
              </p>
              <div className="flex flex-col gap-3 w-full">
                <Link
                  href={`/market/${success.id}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#c8ff00] py-3.5 text-sm font-bold text-[#111827]"
                >
                  <Link2 size={16} />
                  {t("common.viewAll")}
                </Link>
                <button
                  onClick={() => {
                    const l = buildListingShareLink(success);
                    window.open(l, "_blank");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 hover:bg-white/5"
                >
                  <Share2 size={16} />
                  {t("market.shareListing")}
                </button>
                <Link
                  href="/market/mine"
                  className="py-3 text-sm text-white/40 hover:text-white/60"
                >
                  {t("market.viewMyListings")}
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Page header */}
              <h1 className="text-3xl font-extrabold font-[family-name:var(--font-display)] uppercase tracking-tight text-white mb-1">
                {t("market.listYourGear")}
              </h1>
              <p className="text-sm text-white/40 mb-8">
                {t("market.tagline")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* ─── CATEGORY ─── */}
                <div>
                  <SectionHeader>
                    {t("market.category")}{" "}
                    <span className="text-red-400 text-sm">*</span>
                  </SectionHeader>
                  <div className="grid grid-cols-2 gap-3">
                    {CATS.map((c) => {
                      const on = form.category === c.key;
                      const col =
                        LISTING_CATEGORY_COLORS[c.key as keyof typeof LISTING_CATEGORY_COLORS];
                      return (
                        <motion.button
                          key={c.key}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            set({ category: c.key });
                            clr("category");
                          }}
                          className={`h-24 flex flex-col items-center justify-center gap-2 rounded-xl transition-all ${
                            on
                              ? "border-2"
                              : "bg-white/5 border border-white/10 hover:bg-white/8"
                          }`}
                          style={
                            on
                              ? {
                                  borderColor: col,
                                  backgroundColor: `${col}12`,
                                  boxShadow: `0 0 20px ${col}20`,
                                }
                              : {}
                          }
                        >
                          <c.Icon
                            size={28}
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
                  {errors.category && <p className={ERR}>{errors.category}</p>}
                </div>

                {/* ─── DETAILS ─── */}
                <div className="space-y-5">
                  <SectionHeader>
                    {t("market.details")}{" "}
                  </SectionHeader>

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

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/30 font-[family-name:var(--font-display)] mb-1.5">
                      {t("market.price")}{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    {/* Live price preview */}
                    {form.price && Number(form.price) > 0 && (
                      <p className="text-3xl font-extrabold font-[family-name:var(--font-display)] text-[#c8ff00] mb-2">
                        {Number(form.price).toLocaleString()}{" "}
                        <span className="text-sm text-white/30 font-normal">
                          {t("common.egp")}
                        </span>
                      </p>
                    )}
                    <div className="relative">
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
                        className={`${INPUT} pe-14`}
                      />
                      <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-white/25">
                        {t("common.egp")}
                      </span>
                    </div>
                    {errors.price && <p className={ERR}>{errors.price}</p>}
                  </div>
                </div>

                {/* ─── CONDITION (Visual Scale) ─── */}
                <div>
                  <SectionHeader>
                    {t("market.condition")}{" "}
                    <span className="text-red-400 text-sm">*</span>
                  </SectionHeader>

                  {/* Scale bar */}
                  <div className="relative mb-4">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        animate={{
                          width:
                            activeCondIdx >= 0
                              ? `${((activeCondIdx + 1) / CONDS.length) * 100}%`
                              : "0%",
                        }}
                        style={{
                          background:
                            activeCondIdx >= 0
                              ? `linear-gradient(to right, #c8ff00, ${CONDS[activeCondIdx].color})`
                              : undefined,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    </div>

                    {/* Dot markers */}
                    <div className="flex justify-between mt-[-5px] relative z-10">
                      {CONDS.map((c, i) => {
                        const isActive = form.condition === c.key;
                        const isPassed = activeCondIdx >= 0 && i <= activeCondIdx;
                        return (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => {
                              set({ condition: c.key });
                              clr("condition");
                            }}
                            className="flex flex-col items-center"
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                                isActive
                                  ? "scale-125"
                                  : ""
                              }`}
                              style={{
                                borderColor: isPassed ? c.color : "rgba(255,255,255,0.1)",
                                backgroundColor: isPassed ? c.color : "transparent",
                              }}
                            />
                            <span
                              className={`text-[10px] font-bold mt-2 whitespace-nowrap transition-colors ${
                                isActive ? "text-white" : "text-white/30"
                              }`}
                            >
                              {t(c.lk)}
                            </span>
                            <span
                              className={`text-[9px] mt-0.5 max-w-[70px] text-center leading-tight transition-colors ${
                                isActive ? "text-white/50" : "text-white/15"
                              }`}
                            >
                              {t(c.descKey)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {errors.condition && (
                    <p className={ERR}>{errors.condition}</p>
                  )}
                </div>

                {/* ─── PHOTOS ─── */}
                <div>
                  <SectionHeader>{t("market.showcaseGear")}</SectionHeader>
                  <PhotoUpload
                    photos={form.photos}
                    onChange={(photos) => set({ photos })}
                    max={5}
                  />
                </div>

                {/* ─── LOCATION ─── */}
                <div>
                  <SectionHeader>
                    {t("market.location")}{" "}
                    <span className="text-red-400 text-sm">*</span>
                  </SectionHeader>
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
                            ? "bg-[#c8ff00] text-[#111827]"
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

                {/* ─── LOGGED IN BADGE (replaces Your Info for authenticated users) ─── */}
                <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                    <User size={16} className="text-emerald-400" />
                  </div>
                  <span className="text-sm text-emerald-400 font-medium">
                    {t("market.loggedInAs", { name: user?.name ?? "" })}
                  </span>
                </div>

                {/* Server error */}
                {errors.server && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {errors.server}
                  </div>
                )}

                {/* ─── SUBMIT CTA ─── */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileTap={{ scale: 0.97 }}
                  className="w-full rounded-xl bg-gradient-to-r from-[#c8ff00] to-[#a3d900] py-5 text-lg font-extrabold text-[#111827] font-[family-name:var(--font-display)] uppercase tracking-wide transition-all hover:shadow-[0_0_30px_rgba(200,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      {t("market.listForSale")}
                      <ArrowUpRight size={20} />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
