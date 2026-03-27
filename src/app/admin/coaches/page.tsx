"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  GraduationCap,
  ChevronDown,
  Copy,
  Check,
  MessageCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { staggerContainer, staggerItem, checkmarkDraw } from "@/lib/animations";

// ─── Types ───

interface CoachFormData {
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  whatsapp: string;
  bio: string;
  bioAr: string;
  photo: string;
  areas: string;
  areasAr: string;
  pricePerHour: string;
  experience: string;
  isPioneerCoach: boolean;
}

interface CoachResult {
  coach: { id: string; name: string };
  generatedPassword?: string;
  whatsappLink?: string;
}

// ─── Helpers ───

const INITIAL_FORM: CoachFormData = {
  name: "",
  nameAr: "",
  email: "",
  phone: "",
  whatsapp: "",
  bio: "",
  bioAr: "",
  photo: "",
  areas: "",
  areasAr: "",
  pricePerHour: "",
  experience: "",
  isPioneerCoach: true,
};

const INPUT_CLASS =
  "bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none w-full transition-colors";

const SECTION_ICONS = {
  account: User,
  profile: GraduationCap,
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
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm text-white/50 mb-1 block">{label}</label>
      {children}
      {hint && <p className="text-xs text-white/30 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Page ───

export default function CreateCoachPage() {
  useTranslation();

  // Section expand state (all expanded initially)
  const [sections, setSections] = useState({
    account: true,
    profile: true,
  });

  const toggleSection = (key: keyof typeof sections) =>
    setSections((s) => ({ ...s, [key]: !s[key] }));

  // Form state
  const [form, setForm] = useState<CoachFormData>(INITIAL_FORM);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [copied, setCopied] = useState(false);

  // ─── Updater ───

  const updateField = <K extends keyof CoachFormData>(
    field: K,
    value: CoachFormData[K]
  ) => setForm((f) => ({ ...f, [field]: value }));

  // ─── Submit ───

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setEmailError(false);

    const body = {
      name: form.name,
      nameAr: form.nameAr || undefined,
      email: form.email || "",
      phone: form.phone,
      whatsapp: form.whatsapp || undefined,
      bio: form.bio || undefined,
      bioAr: form.bioAr || undefined,
      photo: form.photo || undefined,
      areas: form.areas
        ? form.areas.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      areasAr: form.areasAr
        ? form.areasAr.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : undefined,
      experience: form.experience || undefined,
      isPioneerCoach: form.isPioneerCoach,
    };

    try {
      const res = await fetch("/api/admin/create-coach", {
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
    setForm({ ...INITIAL_FORM });
    setResult(null);
    setCopied(false);
    setEmailError(false);
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
            Coach Created!
          </h2>

          {/* Coach name */}
          <div className="space-y-1 text-sm text-white/50 mb-6">
            <p>{result.coach.name}</p>
          </div>

          {/* Password box (only if generated) */}
          {result.generatedPassword && (
            <div className="mb-6">
              <p className="text-sm text-white/50 mb-2">Generated Password</p>
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
                {copied ? "Copied!" : "Click to copy"}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {result.whatsappLink && (
              <a
                href={result.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl py-3 hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={18} />
                Send WhatsApp
              </a>
            )}
            <button
              onClick={resetForm}
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/70 font-semibold rounded-xl py-3 hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={16} />
              Create Another
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
        <h1 className="text-xl font-bold text-white/90">Create Coach</h1>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {/* ── Section 1: Account Info ── */}
          <Section
            title="Account Info"
            icon={SECTION_ICONS.account}
            expanded={sections.account}
            onToggle={() => toggleSection("account")}
          >
            <Field label="Name">
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Name Arabic">
              <input
                type="text"
                value={form.nameAr}
                onChange={(e) => updateField("nameAr", e.target.value)}
                className={INPUT_CLASS}
                dir="rtl"
              />
            </Field>

            <Field label="Email" hint="Optional — creates login account">
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  updateField("email", e.target.value);
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
                    Phone or email already exists
                  </motion.p>
                )}
              </AnimatePresence>
            </Field>

            <Field label="Phone">
              <input
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={INPUT_CLASS}
                dir="ltr"
              />
            </Field>

            <Field label="WhatsApp">
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={form.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
                className={INPUT_CLASS}
                dir="ltr"
              />
            </Field>
          </Section>

          {/* ── Section 2: Coach Profile ── */}
          <Section
            title="Coach Profile"
            icon={SECTION_ICONS.profile}
            expanded={sections.profile}
            onToggle={() => toggleSection("profile")}
          >
            <Field label="Bio">
              <textarea
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                maxLength={500}
                rows={3}
                className={`${INPUT_CLASS} resize-none`}
              />
              <p className="text-xs text-white/20 mt-1 text-end">
                {form.bio.length}/500
              </p>
            </Field>

            <Field label="Bio Arabic">
              <textarea
                value={form.bioAr}
                onChange={(e) => updateField("bioAr", e.target.value)}
                maxLength={500}
                rows={3}
                className={`${INPUT_CLASS} resize-none`}
                dir="rtl"
              />
              <p className="text-xs text-white/20 mt-1 text-start">
                {form.bioAr.length}/500
              </p>
            </Field>

            <Field label="Photo URL">
              <input
                type="url"
                value={form.photo}
                onChange={(e) => updateField("photo", e.target.value)}
                className={INPUT_CLASS}
                dir="ltr"
                placeholder="https://..."
              />
            </Field>

            <Field label="Areas" hint="Comma-separated, e.g. Maadi, Nasr City">
              <input
                type="text"
                value={form.areas}
                onChange={(e) => updateField("areas", e.target.value)}
                className={INPUT_CLASS}
                placeholder="Maadi, Nasr City"
              />
            </Field>

            <Field label="Areas Arabic" hint="Comma-separated">
              <input
                type="text"
                value={form.areasAr}
                onChange={(e) => updateField("areasAr", e.target.value)}
                className={INPUT_CLASS}
                dir="rtl"
              />
            </Field>

            <Field label="Price Per Hour">
              <input
                type="number"
                min={0}
                value={form.pricePerHour}
                onChange={(e) => updateField("pricePerHour", e.target.value)}
                className={`${INPUT_CLASS} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                dir="ltr"
                placeholder="EGP"
              />
            </Field>

            <Field label="Experience">
              <input
                type="text"
                value={form.experience}
                onChange={(e) => updateField("experience", e.target.value)}
                className={INPUT_CLASS}
                placeholder="5 years"
              />
            </Field>

            {/* Pioneer Coach toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/50">Pioneer Coach</label>
              <button
                type="button"
                role="switch"
                aria-checked={form.isPioneerCoach}
                onClick={() =>
                  updateField("isPioneerCoach", !form.isPioneerCoach)
                }
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                  form.isPioneerCoach
                    ? "bg-indigo-500"
                    : "bg-white/10"
                }`}
              >
                <motion.span
                  animate={{ x: form.isPioneerCoach ? 22 : 2 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
                />
              </button>
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
                  Creating...
                </>
              ) : (
                "Create Coach"
              )}
            </button>
          </motion.div>
        </motion.div>
      </form>
    </div>
  );
}
