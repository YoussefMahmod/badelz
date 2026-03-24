"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Phone,
  MessageCircle,
  Save,
  CheckCircle,
  Crosshair,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { slideUp } from "@/lib/animations";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AREAS } from "@/lib/constants";

interface VenueSettings {
  id: string;
  name: string;
  nameAr: string | null;
  address: string;
  addressAr: string | null;
  city: string;
  cityAr: string | null;
  phone: string;
  whatsapp: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [venue, setVenue] = useState<VenueSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedAreaName, setDetectedAreaName] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    nameAr: "",
    address: "",
    addressAr: "",
    city: "",
    cityAr: "",
    phone: "",
    whatsapp: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  useEffect(() => {
    async function fetchVenue() {
      try {
        const res = await fetch("/api/venues?limit=1&mine=true");
        const json = await res.json();
        const v = json.data?.[0];
        if (v) {
          setVenue(v);
          setForm({
            name: v.name || "",
            nameAr: v.nameAr || "",
            address: v.address || "",
            addressAr: v.addressAr || "",
            city: v.city || "",
            cityAr: v.cityAr || "",
            phone: v.phone || "",
            whatsapp: v.whatsapp || "",
            latitude: v.latitude ?? null,
            longitude: v.longitude ?? null,
          });
        }
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    }
    fetchVenue();
  }, []);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleDetectLocation = () => {
    setDetectingLocation(true);
    setDetectedAreaName(null);
    try {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            let minDist = Infinity;
            let nearest: (typeof AREAS)[number] = AREAS[1];
            for (const area of AREAS) {
              if (area.key === "all") continue;
              const R = 6371;
              const dLat = ((area.lat - latitude) * Math.PI) / 180;
              const dLng = ((area.lng - longitude) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos((latitude * Math.PI) / 180) *
                  Math.cos((area.lat * Math.PI) / 180) *
                  Math.sin(dLng / 2) ** 2;
              const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              if (dist < minDist) {
                minDist = dist;
                nearest = area;
              }
            }

            setForm((prev) => ({
              ...prev,
              latitude,
              longitude,
              city: nearest.labelEn,
              cityAr: nearest.labelAr,
            }));
            setDetectedAreaName(nearest.labelEn);
            setSaved(false);
            setDetectingLocation(false);
          },
          () => {
            setDetectingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      } else {
        setDetectingLocation(false);
      }
    } catch {
      setDetectingLocation(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/venues/${venue.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          nameAr: form.nameAr || undefined,
          address: form.address,
          addressAr: form.addressAr || undefined,
          city: form.city,
          cityAr: form.cityAr || undefined,
          phone: form.phone,
          whatsapp: form.whatsapp || undefined,
          latitude: form.latitude ?? undefined,
          longitude: form.longitude ?? undefined,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // error handled
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-lg px-4 py-5">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white/90 mb-2"
      >
        {t("owner.settings")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-sm text-gray-400 mb-6"
      >
        {t("owner.venueInfo")}
      </motion.p>

      <motion.form {...slideUp} onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <SettingsField
            icon={<Building2 size={14} />}
            label={t("owner.venueName") + " (EN)"}
            value={form.name}
            onChange={(v) => updateField("name", v)}
            dir="ltr"
            required
          />
          <SettingsField
            icon={<Building2 size={14} />}
            label={t("owner.venueName") + " (AR)"}
            value={form.nameAr}
            onChange={(v) => updateField("nameAr", v)}
          />
        </div>

        <SettingsField
          icon={<MapPin size={14} />}
          label={t("owner.venueAddress")}
          value={form.address}
          onChange={(v) => updateField("address", v)}
          required
        />

        {/* Location Detection */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-white/50">
            <span className="text-white/40"><Crosshair size={14} /></span>
            {t("onboarding.detectLocation")}
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/70 transition-all hover:border-[#c8ff00] hover:bg-[#c8ff00]/5 disabled:opacity-50"
            >
              {detectingLocation ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {t("onboarding.detectingLocation")}
                </>
              ) : (
                <>
                  <Crosshair size={14} />
                  {t("onboarding.detectLocation")}
                </>
              )}
            </button>
            {form.latitude && form.longitude && (
              <span className="text-xs text-white/40">
                {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
              </span>
            )}
            {detectedAreaName && (
              <span className="text-xs font-medium text-emerald-500">
                {detectedAreaName}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SettingsField
            icon={<MapPin size={14} />}
            label={t("owner.venueCity") + " (EN)"}
            value={form.city}
            onChange={(v) => updateField("city", v)}
            dir="ltr"
            required
          />
          <SettingsField
            icon={<MapPin size={14} />}
            label={t("owner.venueCity") + " (AR)"}
            value={form.cityAr}
            onChange={(v) => updateField("cityAr", v)}
          />
        </div>

        <SettingsField
          icon={<Phone size={14} />}
          label={t("owner.venuePhone")}
          value={form.phone}
          onChange={(v) => updateField("phone", v)}
          dir="ltr"
          type="tel"
          required
        />

        <SettingsField
          icon={<MessageCircle size={14} />}
          label={t("owner.venueWhatsApp")}
          value={form.whatsapp}
          onChange={(v) => updateField("whatsapp", v)}
          dir="ltr"
          type="tel"
        />

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c8ff00] py-3.5 text-sm font-bold text-[#111827] shadow-sm transition-all hover:bg-[#b8e600] disabled:opacity-50"
        >
          {saved ? (
            <>
              <CheckCircle size={16} />
              {t("common.success")}
            </>
          ) : (
            <>
              <Save size={16} />
              {saving ? t("common.loading") : t("owner.saveChanges")}
            </>
          )}
        </motion.button>

        {/* Sign Out */}
        <button
          type="button"
          onClick={() => {
            import("next-auth/react").then(({ signOut }) =>
              signOut({ callbackUrl: "/" })
            );
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-red-500/30 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/50 mt-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {t("auth.signOut")}
        </button>
      </motion.form>
    </div>
  );
}

function SettingsField({
  icon,
  label,
  value,
  onChange,
  dir,
  type = "text",
  required = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr" | "rtl";
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-white/50">
        <span className="text-white/40">{icon}</span>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        dir={dir}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-all"
      />
    </div>
  );
}
