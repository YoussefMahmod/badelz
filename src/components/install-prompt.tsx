"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { useTranslation } from "@/i18n";

export function InstallPrompt() {
  const { t } = useTranslation();
  const { canInstall, install, dismiss } = useInstallPrompt();
  const [loading, setLoading] = useState(false);

  const handleInstall = async () => {
    setLoading(true);
    await install();
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-24 inset-x-4 z-50 max-w-lg mx-auto"
        >
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl">
            <button
              onClick={dismiss}
              className="absolute top-3 end-3 text-white/40 hover:text-white/70 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#c8ff00]/15 flex items-center justify-center">
                <Download size={20} className="text-[#c8ff00]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white/90 mb-0.5">
                  {t("install.title")}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  {t("install.desc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                disabled={loading}
                className="flex-1 py-2 rounded-xl bg-[#c8ff00] text-[#111827] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "..." : t("install.button")}
              </button>
              <button
                onClick={dismiss}
                className="px-4 py-2 rounded-xl text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                {t("install.notNow")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
