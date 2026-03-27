"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  RectangleHorizontal,
  Clock,
  ChevronDown,
  Plus,
  X,
  MapPin,
  Copy,
  Check,
  MessageCircle,
  RotateCcw,
  Loader2,
  Languages,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { staggerContainer, staggerItem, checkmarkDraw } from "@/lib/animations";

// ─── Types ───

type SlotTemplate = "STANDARD_PADEL" | "EVENING_ONLY" | "WEEKEND_HEAVY";

interface CourtEntry {
  id: string;
  name: string;
  nameAr: string;
  pricePerHour: string;
  showArabic: boolean;
}

interface OnboardFormData {
  owner: { name: string; email: string; phone: string };
  venue: {
    name: string;
    nameAr: string;
    address: string;
    addressAr: string;
    city: string;
    cityAr: string;
    phone: string;
    whatsapp: string;
    latitude: number | null;
    longitude: number | null;
  };
  courts: CourtEntry[];
  slotTemplate: SlotTemplate;
}

interface OnboardResult {
  owner: { id: string; name: string; email: string };
  venue: { id: string; name: string };
  courtsCreated: number;
  slotsCreated: number;
  generatedPassword: string;
  whatsappLink: string;
}

// ─── Helpers ───

const INITIAL_COURT: () => CourtEntry = () => ({
  id: crypto.randomUUID(),
  name: "",
  nameAr: "",
  pricePerHour: "",
  showArabic: false,
});

const INITIAL_FORM: OnboardFormData = {
  owner: { name: "", email: "", phone: "" },
  venue: {
    name: "",
    nameAr: "",
    address: "",
    addressAr: "",
    city: "",
    cityAr: "",
    phone: "",
    whatsapp: "",
    latitude: null,
    longitude: null,
  },
  courts: [INITIAL_COURT()],
  slotTemplate: "STANDARD_PADEL",
};

const SLOT_TEMPLATES: {
  id: SlotTemplate;
  labelKey: string;
  descKey: string;
  slots: string;
}[] = [
  {
    id: "STANDARD_PADEL",
    labelKey: "admin.standardPadel",
    descKey: "admin.standardPadelDesc",
    slots: "91",
  },
  {
    id: "EVENING_ONLY",
    labelKey: "admin.eveningOnly",
    descKey: "admin.eveningOnlyDesc",
    slots: "42",
  },
  {
    id: "WEEKEND_HEAVY",
    labelKey: "admin.weekendHeavy",
    descKey: "admin.weekendHeavyDesc",
    slots: "72",
  },
];

const INPUT_CLASS =
  "bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none w-full transition-colors";

const SECTION_ICONS = {
  owner: User,
  venue: Building2,
  courts: RectangleHorizontal,
  slots: Clock,
} as const;

// ─── Collapsible Section ───

