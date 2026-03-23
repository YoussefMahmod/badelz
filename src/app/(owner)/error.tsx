"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { scaleIn } from "@/lib/animations";
import { useTranslation } from "@/i18n";
import Link from "next/link";

export default function OwnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error("Owner dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <motion.div
        {...scaleIn}
        className="flex flex-col items-center text-center max-w-sm w-full"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-white">
          {t("errors.somethingWentWrong")}
        </h1>
        <p className="mb-8 text-sm text-white/50 leading-relaxed">
          {t("errors.unexpectedError")}
        </p>
        <div className="flex flex-col gap-3 w-full">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 rounded-full bg-[#c8ff00] px-6 py-3 text-sm font-bold text-[#111827] shadow-sm transition-all hover:shadow-[0_0_20px_rgba(200,255,0,0.2)]"
          >
            <RefreshCw className="h-4 w-4" />
            {t("errors.tryAgain")}
          </motion.button>
          <Link
            href="/owner/dashboard"
            className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors py-2"
          >
            <Home className="h-4 w-4" />
            {t("owner.dashboard")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
