"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Users, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { CoachCard } from "@/components/cards/coach-card";
import { EmptyState } from "@/components/empty-state";
import { useTranslation, useLocale } from "@/i18n";
import { AREAS } from "@/lib/constants";
import { revealUp, staggerItem } from "@/lib/animations";

interface CoachData {
  id: string;
  name: string;
  nameAr?: string | null;
  photo?: string | null;
  areas: string[];
  areasAr?: string[];
  pricePerHour?: number | string | null;
  experience?: string | null;
  heartCount?: number;
}

export default function CoachesClient() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();

  const [selectedArea, setSelectedArea] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("hearts");
  const [coaches, setCoaches] = useState<CoachData[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    const timeout = setTimeout(() => setDebouncedSearch(value), 400);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCoaches() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedArea !== "all") params.set("area", selectedArea);
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (sortBy) params.set("sort", sortBy);

        const res = await fetch(`/api/coaches?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setCoaches(json.data ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setCoaches([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCoaches();
    return () => controller.abort();
  }, [selectedArea, debouncedSearch, sortBy]);

  const skeletons = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex justify-center">
          <div className="w-full max-w-sm card-ratio rounded-2xl overflow-hidden animate-pulse bg-white/5 border border-white/10">
            <div className="h-full p-3 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full dark-skeleton" />
              <div className="h-4 w-3/4 rounded-lg dark-skeleton" />
              <div className="h-3 w-1/2 rounded-lg dark-skeleton" />
            </div>
          </div>
        </div>
      )),
    []
  );

  return (
    <MainLayout showNav navType="public">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Page title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-bold text-white mb-6"
        >
          {t("coach.title")}
        </motion.h1>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-5"
        >
          <Search size={20} className="absolute start-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("common.search")}
            className="w-full rounded-full bg-white/5 border border-white/10 ps-12 pe-4 py-4 text-base text-white outline-none placeholder:text-white/30 focus:border-[#c8ff00]/50 focus:ring-2 focus:ring-[#c8ff00]/30 transition-all"
          />
        </motion.div>

        {/* Area chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative flex gap-2 overflow-x-auto hide-scrollbar pb-5"
        >
          {AREAS.map((area) => {
            const isSelected = selectedArea === area.key;
            const label = locale === "ar" ? area.labelAr : area.labelEn;
            return (
              <button
                key={area.key}
                onClick={() => setSelectedArea(area.key)}
                className={`shrink-0 relative flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "text-[#111827] shadow-sm"
                    : "border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="coach-area-chip"
                    className="absolute inset-0 rounded-full bg-[#c8ff00]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {area.key !== "all" && <MapPin size={12} />}
                  {label}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Sort pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto hide-scrollbar">
          {(["hearts", "newest", "name", "price"] as const).map((s) => {
            const labels: Record<string, string> = {
              hearts: t("coach.sortHearts"),
              newest: t("common.newest"),
              name: t("common.name"),
              price: t("common.price"),
            };
            const isActive = sortBy === s;
            return (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#c8ff00] text-[#111827] shadow-sm shadow-[#c8ff00]/20"
                    : "bg-white/5 border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.08]"
                }`}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {skeletons}
          </div>
        ) : coaches.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title={t("coach.noCoaches")}
            description={t("coach.noCoachesDesc")}
            action={{
              label:
                selectedArea !== "all"
                  ? locale === "ar"
                    ? AREAS[0].labelAr
                    : AREAS[0].labelEn
                  : t("coach.register"),
              onClick: () => {
                if (selectedArea !== "all") {
                  setSelectedArea("all");
                  setSearchQuery("");
                  setDebouncedSearch("");
                } else {
                  router.push("/coaches/register");
                }
              },
            }}
          />
        ) : (
          <motion.div
            {...revealUp}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {coaches.map((coach, i) => (
                <motion.div
                  key={coach.id}
                  {...staggerItem}
                  transition={{ delay: i * 0.05 }}
                >
                  <CoachCard
                    coach={coach}
                    onClick={() => router.push(`/coaches/${coach.id}`)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Fixed CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-28 sm:bottom-6 inset-x-0 z-30 flex justify-center px-4 pointer-events-none"
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/coaches/register")}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#c8ff00] px-6 py-3.5 text-sm font-bold text-[#111827] shadow-lg shadow-[#c8ff00]/20 transition-all hover:shadow-[0_0_30px_rgba(200,255,0,0.3)]"
        >
          <UserPlus size={18} />
          {t("coach.register")}
        </motion.button>
      </motion.div>
    </MainLayout>
  );
}