function Section({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: typeof User;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-start"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15">
            <Icon size={18} className="text-indigo-400" />
          </div>
          <span className="text-base font-bold text-white/70">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-white/30" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Field ───

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm text-white/50 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

// ─── Page ───

export default function OnboardPage() {
  const { t } = useTranslation();

  // Section expand state (all expanded initially)
  const [sections, setSections] = useState({
    owner: true,
    venue: true,
    courts: true,
    slots: true,
  });

  const toggleSection = (key: keyof typeof sections) =>
    setSections((s) => ({ ...s, [key]: !s[key] }));

  // Form state
  const [form, setForm] = useState<OnboardFormData>(INITIAL_FORM);
  const [showVenueArabic, setShowVenueArabic] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [result, setResult] = useState<OnboardResult | null>(null);
  const [copied, setCopied] = useState(false);

  // ─── Updaters ───

  const updateOwner = (field: keyof OnboardFormData["owner"], value: string) =>
    setForm((f) => ({ ...f, owner: { ...f.owner, [field]: value } }));

  const updateVenue = (field: keyof OnboardFormData["venue"], value: string | number | null) =>
    setForm((f) => ({ ...f, venue: { ...f.venue, [field]: value } }));

  const updateCourt = (id: string, field: keyof CourtEntry, value: string | boolean) =>
    setForm((f) => ({
      ...f,
      courts: f.courts.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));

  const addCourt = () =>
    setForm((f) => ({ ...f, courts: [...f.courts, INITIAL_COURT()] }));

  const removeCourt = (id: string) =>
    setForm((f) => ({
      ...f,
      courts: f.courts.length > 1 ? f.courts.filter((c) => c.id !== id) : f.courts,
    }));

  // ─── Location detect ───

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateVenue("latitude", pos.coords.latitude);
        updateVenue("longitude", pos.coords.longitude);
        setLocationLoading(false);
        setLocationDetected(true);
        setTimeout(() => setLocationDetected(false), 3000);
      },
      () => {
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // ─── Submit ───

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setEmailError(false);

    const body = {
      owner: form.owner,
      venue: {
        name: form.venue.name,
        ...(form.venue.nameAr && { nameAr: form.venue.nameAr }),
        address: form.venue.address,
        ...(form.venue.addressAr && { addressAr: form.venue.addressAr }),
        city: form.venue.city,
        ...(form.venue.cityAr && { cityAr: form.venue.cityAr }),
        phone: form.venue.phone,
        ...(form.venue.whatsapp && { whatsapp: form.venue.whatsapp }),
        ...(form.venue.latitude != null && { latitude: form.venue.latitude }),
        ...(form.venue.longitude != null && { longitude: form.venue.longitude }),
      },
      courts: form.courts.map((c) => ({
        name: c.name,
        ...(c.nameAr && { nameAr: c.nameAr }),
        pricePerHour: Number(c.pricePerHour),
      })),
      slotTemplate: form.slotTemplate,
    };

    try {
      const res = await fetch("/api/admin/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 409) {
        setEmailError(true);
        setSubmitting(false);
        return;
      }

      const json = await res.json();
      if (res.ok && json.data) {
        setResult(json.data);
      }
    } catch {
      // Network error — keep form open
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Copy password ───

  const copyPassword = async () => {
    if (!result?.generatedPassword) return;
    await navigator.clipboard.writeText(result.generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Reset ───

  const resetForm = () => {
    setForm({ ...INITIAL_FORM, courts: [INITIAL_COURT()] });
    setResult(null);
    setCopied(false);
    setEmailError(false);
    setShowVenueArabic(false);
    setLocationDetected(false);
  };

  // ─── Success overlay ───

  if (result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
        >
          {/* Animated checkmark */}
          <div className="flex justify-center mb-5">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                className="absolute inset-0 rounded-full bg-indigo-500/20"
              />
              <svg
                className="relative z-10"
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
              >
                <motion.path
                  variants={checkmarkDraw}
                  initial="initial"
                  animate="animate"
                  d="M10 20L17 27L30 13"
                  stroke="#818cf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white/90 mb-2">
            {t("admin.onboardSuccess")}
          </h2>

          {/* Summary */}
          <div className="space-y-1 text-sm text-white/50 mb-6">
            <p>{result.owner.name}</p>
            <p>{result.venue.name}</p>
            <p>
              {result.courtsCreated} courts &middot; {result.slotsCreated} slots
            </p>
          </div>

          {/* Password box */}
          <div className="mb-6">
            <p className="text-sm text-white/50 mb-2">
              {t("admin.generatedPassword")}
            </p>
            <button
              onClick={copyPassword}
              className="flex items-center justify-center gap-2 mx-auto bg-white/5 border border-white/10 rounded-xl px-5 py-3 font-mono text-lg text-white/90 hover:bg-white/10 transition-colors"
            >
              <span>{result.generatedPassword}</span>
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check size={16} className="text-emerald-400" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy size={16} className="text-white/40" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <p className="text-xs text-white/30 mt-1.5">
              {copied ? t("admin.copied") : t("admin.copyPassword")}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <a
              href={result.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl py-3 hover:opacity-90 transition-opacity"
            >
              <MessageCircle size={18} />
              {t("admin.sendWhatsApp")}
            </a>
            <button
              onClick={resetForm}
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/70 font-semibold rounded-xl py-3 hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={16} />
              {t("admin.onboardAnother")}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Form ───

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl font-bold text-white/90">
          {t("admin.quickOnboard")}
        </h1>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {/* ── Section 1: Owner ── */}
          <Section
            title={t("admin.ownerInfo")}
            icon={SECTION_ICONS.owner}
            expanded={sections.owner}
            onToggle={() => toggleSection("owner")}
          >
            <Field label={t("admin.ownerName")}>
              <input
                type="text"
                required
                value={form.owner.name}
                onChange={(e) => updateOwner("name", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>

            <Field label={t("admin.ownerEmail")}>
              <input
                type="email"
                required
                value={form.owner.email}
                onChange={(e) => {
                  updateOwner("email", e.target.value);
                  if (emailError) setEmailError(false);
                }}
                className={`${INPUT_CLASS} ${emailError ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20" : ""}`}
              />
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400 mt-1.5"
                  >
                    {t("admin.emailExists")}
                  </motion.p>
                )}
              </AnimatePresence>
            </Field>

            <Field label={t("admin.ownerPhone")}>
              <input
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                value={form.owner.phone}
                onChange={(e) => updateOwner("phone", e.target.value)}
                className={INPUT_CLASS}
                dir="ltr"
              />
            </Field>

            <p className="text-xs text-white/30 italic">
              Password will be auto-generated
            </p>
          </Section>

          {/* ── Section 2: Venue ── */}
          <Section
            title={t("admin.venueInfo")}
            icon={SECTION_ICONS.venue}
            expanded={sections.venue}
            onToggle={() => toggleSection("venue")}
          >
            <Field label={t("admin.venueName")}>
              <input
                type="text"
                required
                value={form.venue.name}
                onChange={(e) => updateVenue("name", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>

            <Field label={t("admin.address")}>
              <input
                type="text"
                required
                value={form.venue.address}
                onChange={(e) => updateVenue("address", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>

            <Field label={t("admin.city")}>
              <input
                type="text"
                required
                value={form.venue.city}
                onChange={(e) => updateVenue("city", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>

            <Field label={t("admin.venuePhone")}>
              <input
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                value={form.venue.phone}
                onChange={(e) => updateVenue("phone", e.target.value)}
                className={INPUT_CLASS}
                dir="ltr"
              />
            </Field>

            <Field label={t("admin.whatsapp")}>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={form.venue.whatsapp}
                onChange={(e) => updateVenue("whatsapp", e.target.value)}
                className={INPUT_CLASS}
                dir="ltr"
              />
            </Field>

            {/* Location detect */}
            <button
              type="button"
              onClick={detectLocation}
              disabled={locationLoading}
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
            >
              {locationLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : locationDetected ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <MapPin size={14} />
              )}
              {locationDetected
                ? t("admin.locationDetected")
                : t("admin.detectLocation")}
            </button>

            {/* Arabic sub-section */}
            <button
              type="button"
              onClick={() => setShowVenueArabic(!showVenueArabic)}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              <Languages size={14} />
              {t("admin.arabicOptional")}
              <motion.div
                animate={{ rotate: showVenueArabic ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} />
              </motion.div>
            </button>

            <AnimatePresence>
              {showVenueArabic && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden space-y-4"
                >
                  <Field label={t("admin.venueNameAr")}>
                    <input
                      type="text"
                      value={form.venue.nameAr}
                      onChange={(e) => updateVenue("nameAr", e.target.value)}
                      className={INPUT_CLASS}
                      dir="rtl"
                    />
                  </Field>
                  <Field label={t("admin.addressAr")}>
                    <input
                      type="text"
                      value={form.venue.addressAr}
                      onChange={(e) => updateVenue("addressAr", e.target.value)}
                      className={INPUT_CLASS}
                      dir="rtl"
                    />
                  </Field>
                  <Field label={t("admin.cityAr")}>
                    <input
                      type="text"
                      value={form.venue.cityAr}
                      onChange={(e) => updateVenue("cityAr", e.target.value)}
                      className={INPUT_CLASS}
                      dir="rtl"
                    />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* ── Section 3: Courts ── */}
          <Section
            title={t("admin.courtsSetup")}
            icon={SECTION_ICONS.courts}
            expanded={sections.courts}
            onToggle={() => toggleSection("courts")}
          >
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {form.courts.map((court, idx) => (
                  <motion.div
                    key={court.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
                      {/* Court header with remove */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white/30">
                          #{idx + 1}
                        </span>
                        {form.courts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCourt(court.id)}
                            className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors"
                          >
                            <X size={12} />
                            {t("admin.removeCourt")}
                          </button>
                        )}
                      </div>

                      {/* Court fields row */}
                      <div className="grid grid-cols-2 gap-3">
                        <Field label={t("admin.courtName")}>
                          <input
                            type="text"
                            required
                            value={court.name}
                            onChange={(e) =>
                              updateCourt(court.id, "name", e.target.value)
                            }
                            className={INPUT_CLASS}
                          />
                        </Field>
                        <Field label={t("admin.pricePerHour")}>
                          <input
                            type="number"
                            required
                            min={0}
                            value={court.pricePerHour}
                            onChange={(e) =>
                              updateCourt(court.id, "pricePerHour", e.target.value)
                            }
                            className={`${INPUT_CLASS} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                            dir="ltr"
                            placeholder="EGP"
                          />
                        </Field>
                      </div>

                      {/* Arabic name toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          updateCourt(court.id, "showArabic", !court.showArabic)
                        }
                        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
                      >
                        <Languages size={12} />
                        {t("admin.arabicOptional")}
                      </button>

                      <AnimatePresence>
                        {court.showArabic && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <Field label={t("admin.courtNameAr")}>
                              <input
                                type="text"
                                value={court.nameAr}
                                onChange={(e) =>
                                  updateCourt(court.id, "nameAr", e.target.value)
                                }
                                className={INPUT_CLASS}
                                dir="rtl"
                              />
                            </Field>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={addCourt}
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mt-2"
            >
              <Plus size={14} />
              {t("admin.addCourt")}
            </button>
          </Section>

          {/* ── Section 4: Slot Template ── */}
          <Section
            title={t("admin.slotSetup")}
            icon={SECTION_ICONS.slots}
            expanded={sections.slots}
            onToggle={() => toggleSection("slots")}
          >
            <p className="text-sm text-white/40 mb-3">
              {t("admin.selectTemplate")}
            </p>
            <div className="space-y-3">
              {SLOT_TEMPLATES.map((tmpl) => {
                const selected = form.slotTemplate === tmpl.id;
                return (
                  <motion.button
                    key={tmpl.id}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, slotTemplate: tmpl.id }))
                    }
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-start rounded-xl border p-4 transition-all ${
                      selected
                        ? "border-indigo-500/60 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white/90">
                        {t(tmpl.labelKey as Parameters<typeof t>[0])}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          selected
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "bg-white/5 text-white/40"
                        }`}
                      >
                        {tmpl.slots} slots/court
                      </span>
                    </div>
                    <p className="text-xs text-white/40">
                      {t(tmpl.descKey as Parameters<typeof t>[0])}
                    </p>

                    {/* Selection indicator */}
                    {selected && (
                      <motion.div
                        layoutId="template-indicator"
                        className="mt-2 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Section>

          {/* ── Submit ── */}
          <motion.div variants={staggerItem}>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-xl py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t("admin.onboarding")}
                </>
              ) : (
                t("admin.onboardVenue")
              )}
            </button>
          </motion.div>
        </motion.div>
      </form>
    </div>
  );
}
