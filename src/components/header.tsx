"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LogIn, CreditCard } from "lucide-react";
import { LocaleToggle } from "./locale-toggle";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [hasCard, setHasCard] = useState(false);
  const [cardPhone, setCardPhone] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("badelz-player-phone");
      if (stored) {
        setHasCard(true);
        setCardPhone(stored);
      }
    }
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/5"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        <Link
          href="/"
          className="text-lg font-bold text-white tracking-tight"
        >
          {t("common.appName")}
        </Link>

        <div className="flex items-center gap-3">
          {hasCard && (
            <Link
              href={`/my-card?phone=${cardPhone}`}
              className="flex items-center gap-1.5 text-[#c8ff00] hover:text-[#c8ff00]/80 transition-colors"
              aria-label={t("player.myCard")}
            >
              <CreditCard size={20} />
              <span className="hidden sm:inline text-sm font-semibold">
                {t("player.myCard")}
              </span>
            </Link>
          )}
          <LocaleToggle />
          {isAuthenticated && user?.role === "VENUE_OWNER" ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
            >
              {t("nav.dashboard")}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors"
              >
                <LogIn size={15} />
                {t("auth.signIn")}
              </Link>
              <Link
                href="/browse"
                className="rounded-full bg-[#c8ff00] px-4 py-1.5 text-sm font-bold text-[#111827] transition-all hover:shadow-[0_0_20px_rgba(200,255,0,0.25)] active:scale-95"
              >
                {t("nav.browse")}
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
