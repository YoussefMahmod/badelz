"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Check,
  Circle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  PartyPopper,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/i18n";

interface ChecklistItem {
  id: string;
  completed: boolean;
  href?: string;
}

interface ChecklistData {
  items: ChecklistItem[];
  completed: number;
  total: number;
}

// Map item IDs to i18n keys
const ITEM_LABEL_KEYS: Record<string, string> = {
  // Owner
  createAccount: "checklist.createAccount",
  addVenueInfo: "checklist.addVenueInfo",
  addFirstCourt: "checklist.addFirstCourt",
  setupTimeSlots: "checklist.setupTimeSlots",
  getFirstBooking: "checklist.getFirstBooking",
  // Player
  selectArea: "checklist.selectArea",
  bookFirstCourt: "checklist.bookFirstCourt",
  playFirstGame: "checklist.playFirstGame",
  reachGold: "checklist.reachGold",
  // Coach
  setupProfile: "checklist.setupProfile",
  addBio: "checklist.addBio",
  setPricing: "checklist.setPricing",
  getFirstContact: "checklist.getFirstContact",
};

export function OnboardingBanner() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [data, setData] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const fetchChecklist = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding/checklist");
      const json = await res.json();
      if (res.ok && json.data) {
        setData(json.data);
      }
    } catch {
      // Silently fail -- checklist is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchChecklist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchChecklist]);

  // Don't render if not authenticated, loading, no data, or dismissed
  if (!isAuthenticated || !user || loading || !data) return null;

  const allDone = data.completed === data.total;
  const progressPercent = Math.round((data.completed / data.total) * 100);

  // Find first incomplete item (the "active" one)
  const activeItem = data.items.find((item) => !item.completed);

  // All done -- show celebration that auto-dismisses
  if (allDone) {
    if (dismissed) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        onAnimationComplete={() => {
          // Auto-dismiss after 4 seconds
          const timer = setTimeout(() => setDismissed(true), 4000);
          return () => clearTimeout(timer);
        }}
        className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
            <PartyPopper size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white/90">
              {t("checklist.allDone")}
            </p>
            <p className="text-sm text-white/50 mt-0.5">
              {t("checklist.allDoneDesc")}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 overflow-hidden"
    >
      {/* Header -- clickable to collapse/expand */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="w-full flex items-center justify-between p-5 pb-0"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
            <Rocket size={20} className="text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-white/90">
            {t("checklist.title")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            {data.completed}/{data.total} {t("checklist.done")}
          </span>
          {collapsed ? (
            <ChevronDown size={16} className="text-white/40" />
          ) : (
            <ChevronUp size={16} className="text-white/40" />
          )}
        </div>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="px-5 pt-4 pb-5">
              {/* Checklist items */}
              <div className="space-y-2.5 mb-4">
                {data.items.map((item, index) => {
                  const isActive = activeItem?.id === item.id;
                  const labelKey = ITEM_LABEL_KEYS[item.id];
                  const label = labelKey ? t(labelKey as "checklist.createAccount") : item.id;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Check / Circle icon */}
                        {item.completed ? (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                            <Check size={14} className="text-emerald-400" />
                          </div>
                        ) : (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20">
                            <Circle size={10} className="text-white/20" />
                          </div>
                        )}
                        {/* Label */}
                        <span
                          className={`text-sm truncate ${
                            item.completed
                              ? "text-white/40 line-through"
                              : "text-white/90"
                          }`}
                        >
                          {label}
                        </span>
                      </div>

                      {/* Go button for active item */}
                      {isActive && item.href && (
                        <Link
                          href={item.href}
                          className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-3 py-1 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25 active:scale-[0.96]"
                        >
                          {t("checklist.go")}
                          <ArrowRight size={12} />
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="relative h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
                  className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                />
              </div>
              <p className="text-[11px] text-white/30 mt-1.5 text-end">
                {progressPercent}%
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed: still show progress bar */}
      {collapsed && (
        <div className="px-5 pt-3 pb-4">
          <div className="relative h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
