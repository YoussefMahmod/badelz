"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";
import { scaleIn } from "@/lib/animations";
import { useTranslation } from "@/i18n";

export default function OfflinePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] px-4">
      <motion.div
        {...scaleIn}
        className="flex flex-col items-center text-center max-w-sm w-full"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40">
          <WifiOff className="h-7 w-7" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-white">
          {t("errors.offline")}
        </h1>
        <p className="mb-8 text-sm text-white/50 leading-relaxed">
          {t("errors.offlineDesc")}
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 rounded-full bg-[#c8ff00] px-6 py-3 text-sm font-bold text-[#111827] shadow-sm transition-all hover:shadow-[0_0_20px_rgba(200,255,0,0.2)]"
        >
          <RefreshCw className="h-4 w-4" />
          {t("errors.tryAgain")}
        </motion.button>
      </motion.div>
    </div>
  );
}
