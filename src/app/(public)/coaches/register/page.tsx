"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, MapPin, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/main-layout";
import { useTranslation, useLocale } from "@/i18n";
import { AREAS } from "@/lib/constants";

interface FormData {
  name: string;
  nameAr: string;
  phone: string;
  whatsapp: string;
  areas: string[];
  pricePerHour: string;
  experience: string;
  bio: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  areas?: string;
  server?: string;
}

const INITIAL_FORM: FormData = {
  name: "",
  nameAr: "",
  phone: "",
  whatsapp: "",
  areas: [],
  pricePerHour: "",
  experience: "",
  bio: "",
};

export default function CoachRegisterPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  const areaOptions = AREAS.filter((a) => a.key !== "all");

  const toggleArea = (key: string) => {
    setForm((prev) => ({
      ...prev,
      areas: prev.areas.includes(key)
        ? prev.areas.filter((a) => a !== key)
        : [...prev.areas, key],
    }));
    setErrors((prev) => ({ ...prev, areas: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = t("common.required");
    }

    const phoneClean = form.phone.replace(/\D/g, "");
    if (!phoneClean || phoneClean.length !== 11 || !/^01[0125]/.test(phoneClean)) {
      newErrors.phone = t("common.required");
    }

    if (form.areas.length === 0) {
      newErrors.areas = t("common.required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const body = {
        name: form.name.trim(),
        nameAr: form.nameAr.trim() || undefined,
        phone: form.phone.replace(/\D/g, ""),
        whatsapp: form.whatsapp.replace(/\D/g, "") || undefined,
        areas: form.areas,
        pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : undefined,
        experience: form.experience.trim() || undefined,
        bio: form.bio.trim() || undefined,
      };

      const res = await fetch("/api/coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ phone: json.message || "Phone already registered" });
        } else {
          setErrors({ server: json.message || t("common.error") });
        }
        return;
      }

      setSuccess(json.data?.id ?? null);
    } catch {
      setErrors({ server: t("common.error") });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "w-full rounded-sm bg-[#1a1a1a] border border-[#333] px-4 py-3.5 text-sm text-white outline-none placeholder:text-[#666] focus:border-[#d4ff00]  transition-all";
  const labelClasses = "block text-sm font-medium text-[#999] mb-1.5";
  const errorClasses = "text-xs text-red-400 mt-1";

  return (
    <MainLayout showNav={false}>
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: locale === "ar" ? 10 : -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#999] hover:text-white mb-6 transition-colors"
        >
          <BackIcon size={18} />
          <span className="text-sm">{t("common.back")}</span>
        </motion.button>

        <AnimatePresence mode="wait">
          {success ? (
            /* Success state */
            <div
              key="success"
              className="flex flex-col items-center text-center py-12"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-sm bg-[#d4ff00]/10 border-2 border-[#d4ff00]">
                <CheckCircle size={36} className="text-[#d4ff00]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("coach.registerSuccess")}
              </h2>
              <p className="text-sm text-[#999] mb-8">
                {t("coach.registerSuccessDesc")}
              </p>
              <div className="flex flex-col gap-3 w-full">
                <Link
                  href={`/coaches/${success}`}
                  className="flex items-center justify-center rounded-sm bg-[#d4ff00] py-3.5 text-sm font-bold text-[#0d0d0d] transition-all"
                >
                  {t("player.viewCard")}
                </Link>
                <Link
                  href="/coaches"
                  className="flex items-center justify-center rounded-sm border border-[#333] py-3 text-sm font-medium text-[#999] hover:bg-[#1a1a1a] transition-all"
                >
                  {t("coach.directory")}
                </Link>
              </div>
            </div>
          ) : (
            /* Registration form */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold text-white mb-1">
                {t("coach.register")}
              </h1>
              <p className="text-sm text-[#999] mb-6">
                {t("coach.registerDesc")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-5 space-y-5">
                  {/* Name */}
                  <div>
                    <label className={labelClasses}>
                      {t("coach.name")} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, name: e.target.value }));
                        setErrors((p) => ({ ...p, name: undefined }));
                      }}
                      placeholder="Ahmed Khaled"
                      className={inputClasses}
                    />
                    {errors.name && <p className={errorClasses}>{errors.name}</p>}
                  </div>

                  {/* Name Arabic */}
                  <div>
                    <label className={labelClasses}>
                      {t("coach.name")} ({locale === "ar" ? "بالعربي" : "Arabic"}){" "}
                      <span className="text-[#666]">({t("common.optional")})</span>
                    </label>
                    <input
                      type="text"
                      value={form.nameAr}
                      onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))}
                      placeholder="أحمد خالد"
                      dir="rtl"
                      className={inputClasses}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={labelClasses}>
                      {t("coach.phone")} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, phone: e.target.value }));
                        setErrors((p) => ({ ...p, phone: undefined }));
                      }}
                      placeholder="01XXXXXXXXX"
                      dir="ltr"
                      inputMode="tel"
                      className={inputClasses}
                    />
                    {errors.phone && <p className={errorClasses}>{errors.phone}</p>}
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className={labelClasses}>
                      WhatsApp{" "}
                      <span className="text-[#666]">({t("common.optional")})</span>
                    </label>
                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      dir="ltr"
                      inputMode="tel"
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Areas */}
                <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-5">
                  <label className={labelClasses}>
                    {t("coach.selectAreas")} <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {areaOptions.map((area) => {
                      const isActive = form.areas.includes(area.key);
                      const label = locale === "ar" ? area.labelAr : area.labelEn;
                      return (
                        <button
                          key={area.key}
                          type="button"
                          onClick={() => toggleArea(area.key)}
                          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-[#d4ff00] text-[#0d0d0d]"
                              : "border border-[#333] text-[#999] hover:bg-[#222]"
                          }`}
                        >
                          <MapPin size={11} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {errors.areas && <p className={errorClasses}>{errors.areas}</p>}
                </div>

                {/* Price & Experience */}
                <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-5 space-y-5">
                  {/* Price per hour */}
                  <div>
                    <label className={labelClasses}>
                      {t("coach.pricePerHour")}{" "}
                      <span className="text-[#666]">({t("common.optional")})</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={form.pricePerHour}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, pricePerHour: e.target.value }))
                        }
                        placeholder="500"
                        dir="ltr"
                        inputMode="numeric"
                        min={0}
                        className={`${inputClasses} pe-14`}
                      />
                      <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-[#666]">
                        {t("common.egp")}
                      </span>
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className={labelClasses}>
                      {t("coach.experience")}{" "}
                      <span className="text-[#666]">({t("common.optional")})</span>
                    </label>
                    <input
                      type="text"
                      value={form.experience}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, experience: e.target.value }))
                      }
                      placeholder={locale === "ar" ? "5 سنين | FIP Certified" : "5 years | FIP Certified"}
                      className={inputClasses}
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className={labelClasses}>
                      {t("coach.bio")}{" "}
                      <span className="text-[#666]">({t("common.optional")})</span>
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                      placeholder={
                        locale === "ar"
                          ? "اكتب نبذة عنك وعن خبرتك..."
                          : "Tell players about your coaching experience..."
                      }
                      rows={4}
                      className={`${inputClasses} resize-none`}
                    />
                  </div>
                </div>

                {/* Server error */}
                {errors.server && (
                  <div className="rounded-sm bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {errors.server}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  
                  className="w-full rounded-sm bg-[#d4ff00] py-4 text-base font-bold text-[#0d0d0d] transition-all hover:shadow-[0_0_30px_rgba(200,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.97] transition-transform duration-75"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    t("coach.register")
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
