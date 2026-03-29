"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useTranslation } from "@/i18n";
import { MainLayout } from "@/components/main-layout";
import Link from "next/link";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    // Error logged server-side; no client console output
  }, [error]);

  return (
    <MainLayout showNav navType="public">
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="flex flex-col items-center text-center max-w-sm w-full">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-sm bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-white">
            {t("errors.somethingWentWrong")}
          </h1>
          <p className="mb-8 text-sm text-[#999] leading-relaxed">
            {t("errors.unexpectedError")}
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 rounded-sm bg-[#d4ff00] px-6 py-3 text-sm font-bold text-[#0d0d0d] shadow-sm transition-all active:scale-[0.97] transition-transform duration-75"
            >
              <RefreshCw className="h-4 w-4" />
              {t("errors.tryAgain")}
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-[#999] hover:text-[#999] transition-colors py-2"
            >
              <Home className="h-4 w-4" />
              {t("errors.goHome")}
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
