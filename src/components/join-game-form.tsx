"use client";

import { useState } from "react";
import { User, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { useTranslation } from "@/i18n";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Logged in badge */}
      {authenticatedName && (
        <div className="flex items-center gap-2 rounded-sm bg-[#d4ff00]/10 border border-[#d4ff00]/20 px-3 py-2">
          <CheckCircle size={14} className="text-[#d4ff00] shrink-0" />
          <span className="text-xs text-[#d4ff00] font-medium">
            {t("nudge.loggedInAs", { name: authenticatedName })}
          </span>
        </div>
      )}

      {/* Server error */}
      {error && (
        <div className="flex items-center gap-2 rounded-sm bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 px-4 py-3">
          <AlertCircle size={16} className="shrink-0 text-[#ff4d4d]" />
          <p className="text-sm text-[#ff4d4d]">{error}</p>
        </div>
      )}

      {/* Name input */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#666]">
          <User size={15} className="text-[#666]" />
          {t("game.yourName")}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, name: true }))}
          placeholder={t("booking.namePlaceholder")}
          className={`w-full rounded-sm bg-[#1a1a1a] px-4 py-4 text-base text-white outline-none transition-colors placeholder:text-[#666] ${
            nameError
              ? "ring-2 ring-[#ff4d4d]/30 bg-[#ff4d4d]/10"
              : "border-2 border-[#333] focus:border-[#d4ff00]"
          }`}
          disabled={loading}
        />
        {nameError && (
          <p className="mt-1.5 text-xs text-[#ff4d4d]">
            {t("common.required")}
          </p>
        )}
      </div>

      {/* Phone input */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#666]">
          <Phone size={15} className="text-[#666]" />
          {t("game.yourPhone")}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
          placeholder={t("booking.phonePlaceholder")}
          dir="ltr"
          className={`w-full rounded-sm bg-[#1a1a1a] px-4 py-4 text-base text-white outline-none transition-colors placeholder:text-[#666] text-start ${
            phoneError
              ? "ring-2 ring-[#ff4d4d]/30 bg-[#ff4d4d]/10"
              : "border-2 border-[#333] focus:border-[#d4ff00]"
          }`}
          disabled={loading}
        />
        {phoneError && (
          <p className="mt-1.5 text-xs text-[#ff4d4d]">
            {t("booking.phonePlaceholder")}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-sm bg-[#d4ff00] py-4 text-base font-bold text-[#0d0d0d] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] transition-transform duration-75"
      >
        {loading ? t("game.joining") : t("game.confirmSpot")}
      </button>
    </form>
  );
}
