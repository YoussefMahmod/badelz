"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, AlertCircle } from "lucide-react";
import { useTranslation } from "@/i18n";

interface JoinLobbyFormProps {
  onSubmit: (data: { playerName: string; playerPhone: string }) => void;
  loading?: boolean;
  error?: string | null;
}

function isValidEgyptPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^01[0125]\d{8}$/.test(cleaned);
}

const inputBase =
  "w-full rounded-xl px-4 py-4 text-base text-white outline-none placeholder:text-white/30 transition-all";
const inputNormal =
  "bg-white/5 border border-white/10 focus:border-[#c8ff00]/50 focus:ring-2 focus:ring-[#c8ff00]/30";
const inputError =
  "bg-red-500/5 border border-red-500/30 ring-2 ring-red-500/20";

export function JoinLobbyForm({ onSubmit, loading = false, error = null }: JoinLobbyFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false });

  const nameErr = touched.name && !name.trim();
  const phoneErr = touched.phone && !isValidEgyptPhone(phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !isValidEgyptPhone(phone)) {
      setTouched({ name: true, phone: true });
      return;
    }
    onSubmit({ playerName: name.trim(), playerPhone: phone.replace(/\D/g, "") });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3"
          >
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
          <User size={15} className="text-white/40" />
          {t("lobby.yourName")}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, name: true }))}
          placeholder={t("lobby.namePlaceholder")}
          className={`${inputBase} ${nameErr ? inputError : inputNormal}`}
          disabled={loading}
        />
        {nameErr && <p className="mt-1.5 text-xs text-red-400">{t("common.required")}</p>}
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
          <Phone size={15} className="text-white/40" />
          {t("lobby.yourPhone")}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
          placeholder={t("lobby.phonePlaceholder")}
          dir="ltr"
          className={`${inputBase} text-start ${phoneErr ? inputError : inputNormal}`}
          disabled={loading}
        />
        {phoneErr && <p className="mt-1.5 text-xs text-red-400">{t("lobby.phonePlaceholder")}</p>}
      </div>

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        className="w-full rounded-full bg-[#c8ff00] py-4 text-base font-bold text-[#111827] shadow-sm transition-all hover:shadow-[0_0_20px_rgba(200,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("lobby.joining") : t("lobby.joinLobby")}
      </motion.button>
    </form>
  );
}
