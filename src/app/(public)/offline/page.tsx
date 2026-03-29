"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function OfflinePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-4">
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-sm bg-[#1a1a1a] border border-[#333] text-[#666]">
          <WifiOff className="h-7 w-7" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-white">
          {t("errors.offline")}
        </h1>
        <p className="mb-8 text-sm text-[#999] leading-relaxed">
          {t("errors.offlineDesc")}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 rounded-sm bg-[#d4ff00] px-6 py-3 text-sm font-bold text-[#0d0d0d] shadow-sm transition-all active:scale-[0.97] transition-transform duration-75"
        >
          <RefreshCw className="h-4 w-4" />
          {t("errors.tryAgain")}
        </button>
      </div>
    </div>
  );
}
