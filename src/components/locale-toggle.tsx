"use client";

import { useLocale } from "@/i18n";

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  const toggleLocale = () => {
    setLocale(locale === "ar" ? "en" : "ar");
  };

  return (
    <button
      onClick={toggleLocale}
      className="relative flex items-center gap-1 rounded-sm border border-[#333] bg-[#1a1a1a] px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#222] active:scale-[0.97] transition-transform duration-75"
      aria-label={locale === "ar" ? "Switch to English" : "التبديل للعربية"}
    >
      <span className={locale === "en" ? "text-white" : "text-[#666]"}>
        EN
      </span>
      <span className="text-[#333]">|</span>
      <span className={locale === "ar" ? "text-white" : "text-[#666]"}>
        عر
      </span>
    </button>
  );
}
