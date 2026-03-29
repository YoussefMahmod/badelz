"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import { useTranslation } from "@/i18n";
import { getPlayerPreferences } from "@/lib/player-preferences";

const DISMISSED_KEY = "badelz-notification-dismissed";

interface NotificationPromptProps {
  phone?: string;
  area?: string;
}

export function NotificationPrompt({ phone, area }: NotificationPromptProps) {
  const { t } = useTranslation();
  const { isSupported, permission, subscribe } = usePushSubscription();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    if (permission !== "default") return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    // Show after a short delay so it doesn't feel jarring
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [isSupported, permission]);

  const handleEnable = async () => {
    setLoading(true);
    const prefs = getPlayerPreferences();
    const subArea = area || prefs.detectedArea || prefs.area;
    const success = await subscribe(phone, subArea);
    setLoading(false);
    if (success) {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-28 inset-x-4 z-50 max-w-lg mx-auto"
        >
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl">
            <button
              onClick={handleDismiss}
              className="absolute top-3 end-3 text-white/40 hover:text-white/70 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Bell size={20} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white/90 mb-0.5">
                  {t("notifications.enableTitle")}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  {t("notifications.enableDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleEnable}
                disabled={loading}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "..." : t("notifications.enable")}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-xl text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                {t("notifications.notNow")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
