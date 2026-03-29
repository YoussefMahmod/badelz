"use client";

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
    <header className="sticky top-0 z-50 bg-[#0d0d0d] border-b-[3px] border-b-[#d4ff00]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="transition-opacity hover:opacity-80 cursor-pointer">
          <Logo size={32} variant="full" colorMode="dark" />
        </Link>

        <div className="flex items-center gap-2">
          <LocaleToggle />
          {isAuthenticated ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center justify-center rounded-sm h-9 w-9 text-[#666] hover:text-[#ff4d4d] hover:bg-[#1a1a1a] transition-colors"
              aria-label={t("auth.signOut")}
            >
              <LogOut size={18} />
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-sm bg-[#1a1a1a] border border-[#333] px-3.5 py-2 text-sm font-medium text-[#999] hover:border-[#d4ff00] hover:text-white transition-colors"
            >
              <LogIn size={15} />
              <span className="hidden sm:inline">{t("auth.signIn")}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
