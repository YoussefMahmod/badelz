"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  Camera,
  ChevronDown,
  Plus,
  X,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { checkmarkDraw } from "@/lib/animations";

// ─── Types ───

type Category =
  | "RACKETS"
  | "SHOES"
  | "BAGS"
  | "BALLS"
  | "APPAREL"
  | "ACCESSORIES"
  | "OTHER";

type Condition = "NEW" | "LIKE_NEW" | "USED" | "WELL_USED";

interface ListingFormData {
  sellerName: string;
  sellerPhone: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  price: string;
  category: Category;
  condition: Condition;
  area: string;
  areaAr: string;
  photos: string[];
}

interface ListingResult {
  title: string;
  price: number;
}

// ─── Helpers ───

const INITIAL_FORM: ListingFormData = {
  sellerName: "",
  sellerPhone: "",
  title: "",
  titleAr: "",
  description: "",
  descriptionAr: "",
  price: "",
  category: "RACKETS",
  condition: "USED",
  area: "",
  areaAr: "",
  photos: [""],
};

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "RACKETS", label: "Rackets" },
  { value: "SHOES", label: "Shoes" },
  { value: "BAGS", label: "Bags" },
  { value: "BALLS", label: "Balls" },
  { value: "APPAREL", label: "Apparel" },
  { value: "ACCESSORIES", label: "Accessories" },
  { value: "OTHER", label: "Other" },
];

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "USED", label: "Used" },
  { value: "WELL_USED", label: "Well Used" },
];

const INPUT_CLASS =
  "bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder:text-[#666] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none w-full transition-colors";

const SECTION_ICONS = {
  seller: User,
  listing: ShoppingBag,
  photos: Camera,
} as const;

const MAX_PHOTOS = 5;

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
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm text-[#999] mb-1 block">{label}</label>
      {children}
    </div>
  );
}

// ─── Page ───

