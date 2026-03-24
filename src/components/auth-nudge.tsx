"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/i18n";

interface AuthNudgeProps {
  title: string;
  description: string;
  returnTo?: string;
  prefillPhone?: string;
  prefillRole?: string;
  /** "dark" for public dark-themed pages, "light" for white-bg pages */
  variant?: "dark" | "light";
}

function buildRegisterUrl({
  returnTo,
  prefillPhone,
  prefillRole,
}: Pick<AuthNudgeProps, "returnTo" | "prefillPhone" | "prefillRole">): string {
  const params = new URLSearchParams();
  if (returnTo) params.set("returnTo", returnTo);
  if (prefillPhone) params.set("phone", prefillPhone);
  if (prefillRole) params.set("role", prefillRole);
  const qs = params.toString();
  return `/register${qs ? `?${qs}` : ""}`;
}

export function AuthNudge({
  title,
  description,
  returnTo,
  prefillPhone,
  prefillRole,
  variant = "dark",
}: AuthNudgeProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  // Don't render for authenticated users or while loading
  if (isLoading || isAuthenticated || dismissed) return null;

  const href = buildRegisterUrl({ returnTo, prefillPhone, prefillRole });

  const isDark = variant === "dark";

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, height: 0, marginTop: 0 }}
          transition={{ duration: 0.3 }}
          className={`relative rounded-xl p-4 ${
            isDark
              ? "bg-white/5 backdrop-blur-sm border border-white/10"
              : "bg-gray-50 border border-gray-200"
          }`}
        >
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className={`absolute top-3 end-3 flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
              isDark
                ? "text-white/30 hover:text-white/60 hover:bg-white/10"
                : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
            }`}
            aria-label={t("nudge.dismiss")}
          >
            <X size={14} />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pe-6">
            {/* Icon */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isDark
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <UserPlus size={20} />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  isDark ? "text-white/80" : "text-gray-700"
                }`}
              >
                {title}
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                {description}
              </p>
            </div>

            {/* CTA */}
            <Link
              href={href}
              className="shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-medium text-white transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.97]"
            >
              {t("nudge.createFreeAccount")}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
