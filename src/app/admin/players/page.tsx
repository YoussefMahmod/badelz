"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Trophy,
  ChevronDown,
  Copy,
  Check,
  MessageCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { checkmarkDraw } from "@/lib/animations";

// ─── Types ───

type PlayerTier = "BRONZE" | "GOLD" | "EMERALD" | "DIAMOND" | "MASTER" | "GRANDMASTER";

interface PlayerFormData {
  name: string;
  email: string;
  phone: string;
  area: string;
  areaAr: string;
  avatar: string;
  gamesPlayed: string;
  gamesWon: string;
  rating: string;
  tier: PlayerTier;
  isEarlyAdopter: boolean;
}

interface CreatePlayerResult {
  player: { id: string; name: string; phone: string };
  generatedPassword: string | null;
  whatsappLink: string | null;
}

// ─── Helpers ───

const INITIAL_FORM: PlayerFormData = {
  name: "",
  email: "",
  phone: "",
  area: "",
  areaAr: "",
  avatar: "",
  gamesPlayed: "0",
  gamesWon: "0",
  rating: "5",
  tier: "BRONZE",
  isEarlyAdopter: false,
};

const TIER_OPTIONS: { value: PlayerTier; label: string }[] = [
  { value: "BRONZE", label: "Bronze" },
  { value: "GOLD", label: "Gold" },
  { value: "EMERALD", label: "Emerald" },
  { value: "DIAMOND", label: "Diamond" },
  { value: "MASTER", label: "Master" },
  { value: "GRANDMASTER", label: "Grandmaster" },
];

const INPUT_CLASS =
  "bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder:text-[#666] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none w-full transition-colors";

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
    <div
      className="bg-[#1a1a1a] border border-[#333] rounded-sm overflow-hidden"
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
          <span className="text-base font-bold text-[#999]">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-[#666]" />
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
    </div>
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
      <label className="text-sm text-[#999] mb-1 block">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#666] mt-1">{hint}</p>}
    </div>
  );
}

// ─── Page ───

