"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/i18n";

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  const toggleLocale = () => {
    setLocale(locale === "ar" ? "en" : "ar");
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={toggleLocale}
      className="relative flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/10"
      aria-label={locale === "ar" ? "Switch to English" : "التبديل للعربية"}
    >
      <span className={locale === "en" ? "text-white" : "text-white/40"}>
        EN
      </span>
      <span className="text-white/20">|</span>
      <span className={locale === "ar" ? "text-white" : "text-white/40"}>
        عر
      </span>
    </motion.button>
  );
}
