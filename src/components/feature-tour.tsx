"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  Users,
  GraduationCap,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";

const TOUR_KEY = "badelz-tour-v1";

const STEPS = [
  { icon: Sparkles, color: "#34d399", titleKey: "tour.step1Title", descKey: "tour.step1Desc" },
  { icon: Search, color: "#34d399", titleKey: "tour.step2Title", descKey: "tour.step2Desc" },
  { icon: Users, color: "#c8ff00", titleKey: "tour.step3Title", descKey: "tour.step3Desc" },
  { icon: GraduationCap, color: "#c084fc", titleKey: "tour.step4Title", descKey: "tour.step4Desc" },
  { icon: ShoppingBag, color: "#fbbf24", titleKey: "tour.step5Title", descKey: "tour.step5Desc" },
] as const;

export function FeatureTour() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const close = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "1");
    setVisible(false);
  }, []);

  const next = useCallback(() => {
    if (step === STEPS.length - 1) {
      close();
    } else {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step, close]);

  const prev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const isRTL = locale === "ar";
  const slideDir = isRTL ? -direction : direction;
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0d0d0d]/95 backdrop-blur-sm" />

          {/* Content */}
          <div className="relative z-10 w-full max-w-sm mx-auto px-6 flex flex-col items-center">
            {/* Skip */}
            <button
              onClick={close}
              className="absolute top-0 end-6 text-white/40 text-sm hover:text-white/70 transition-colors"
            >
              {t("tour.skip")}
            </button>

            {/* Slide */}
            <AnimatePresence mode="wait" custom={slideDir}>
              <motion.div
                key={step}
                custom={slideDir}
                initial={{ opacity: 0, x: slideDir * 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDir * -80 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex flex-col items-center text-center mt-16"
              >
                {/* Icon with glow */}
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8"
                  style={{
                    background: `${current.color}15`,
                    boxShadow: `0 0 60px ${current.color}20, 0 0 120px ${current.color}10`,
                  }}
                >
                  <Icon size={44} style={{ color: current.color }} />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-3">
                  {t(current.titleKey as Parameters<typeof t>[0])}
                </h2>

                {/* Description */}
                <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                  {t(current.descKey as Parameters<typeof t>[0])}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex items-center gap-2 mt-12">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 24 : 8,
                    height: 8,
                    background: i === step ? current.color : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-10 w-full">
              {step > 0 ? (
                <button
                  onClick={prev}
                  className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-colors"
                >
                  {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
              ) : (
                <div className="w-12" />
              )}

              <button
                onClick={next}
                className="flex-1 h-12 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
                style={{
                  background: isLast ? current.color : "rgba(255,255,255,0.08)",
                  color: isLast ? "#111827" : "rgba(255,255,255,0.8)",
                  border: isLast ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {isLast ? t("tour.done") : t("tour.next")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
