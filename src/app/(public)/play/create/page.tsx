"use client";

import { useState, useMemo, useEffect } from "react";
import { track } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  AlertCircle,
  Banknote,
  CheckCircle,
  Gauge,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation, useLocale } from "@/i18n";
import { useAuth } from "@/lib/auth-context";
import { AREAS, LOBBY_LEVELS } from "@/lib/constants";
import { getNext7Days, toDateString } from "@/lib/format";
import { slideUp } from "@/lib/animations";

function isValidEgyptPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^01[0125]\d{8}$/.test(cleaned);
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 6; h <= 23; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  // After midnight: 00:00 - 02:00
  for (let h = 0; h <= 1; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  slots.push("02:00");
  return slots;
}

function formatSlotTime(slot: string): string {
  const [hours, minutes] = slot.split(":").map(Number);
  const period = hours >= 12 ? "\u0645" : "\u0635";
  const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${h}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export default function CreateLobbyPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [area, setArea] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [level, setLevel] = useState("");
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    area: false,
    date: false,
    name: false,
    phone: false,
  });

  // Auto-fill from authenticated user
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.name && !name) setName(user.name);
      if (user.phone && !phone) setPhone(user.phone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const next7Days = useMemo(() => getNext7Days(), []);
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const filteredAreas = useMemo(
    () => AREAS.filter((a) => a.key !== "all"),
    []
  );

  const areaError = touched.area && !area;
  const dateError = touched.date && !date;
  const nameError = touched.name && !name.trim();
  const phoneError = touched.phone && !isValidEgyptPhone(phone);
  const isValid = area && date && name.trim() && isValidEgyptPhone(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setTouched({ area: true, date: true, name: true, phone: true });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/lobbies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area,
          date,
          startTime: time || undefined,
          priceRange: priceRange || undefined,
          level: level || undefined,
          note: note || undefined,
          hostName: name.trim(),
          hostPhone: phone.replace(/\D/g, ""),
        }),
      });
      const json = await res.json();
      if (res.ok && json.data?.lobbyCode) {
        if (typeof window !== "undefined") {
          localStorage.setItem("badelz-player-phone", phone.replace(/\D/g, ""));
        }
        track.lobbyCreated({ area, date });
        router.push(`/lobby/${json.data.lobbyCode}`);
      } else {
        setError(json.message || t("common.error"));
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDayChip = (d: Date) => {
    const dayName = new Intl.DateTimeFormat(
      locale === "ar" ? "ar-EG" : "en-US",
      { weekday: "short" }
    ).format(d);
    const dayNum = d.getDate();
    const monthName = new Intl.DateTimeFormat(
      locale === "ar" ? "ar-EG" : "en-US",
      { month: "short" }
    ).format(d);
    return { dayName, dayNum, monthName };
  };

  const inputCls =
    "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-4 text-base text-white outline-none placeholder:text-white/30 transition-all focus:border-[#c8ff00]/50 focus:ring-2 focus:ring-[#c8ff00]/30";
  const inputErrorCls =
    "w-full rounded-xl bg-red-500/5 border border-red-500/30 px-4 py-4 text-base text-white outline-none placeholder:text-white/30 ring-2 ring-red-500/20";
  const labelCls =
    "mb-2 flex items-center gap-2 text-sm font-semibold text-white/80";

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-white/5">
        <div className="mx-auto max-w-2xl flex items-center gap-3 px-4 py-4">
          <Link
            href="/play"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ArrowRight size={18} className="rtl:rotate-0 ltr:rotate-180" />
          </Link>
          <h1 className="text-xl font-bold text-white">
            {t("lobby.createLobby")}
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl px-4 py-6 space-y-6"
      >
        {/* Server error */}
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

        {/* Area selection */}
        <motion.div {...slideUp}>
          <label className={labelCls}>
            <MapPin size={15} className="text-white/40" />
            {t("lobby.selectArea")}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredAreas.map((a) => {
              const isSelected = area === a.key;
              const label = locale === "ar" ? a.labelAr : a.labelEn;
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => {
                    setArea(a.key);
                    setTouched((p) => ({ ...p, area: true }));
                  }}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-[#c8ff00] text-[#111827] shadow-sm"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {areaError && (
            <p className="mt-1.5 text-xs text-red-400">
              {t("common.required")}
            </p>
          )}
        </motion.div>

        {/* Date selection */}
        <motion.div {...slideUp} transition={{ delay: 0.05 }}>
          <label className={labelCls}>
            <Calendar size={15} className="text-white/40" />
            {t("lobby.selectDate")}
          </label>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {next7Days.map((d) => {
              const dateStr = toDateString(d);
              const isSelected = date === dateStr;
              const { dayName, dayNum, monthName } = formatDayChip(d);

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    setDate(dateStr);
                    setTouched((p) => ({ ...p, date: true }));
                  }}
                  className={`shrink-0 flex flex-col items-center rounded-2xl px-4 py-3 transition-all ${
                    isSelected
                      ? "bg-[#c8ff00] text-[#111827] shadow-sm"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <span className="text-[10px] font-medium">{dayName}</span>
                  <span className="text-lg font-bold">{dayNum}</span>
                  <span className="text-[10px]">{monthName}</span>
                </button>
              );
            })}
          </div>
          {dateError && (
            <p className="mt-1.5 text-xs text-red-400">
              {t("common.required")}
            </p>
          )}
        </motion.div>

        {/* Time (optional) */}
        <motion.div {...slideUp} transition={{ delay: 0.1 }}>
          <label className={labelCls}>
            <Clock size={15} className="text-white/40" />
            {t("lobby.selectTime")}
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`${inputCls} appearance-none`}
          >
            <option value="" className="bg-[#111827]">
              {t("lobby.optional")}
            </option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot} className="bg-[#111827]">
                {formatSlotTime(slot)}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Price range (optional) */}
        <motion.div {...slideUp} transition={{ delay: 0.15 }}>
          <label className={labelCls}>
            <Banknote size={15} className="text-white/40" />
            {t("lobby.priceRange")}
            <span className="text-white/30 text-xs font-normal">
              ({t("lobby.optional")})
            </span>
          </label>
          <input
            type="text"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder={t("lobby.priceRangePlaceholder")}
            dir="ltr"
            className={`${inputCls} text-start`}
          />
        </motion.div>

        {/* Level (optional) */}
        <motion.div {...slideUp} transition={{ delay: 0.175 }}>
          <label className={labelCls}>
            <Gauge size={15} className="text-white/40" />
            {t("lobby.level")}
            <span className="text-white/30 text-xs font-normal">
              ({t("lobby.optional")})
            </span>
          </label>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setLevel("")}
              className={`shrink-0 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                level === ""
                  ? "bg-[#c8ff00] text-[#111827] shadow-sm"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90"
              }`}
            >
              {t("lobby.anyLevel")}
            </button>
            {LOBBY_LEVELS.map((lvl) => {
              const isSelected = level === lvl.key;
              const label = locale === "ar" ? lvl.labelAr : lvl.labelEn;
              return (
                <button
                  key={lvl.key}
                  type="button"
                  onClick={() => setLevel(lvl.key)}
                  className={`shrink-0 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-[#c8ff00] text-[#111827] shadow-sm"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Note (optional) */}
        <motion.div {...slideUp} transition={{ delay: 0.225 }}>
          <label className={labelCls}>
            <FileText size={15} className="text-white/40" />
            {t("lobby.note")}
            <span className="text-white/30 text-xs font-normal">
              ({t("lobby.optional")})
            </span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("lobby.notePlaceholder")}
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </motion.div>

        {/* Divider */}
        <div className="border-t border-white/5" />

        {/* Logged in badge */}
        {isAuthenticated && user?.name && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
            <CheckCircle size={14} className="text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-400 font-medium">
              {t("nudge.loggedInAs", { name: user.name })}
            </span>
          </div>
        )}

        {/* Name */}
        <motion.div {...slideUp} transition={{ delay: 0.275 }}>
          <label className={labelCls}>
            <User size={15} className="text-white/40" />
            {t("lobby.yourName")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, name: true }))}
            placeholder={t("lobby.namePlaceholder")}
            className={nameError ? inputErrorCls : inputCls}
            disabled={submitting}
          />
          {nameError && (
            <p className="mt-1.5 text-xs text-red-400">
              {t("common.required")}
            </p>
          )}
        </motion.div>

        {/* Phone */}
        <motion.div {...slideUp} transition={{ delay: 0.325 }}>
          <label className={labelCls}>
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
            className={`${phoneError ? inputErrorCls : inputCls} text-start`}
            disabled={submitting}
          />
          {phoneError && (
            <p className="mt-1.5 text-xs text-red-400">
              {t("lobby.phonePlaceholder")}
            </p>
          )}
        </motion.div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={submitting}
          className="w-full rounded-full bg-[#c8ff00] py-4 text-base font-bold text-[#111827] shadow-lg shadow-[#c8ff00]/20 transition-all hover:shadow-[0_0_30px_rgba(200,255,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t("lobby.creating") : t("lobby.createLobby")}
        </motion.button>
      </form>
    </div>
  );
}
