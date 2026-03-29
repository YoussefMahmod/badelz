"use client";

import { MapPinOff, Search } from "lucide-react";
import { useTranslation } from "@/i18n";
import { MainLayout } from "@/components/main-layout";
import Link from "next/link";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <MainLayout showNav navType="public">
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="flex flex-col items-center text-center max-w-sm w-full">
          <div className="mb-6 text-8xl font-display font-bold bg-gradient-to-r from-[#d4ff00] to-emerald-400 bg-clip-text text-transparent select-none">
            404
          </div>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-sm bg-[#1a1a1a] border border-[#333] text-[#666]">
            <MapPinOff className="h-7 w-7" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-white">
            {t("errors.pageNotFound")}
          </h1>
          <p className="mb-8 text-sm text-[#999] leading-relaxed">
            {t("errors.pageNotFoundDesc")}
          </p>
          <div className="flex flex-col gap-3 w-full">
            <Link href="/browse">
              <div className="flex items-center justify-center gap-2 rounded-sm bg-[#d4ff00] px-6 py-3 text-sm font-bold text-[#0d0d0d] shadow-sm transition-all cursor-pointer active:scale-[0.97] transition-transform duration-75">
                <Search className="h-4 w-4" />
                {t("errors.backToBrowse")}
              </div>
            </Link>
            <Link
              href="/"
              className="text-sm text-[#999] hover:text-[#999] transition-colors py-2"
            >
              {t("errors.goHome")}
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
