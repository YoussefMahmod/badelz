"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, MapPin, Share2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { CoachCard } from "@/components/cards/coach-card";
import { useTranslation, useLocale } from "@/i18n";
import { AREAS } from "@/lib/constants";
import { buildCoachContactLink } from "@/lib/whatsapp";
import { slideUp } from "@/lib/animations";

interface CoachDetail {
  id: string;
  name: string;
  nameAr?: string | null;
  photo?: string | null;
  phone: string;
  whatsapp?: string | null;
  areas: string[];
  areasAr?: string[];
  pricePerHour?: number | string | null;
  experience?: string | null;
  bio?: string | null;
  rating?: number | string;
}

export default function CoachProfilePage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const params = useParams();
  const coachId = params.id as string;

  const [coach, setCoach] = useState<CoachDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCoach() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/coaches/${coachId}`);
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        setCoach(json.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCoach();
  }, [coachId]);

  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  const handleShare = async () => {
    if (!coach) return;
    const url = `${window.location.origin}/coaches/${coach.id}`;
    const displayName = locale === "ar" && coach.nameAr ? coach.nameAr : coach.name;
    const text = `${displayName} - ${t("coach.proCoach")} | ${t("common.appName")}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const getAreaLabel = (areaKey: string): string => {
    const area = AREAS.find((a) => a.key === areaKey);
    if (!area) return areaKey;
    return locale === "ar" ? area.labelAr : area.labelEn;
  };

  return (
    <MainLayout showNav={false}>
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: locale === "ar" ? 10 : -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <BackIcon size={18} />
          <span className="text-sm">{t("common.back")}</span>
        </motion.button>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-72 card-ratio rounded-2xl animate-pulse bg-white/5 border border-white/10" />
            <div className="w-full space-y-4">
              <div className="h-20 rounded-2xl dark-skeleton" />
              <div className="h-12 rounded-2xl dark-skeleton" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40">
              <MapPin size={28} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{t("common.error")}</h3>
            <p className="text-sm text-white/50 mb-6">{t("common.noResults")}</p>
            <button
              onClick={() => router.push("/coaches")}
              className="rounded-full bg-[#c8ff00] px-6 py-2.5 text-sm font-bold text-[#111827]"
            >
              {t("coach.directory")}
            </button>
          </div>
        )}

        {/* Coach profile */}
        {coach && !loading && (
          <div className="flex flex-col items-center gap-6">
            {/* Large coach card */}
            <motion.div {...slideUp}>
              <CoachCard coach={coach} size="lg" interactive />
            </motion.div>

            {/* Bio section */}
            {coach.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="w-full glass-dark rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">
                  {t("coach.bio")}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {coach.bio}
                </p>
              </motion.div>
            )}

            {/* Areas */}
            {coach.areas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full glass-dark rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
                  {t("coach.areas")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {coach.areas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/20 px-3 py-1.5 text-xs font-medium text-[#c8ff00]"
                    >
                      <MapPin size={10} />
                      {getAreaLabel(area)}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Experience details */}
            {coach.experience && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="w-full glass-dark rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">
                  {t("coach.experience")}
                </h3>
                <p className="text-white/80 text-sm">{coach.experience}</p>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full flex flex-col gap-3 pb-6"
            >
              {/* WhatsApp CTA */}
              <a
                href={buildCoachContactLink({
                  coachName: coach.name,
                  phone: coach.whatsapp || coach.phone,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-full bg-green-500 py-4 text-base font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.664-1.388A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.352 0-4.556-.764-6.34-2.088l-.144-.108-3.489 1.04 1.072-3.377-.12-.151A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                {t("coach.contactCoach")}
              </a>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 w-full rounded-full border border-white/10 py-3.5 text-sm font-semibold text-white/70 transition-all hover:bg-white/5 hover:text-white active:scale-[0.98]"
              >
                <Share2 size={16} />
                {t("landing.share")}
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
