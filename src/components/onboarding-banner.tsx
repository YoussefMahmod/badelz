"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/i18n";

export function OnboardingBanner() {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user || user.isOnboarded) return null;

  const description =
    user.role === "VENUE_OWNER"
      ? t("onboarding.bannerOwnerDesc")
      : user.role === "COACH"
        ? t("onboarding.bannerCoachDesc")
        : t("onboarding.bannerPlayerDesc");

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon + text */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
            <Sparkles size={20} className="text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white/90">
              {t("onboarding.bannerTitle")}
            </p>
            <p className="text-sm text-white/50 mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/onboarding"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 active:scale-[0.98] shrink-0"
        >
          {t("onboarding.bannerCta")}
        </Link>
      </div>
    </div>
  );
}
