"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { useTranslation } from "@/i18n";
import { slideUp } from "@/lib/animations";

interface JoinGameFormProps {
  onSubmit: (data: { playerName: string; playerPhone: string }) => void;
  loading?: boolean;
  error?: string | null;
  initialName?: string;
  initialPhone?: string;
  authenticatedName?: string;
}

function isValidEgyptPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^01[0125]\d{8}$/.test(cleaned);
}

export function JoinGameForm({
  onSubmit,
  loading = false,
  error = null,
  initialName = "",
  initialPhone = "",
  authenticatedName,
}: JoinGameFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
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
    onSubmit({
      playerName: name.trim(),
      playerPhone: phone.replace(/\D/g, ""),
    });
  };

  return (
    <motion.form {...slideUp} onSubmit={handleSubmit} className="space-y-4">
      {/* Logged in badge */}
      {authenticatedName && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
          <CheckCircle size={14} className="text-emerald-500 shrink-0" />
          <span className="text-xs text-emerald-700 font-medium">
            {t("nudge.loggedInAs", { name: authenticatedName })}
          </span>
        </div>
      )}

      {/* Server error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3"
          >
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name input */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <User size={15} className="text-gray-400" />
          {t("game.yourName")}
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
          disabled={loading}
        />
        {nameError && (
          <p className="mt-1.5 text-xs text-red-500">
            {t("common.required")}
          </p>
        )}
      </div>

      {/* Phone input */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Phone size={15} className="text-gray-400" />
          {t("game.yourPhone")}
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
          disabled={loading}
        />
        {phoneError && (
          <p className="mt-1.5 text-xs text-red-500">
            {t("booking.phonePlaceholder")}
          </p>
        )}
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        className="w-full rounded-full bg-[#111827] py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("game.joining") : t("game.confirmSpot")}
      </motion.button>
    </motion.form>
  );
}