export default function CreateListingPage() {
  const { t } = useTranslation();

  // Section expand state (all expanded initially)
  const [sections, setSections] = useState({
    seller: true,
    listing: true,
    photos: true,
  });

  const toggleSection = (key: keyof typeof sections) =>
    setSections((s) => ({ ...s, [key]: !s[key] }));

  // Form state
  const [form, setForm] = useState<ListingFormData>(INITIAL_FORM);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ListingResult | null>(null);

  // ─── Updaters ───

  const updateField = <K extends keyof ListingFormData>(
    field: K,
    value: ListingFormData[K]
  ) => setForm((f) => ({ ...f, [field]: value }));

  const updatePhoto = (index: number, value: string) =>
    setForm((f) => ({
      ...f,
      photos: f.photos.map((p, i) => (i === index ? value : p)),
    }));

  const addPhoto = () => {
    if (form.photos.length >= MAX_PHOTOS) return;
    setForm((f) => ({ ...f, photos: [...f.photos, ""] }));
  };

  const removePhoto = (index: number) =>
    setForm((f) => ({
      ...f,
      photos: f.photos.filter((_, i) => i !== index),
    }));

  // ─── Submit ───

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const body = {
      sellerName: form.sellerName,
      sellerPhone: form.sellerPhone,
      title: form.title,
      ...(form.titleAr && { titleAr: form.titleAr }),
      ...(form.description && { description: form.description }),
      ...(form.descriptionAr && { descriptionAr: form.descriptionAr }),
      price: Number(form.price),
      category: form.category,
      condition: form.condition,
      area: form.area,
      ...(form.areaAr && { areaAr: form.areaAr }),
      photos: form.photos.filter((p) => p.trim() !== ""),
    };

    try {
      const res = await fetch("/api/admin/create-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "Failed to create listing");
        setSubmitting(false);
        return;
      }

      if (json.data) {
        setResult({ title: form.title, price: Number(form.price) });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Reset ───

  const resetForm = () => {
    setForm({ ...INITIAL_FORM, photos: [""] });
    setResult(null);
    setError(null);
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
            Listing Created!
          </h2>

          {/* Summary */}
          <div className="space-y-1 text-sm text-[#999] mb-6">
            <p>{result.title}</p>
            <p>{result.price.toLocaleString()} EGP</p>
          </div>

          {/* Create another */}
          <button
            onClick={resetForm}
            className="flex items-center justify-center gap-2 mx-auto bg-[#1a1a1a] border border-[#333] text-[#999] font-semibold rounded-xl px-6 py-3 hover:bg-[#222] transition-colors"
          >
            <RotateCcw size={16} />
            Create Another
          </button>
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
        <h1 className="text-xl font-bold text-white">Create Listing</h1>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* ── Section 1: Seller Info ── */}
          <Section
            title="Seller Info"
            icon={SECTION_ICONS.seller}
            expanded={sections.seller}
            onToggle={() => toggleSection("seller")}
          >
            <Field label="Seller Name">
              <input
                type="text"
                required
                value={form.sellerName}
                onChange={(e) => updateField("sellerName", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Seller Phone">
              <input
                type="tel"
                required
                placeholder="01XXXXXXXXX"
                value={form.sellerPhone}
                onChange={(e) => updateField("sellerPhone", e.target.value)}
                className={INPUT_CLASS}
                dir="ltr"
              />
            </Field>
          </Section>

          {/* ── Section 2: Listing Details ── */}
          <Section
            title="Listing Details"
            icon={SECTION_ICONS.listing}
            expanded={sections.listing}
            onToggle={() => toggleSection("listing")}
          >
            <Field label="Title">
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Title Arabic">
              <input
                type="text"
                value={form.titleAr}
                onChange={(e) => updateField("titleAr", e.target.value)}
                className={INPUT_CLASS}
                dir="rtl"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                maxLength={1000}
                rows={3}
                className={`${INPUT_CLASS} resize-none`}
              />
            </Field>

            <Field label="Description Arabic">
              <textarea
                value={form.descriptionAr}
                onChange={(e) => updateField("descriptionAr", e.target.value)}
                maxLength={1000}
                rows={3}
                className={`${INPUT_CLASS} resize-none`}
                dir="rtl"
              />
            </Field>

            <Field label="Price (EGP)">
              <input
                type="number"
                required
                min={0}
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                className={`${INPUT_CLASS} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                dir="ltr"
                placeholder="EGP"
              />
            </Field>

            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) =>
                  updateField("category", e.target.value as Category)
                }
                className={INPUT_CLASS}
              >
                {CATEGORIES.map((cat) => (
                  <option
                    key={cat.value}
                    value={cat.value}
                    className="bg-[#0d0d0d]"
                  >
                    {cat.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Condition">
              <select
                value={form.condition}
                onChange={(e) =>
                  updateField("condition", e.target.value as Condition)
                }
                className={INPUT_CLASS}
              >
                {CONDITIONS.map((cond) => (
                  <option
                    key={cond.value}
                    value={cond.value}
                    className="bg-[#0d0d0d]"
                  >
                    {cond.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Area">
              <input
                type="text"
                required
                placeholder="e.g. Maadi"
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
          </Section>

          {/* ── Section 3: Photos ── */}
          <Section
            title="Photos"
            icon={SECTION_ICONS.photos}
            expanded={sections.photos}
            onToggle={() => toggleSection("photos")}
          >
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {form.photos.map((photo, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                   
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#666] shrink-0 w-5 text-center">
                        #{idx + 1}
                      </span>
                      <input
                        type="url"
                        value={photo}
                        onChange={(e) => updatePhoto(idx, e.target.value)}
                        placeholder="https://..."
                        className={INPUT_CLASS}
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="flex shrink-0 items-center justify-center h-9 w-9 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {form.photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={addPhoto}
                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mt-2"
              >
                <Plus size={14} />
                Add Photo URL
              </button>
            )}

            <p className="text-xs text-[#666]">
              Max {MAX_PHOTOS} photos. Paste direct image URLs.
            </p>
          </Section>

          {/* ── Error ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

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
                "Create Listing"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
