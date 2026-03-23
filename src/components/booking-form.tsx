"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, FileText } from "lucide-react";
import { slideUp } from "@/lib/animations";
import { useTranslation } from "@/i18n";

interface BookingFormProps {
  onSubmit: (data: { name: string; phone: string; notes: string }) => void;
  loading?: boolean;
}

function isValidEgyptPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^01[0-5]\d{8}$/.test(cleaned);
}

export function BookingForm({ onSubmit, loading = false }: BookingFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
      {/* Name */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <User size={15} className="text-gray-400" />
          {t("booking.name")}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, name: true }))}
          placeholder={t("booking.namePlaceholder")}
          className={`w-full rounded-xl bg-gray-50 px-4 py-4 text-base text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
            nameError
              ? "ring-2 ring-red-300 bg-red-50"
              : "border border-gray-200 focus:border-[#c8ff00] focus:ring-2 focus:ring-[#c8ff00]/30"
          }`}
        />
        {nameError && (
          <p className="mt-1.5 text-xs text-red-500">{t("common.required")}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Phone size={15} className="text-gray-400" />
          {t("booking.phone")}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
          placeholder={t("booking.phonePlaceholder")}
          dir="ltr"
          className={`w-full rounded-xl bg-gray-50 px-4 py-4 text-base text-gray-900 outline-none transition-all placeholder:text-gray-400 text-start ${
            phoneError
              ? "ring-2 ring-red-300 bg-red-50"
              : "border border-gray-200 focus:border-[#c8ff00] focus:ring-2 focus:ring-[#c8ff00]/30"
          }`}
        />
        {phoneError && (
          <p className="mt-1.5 text-xs text-red-500">
            {t("booking.phonePlaceholder")}
          </p>
        )}
        {touched.phone && phone && isValidEgyptPhone(phone) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs text-green-500"
          >
            &#10003;
          </motion.p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FileText size={15} className="text-gray-400" />
          {t("booking.notes")}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("booking.notesPlaceholder")}
          rows={3}
          className="w-full rounded-xl bg-gray-50 px-4 py-4 text-base text-gray-900 outline-none transition-all placeholder:text-gray-400 border border-gray-200 focus:border-[#c8ff00] focus:ring-2 focus:ring-[#c8ff00]/30 resize-none"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        className="w-full rounded-full bg-[#111827] py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("common.loading") : t("common.next")}
      </motion.button>
    </motion.form>
  );
}
