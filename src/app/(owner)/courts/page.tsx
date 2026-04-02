"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  RectangleHorizontal,
  ToggleLeft,
  ToggleRight,
  Clock,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/i18n";
import { formatPrice } from "@/lib/format";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { CourtWizard } from "@/components/owner/court-wizard";

// ─── Types ───────────────────────────────────────────────

interface Court {
  id: string;
  name: string;
  nameAr: string | null;
  pricePerHour: string;
  isActive: boolean;
  sortOrder: number;
  priceRules?: { dayGroup: string; startTime: string; endTime: string; pricePerHour: string }[];
  _count?: { priceRules: number };
}

type WizardState = { mode: "add" | "edit"; court?: Court } | null;

// ─── Court Card (Read-Only) ────────────────────────────

interface CourtCardProps {
  court: Court;
  slotCount: number;
  onEdit: (court: Court) => void;
  onToggleActive: (court: Court) => void;
}

function CourtCard({ court, slotCount, onEdit, onToggleActive }: CourtCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`bg-[#1a1a1a] border border-[#333] rounded-sm overflow-hidden transition-opacity ${
        !court.isActive ? "opacity-50" : ""
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Court icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-[#d4ff00]/15">
            <RectangleHorizontal size={22} className="text-[#d4ff00]" />
          </div>

          {/* Court info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base font-bold text-white truncate">
                {court.nameAr || court.name}
              </h3>
              {court.nameAr && (
                <span className="text-xs text-[#666] truncate" dir="ltr">
                  {court.name}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-[#999]">
              {(court._count?.priceRules ?? 0) > 0 && (
                <span className="text-[#d4ff00]/60 font-normal text-xs me-1">
                  {t("owner.from") || "من"}
                </span>
              )}
              {formatPrice(parseFloat(court.pricePerHour))}{" "}
              <span className="text-[#666] font-normal">
                {t("common.perHour")}
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => onEdit(court)}
              className="flex h-9 w-9 items-center justify-center rounded-sm text-[#666] hover:bg-[#222] hover:text-[#999] transition-colors cursor-pointer"
              aria-label={t("owner.editCourt")}
            >
              <Pencil size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => onToggleActive(court)}
              className="flex h-9 w-9 items-center justify-center rounded-sm text-[#666] hover:bg-[#222] transition-colors cursor-pointer"
              aria-label={court.isActive ? t("owner.active") : t("owner.inactive")}
            >
              {court.isActive ? (
                <ToggleRight size={26} className="text-green-500" />
              ) : (
                <ToggleLeft size={26} className="text-[#666]" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 mt-3">
          <span
            className={`inline-flex items-center gap-1 rounded-sm px-2.5 py-0.5 text-xs font-medium ${
              court.isActive
                ? "bg-green-500/10 text-green-400"
                : "bg-[#1a1a1a] text-[#666]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                court.isActive ? "bg-green-500" : "bg-white/30"
              }`}
            />
            {court.isActive ? t("owner.active") : t("owner.inactive")}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-sm px-2.5 py-0.5 text-xs font-medium ${
              slotCount > 0
                ? "bg-[#d4ff00]/10 text-[#d4ff00]"
                : "bg-[#1a1a1a] text-[#666]"
            }`}
          >
            <Clock size={11} />
            {slotCount > 0
              ? t("owner.scheduleSet") || "الجدول محدد"
              : t("owner.noSchedule") || "بدون جدول"}
          </span>

          {(court._count?.priceRules ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 rounded-sm px-2.5 py-0.5 text-xs font-medium bg-[#d4ff00]/10 text-[#d4ff00]">
              {court._count?.priceRules} {t("owner.addPriceRule")?.replace("إضافة ", "") || "قاعدة تسعير"}
            </span>
          )}
        </div>
      </div>

      {/* Edit button at bottom */}
      <div className="border-t border-[#222]">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onEdit(court)}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#d4ff00] hover:bg-[#222] transition-colors cursor-pointer"
        >
          <Pencil size={15} />
          {t("owner.editCourt")}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────

export default function CourtsPage() {
  const { t } = useTranslation();
  useAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [wizard, setWizard] = useState<WizardState>(null);

  const fetchCourts = useCallback(async () => {
    try {
      const venuesRes = await fetch("/api/venues?limit=1&mine=true");
      const venuesJson = await venuesRes.json();
      const ownerVenue = (venuesJson.data || [])[0];

      if (!ownerVenue) {
        setLoading(false);
        return;
      }

      setVenueId(ownerVenue.id);

      const courtsRes = await fetch(`/api/venues/${ownerVenue.id}/courts`);
      const courtsJson = await courtsRes.json();
      const fetchedCourts: Court[] = courtsJson.data || [];
      setCourts(fetchedCourts);

      // Fetch schedule info for all courts in parallel
      const counts: Record<string, number> = {};
      await Promise.all(
        fetchedCourts.map(async (court) => {
          try {
            const schedRes = await fetch(
              `/api/venues/${ownerVenue.id}/courts/${court.id}/schedule`
            );
            const schedJson = await schedRes.json();
            counts[court.id] = (schedJson.data || []).length;
          } catch {
            counts[court.id] = 0;
          }
        })
      );
      setSlotCounts(counts);
    } catch {
      // Network error — page will show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  const toggleActive = async (court: Court) => {
    if (!venueId) return;
    setCourts((prev) =>
      prev.map((c) =>
        c.id === court.id ? { ...c, isActive: !c.isActive } : c
      )
    );
    try {
      const res = await fetch(`/api/venues/${venueId}/courts/${court.id}`, {
        method: court.isActive ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: court.isActive ? undefined : JSON.stringify({ isActive: true }),
      });
      if (!res.ok) {
        setCourts((prev) =>
          prev.map((c) =>
            c.id === court.id ? { ...c, isActive: court.isActive } : c
          )
        );
      }
    } catch {
      setCourts((prev) =>
        prev.map((c) =>
          c.id === court.id ? { ...c, isActive: court.isActive } : c
        )
      );
    }
  };

  const handleWizardClose = () => {
    setWizard(null);
  };

  const handleWizardSaved = () => {
    setWizard(null);
    fetchCourts();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 pb-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-xl font-bold text-white">
            {t("owner.manageCourts")}
          </h1>
          {courts.length > 0 && (
            <p className="text-sm text-[#666] mt-0.5">
              {courts.length}{" "}
              {courts.length === 1 ? "court" : "courts"}
            </p>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setWizard({ mode: "add" })}
          className="flex items-center gap-1.5 rounded-sm bg-[#d4ff00] px-4 py-2.5 text-sm font-semibold text-[#0d0d0d] shadow-sm hover:bg-[#d4ff00]/80 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          {t("owner.addCourt")}
        </motion.button>
      </motion.div>

      {/* Courts list */}
      {courts.length === 0 ? (
        <EmptyState
          icon={<RectangleHorizontal size={28} />}
          title={t("venue.noCourts")}
          action={{
            label: t("owner.addCourt"),
            onClick: () => setWizard({ mode: "add" }),
          }}
        />
      ) : (
        <div className="space-y-4">
          {courts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              slotCount={slotCounts[court.id] || 0}
              onEdit={(c) => setWizard({ mode: "edit", court: c })}
              onToggleActive={toggleActive}
            />
          ))}
        </div>
      )}

      {/* Court wizard (add/edit) */}
      <AnimatePresence>
        {wizard && venueId && (
          <CourtWizard
            mode={wizard.mode}
            court={wizard.court}
            venueId={venueId}
            onClose={handleWizardClose}
            onSaved={handleWizardSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