export default function CreatePlayerPage() {
  const { t } = useTranslation();
  void t; // Admin pages use hardcoded English strings

  // Section expand state
  const [sections, setSections] = useState({
    account: true,
    profile: true,
  });

  const toggleSection = (key: keyof typeof sections) =>
    setSections((s) => ({ ...s, [key]: !s[key] }));

  // Form state
  const [form, setForm] = useState<PlayerFormData>(INITIAL_FORM);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [conflictError, setConflictError] = useState("");
  const [result, setResult] = useState<CreatePlayerResult | null>(null);
  const [copied, setCopied] = useState(false);

  // ─── Updaters ───

  const updateField = <K extends keyof PlayerFormData>(field: K, value: PlayerFormData[K]) =>
    setForm((f) => ({ ...f, [field]: value }));

  // ─── Submit ───

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setEmailError(false);
    setConflictError("");

    const body = {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone,
      area: form.area || undefined,
      areaAr: form.areaAr || undefined,
      avatar: form.avatar || undefined,
      gamesPlayed: Number(form.gamesPlayed),
      gamesWon: Number(form.gamesWon),
      rating: Number(form.rating),
      tier: form.tier,
      isEarlyAdopter: form.isEarlyAdopter,
    };

    try {
      const res = await fetch("/api/admin/create-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 409) {
        const json = await res.json();
        const msg = json.message || "";
        if (msg.toLowerCase().includes("email")) {
          setEmailError(true);
        } else {
          setConflictError("Phone/email already exists");
        }
        setSubmitting(false);
        return;
      }

      const json = await res.json();
      if (res.ok && json.data) {
        setResult(json.data);
      }
    } catch {
      // Network error -- keep form open
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
    setConflictError("");
  };

  // ─── Success overlay ───

  if (result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-[#1a1a1a] border border-[#333] rounded-sm p-6 text-center"
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
                  initial="initial"
                  animate="animate"
                  variants={checkmarkDraw}

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

          <h2 className="text-xl font-bold text-white mb-2">
            Player Created!
          </h2>

          {/* Player name */}
          <div className="space-y-1 text-sm text-[#999] mb-6">
            <p>{result.player.name}</p>
            <p dir="ltr" className="font-mono text-[#666]">{result.player.phone}</p>
          </div>

          {/* Password box (only if account was created) */}
          {result.generatedPassword && (
            <div className="mb-6">
              <p className="text-sm text-[#999] mb-2">
                Generated Password
              </p>
              <button
                onClick={copyPassword}
                className="flex items-center justify-center gap-2 mx-auto bg-[#1a1a1a] border border-[#333] rounded-xl px-5 py-3 font-mono text-lg text-white hover:bg-[#222] transition-colors"
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
                      <Check size={16} className="text-[#d4ff00]" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy size={16} className="text-[#666]" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <p className="text-xs text-[#666] mt-1.5">
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
                className="flex items-center justify-center gap-2 bg-[#d4ff00] text-[#0d0d0d] text-white font-semibold rounded-xl py-3 hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={18} />
                Send WhatsApp
              </a>
            )}
            <button
              onClick={resetForm}
              className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-[#333] text-[#999] font-semibold rounded-xl py-3 hover:bg-[#222] transition-colors"
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
        <h1 className="text-xl font-bold text-white">
          Create Player
        </h1>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div

          className="space-y-4"
        >
          {/* ── Section 1: Account Info ── */}
          <Section
            title="Account Info"
            icon={User}
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
                    Email already exists
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
                onChange={(e) => {
                  updateField("phone", e.target.value);
                  if (conflictError) setConflictError("");
                }}
                className={`${INPUT_CLASS} ${conflictError ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20" : ""}`}
                dir="ltr"
              />
              <AnimatePresence>
                {conflictError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400 mt-1.5"
                  >
                    {conflictError}
                  </motion.p>
                )}
              </AnimatePresence>
            </Field>
          </Section>

          {/* ── Section 2: Player Profile ── */}
          <Section
            title="Player Profile"
            icon={Trophy}
            expanded={sections.profile}
            onToggle={() => toggleSection("profile")}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Area">
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => updateField("area", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Area Arabic">
                <input
                  type="text"
                  value={form.areaAr}
                  onChange={(e) => updateField("areaAr", e.target.value)}
                  className={INPUT_CLASS}
                  dir="rtl"
                />
              </Field>
            </div>

            <Field label="Avatar URL">
              <input
                type="url"
                value={form.avatar}
                onChange={(e) => updateField("avatar", e.target.value)}
                placeholder="https://..."
                className={INPUT_CLASS}
                dir="ltr"
              />
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Games Played">
                <input
                  type="number"
                  min={0}
                  value={form.gamesPlayed}
                  onChange={(e) => updateField("gamesPlayed", e.target.value)}
                  className={`${INPUT_CLASS} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                  dir="ltr"
                />
              </Field>

              <Field label="Games Won">
                <input
                  type="number"
                  min={0}
                  value={form.gamesWon}
                  onChange={(e) => updateField("gamesWon", e.target.value)}
                  className={`${INPUT_CLASS} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                  dir="ltr"
                />
              </Field>

              <Field label="Rating">
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={form.rating}
                  onChange={(e) => updateField("rating", e.target.value)}
                  className={`${INPUT_CLASS} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                  dir="ltr"
                />
              </Field>
            </div>

            <Field label="Tier">
              <select
                value={form.tier}
                onChange={(e) => updateField("tier", e.target.value as PlayerTier)}
                className={INPUT_CLASS}
              >
                {TIER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateField("isEarlyAdopter", !form.isEarlyAdopter)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  form.isEarlyAdopter ? "bg-indigo-500" : "bg-[#222]"
                }`}
              >
                <motion.div
                  animate={{ x: form.isEarlyAdopter ? 20 : 2 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
                />
              </button>
              <span className="text-sm text-[#999]">Early Adopter</span>
            </div>
          </Section>

          {/* ── Submit ── */}
          <div>
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
                "Create Player"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
