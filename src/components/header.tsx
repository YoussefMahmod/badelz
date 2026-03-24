"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { LocaleToggle } from "./locale-toggle";
import { Logo } from "./logo";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="transition-opacity hover:opacity-80 cursor-pointer">
          <Logo size={32} variant="full" colorMode="dark" />
        </Link>

        <div className="flex items-center gap-2">
          <LocaleToggle />
          {isAuthenticated ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center justify-center rounded-full h-9 w-9 text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors"
              aria-label={t("auth.signOut")}
            >
              <LogOut size={18} />
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3.5 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogIn size={15} />
              <span className="hidden sm:inline">{t("auth.signIn")}</span>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
