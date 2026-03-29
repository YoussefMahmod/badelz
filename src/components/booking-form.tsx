"use client";

import { useState } from "react";
import { User, Phone, FileText, CheckCircle } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Logged in badge */}
      {authenticatedName && (
        <div className="flex items-center gap-2 rounded-sm bg-[#d4ff00]/10 border border-[#d4ff00]/20 px-3 py-2">
          <CheckCircle size={14} className="text-[#d4ff00] shrink-0" />
          <span className="text-xs text-[#d4ff00] font-medium">
            {t("nudge.loggedInAs", { name: authenticatedName })}
          </span>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#666]">
          <User size={15} className="text-[#666]" />
          {t("booking.name")}
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
        />
        {nameError && (
          <p className="mt-1.5 text-xs text-[#ff4d4d]">{t("common.required")}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#666]">
          <Phone size={15} className="text-[#666]" />
          {t("booking.phone")}
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
        />
        {phoneError && (
          <p className="mt-1.5 text-xs text-[#ff4d4d]">
            {t("booking.phonePlaceholder")}
          </p>
        )}
        {touched.phone && phone && isValidEgyptPhone(phone) && (
          <p className="mt-1.5 text-xs text-[#d4ff00]">
            &#10003;
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#666]">
          <FileText size={15} className="text-[#666]" />
          {t("booking.notes")}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("booking.notesPlaceholder")}
          rows={3}
          className="w-full rounded-sm bg-[#1a1a1a] px-4 py-4 text-base text-white outline-none transition-colors placeholder:text-[#666] border-2 border-[#333] focus:border-[#d4ff00] resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-sm bg-[#d4ff00] py-4 text-base font-bold text-[#0d0d0d] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] transition-transform duration-75"
      >
        {loading ? t("common.loading") : t("common.next")}
      </button>
    </form>
  );
}
