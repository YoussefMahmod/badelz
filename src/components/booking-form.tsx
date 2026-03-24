"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, FileText, CheckCircle } from "lucide-react";
import { slideUp } from "@/lib/animations";
import { useTranslation } from "@/i18n";

interface BookingFormProps {
  onSubmit: (data: { name: string; phone: string; notes: string }) => void;
  loading?: boolean;
  initialName?: string;
  initialPhone?: string;
  /** Show a "Logged in as" badge when user is authenticated */
  authenticatedName?: string;
}

function isValidEgyptPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^01[0-5]\d{8}$/.test(cleaned);
}

export function BookingForm({
  onSubmit,
  loading = false,
  initialName = "",
  initialPhone = "",
  authenticatedName,
}: BookingFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false });

  const nameError = touched.name && !name.trim();
  const phoneError = touched.phone && !isValidEgyptPhone(phone);
  const isValid = name.trim() && isValidEgyptPhone(phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setTouched({ name: true, phone: true });
      return;
    }
    onSubmit({ name: name.trim(), phone: phone.replace(/\D/g, ""), notes: notes.trim() });
  };

  return (
    <motion.form {...slideUp} onSubmit={handleSubmit} className="space-y-5">
      {/* Logged in badge */}
      {authenticatedName && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
          <CheckCircle size={14} className="text-emerald-400 shrink-0" />
          <span className="text-xs text-emerald-400 font-medium">
            {t("nudge.loggedInAs", { name: authenticatedName })}
          </span>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
          <User size={15} className="text-white/40" />
          {t("booking.name")}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, name: true }))}
          placeholder={t("booking.namePlaceholder")}
          className={`w-full rounded-xl bg-white/5 px-4 py-4 text-base text-white/90 outline-none transition-all placeholder:text-white/30 ${
            nameError
              ? "ring-2 ring-red-500/30 bg-red-500/10"
              : "border border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          }`}
        />
        {nameError && (
          <p className="mt-1.5 text-xs text-red-400">{t("common.required")}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
          <Phone size={15} className="text-white/40" />
          {t("booking.phone")}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
          placeholder={t("booking.phonePlaceholder")}
          dir="ltr"
          className={`w-full rounded-xl bg-white/5 px-4 py-4 text-base text-white/90 outline-none transition-all placeholder:text-white/30 text-start ${
            phoneError
              ? "ring-2 ring-red-500/30 bg-red-500/10"
              : "border border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          }`}
        />
        {phoneError && (
          <p className="mt-1.5 text-xs text-red-400">
            {t("booking.phonePlaceholder")}
          </p>
        )}
        {touched.phone && phone && isValidEgyptPhone(phone) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs text-emerald-400"
          >
            &#10003;
          </motion.p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/70">
          <FileText size={15} className="text-white/40" />
          {t("booking.notes")}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("booking.notesPlaceholder")}
          rows={3}
          className="w-full rounded-xl bg-white/5 px-4 py-4 text-base text-white/90 outline-none transition-all placeholder:text-white/30 border border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 resize-none"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("common.loading") : t("common.next")}
      </motion.button>
    </motion.form>
  );
}
