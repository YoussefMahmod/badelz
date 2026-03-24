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
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { slideUp } from "@/lib/animations";
import { LoadingSpinner } from "@/components/loading-spinner";

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
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [venue, setVenue] = useState<VenueSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "",
    nameAr: "",
    address: "",
    addressAr: "",
    city: "",
    cityAr: "",
    phone: "",
    whatsapp: "",
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
        className="text-xl font-bold text-gray-900 mb-2"
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
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-gray-800 disabled:opacity-50"
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
      <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-500">
        <span className="text-gray-400">{icon}</span>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        dir={dir}
        className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-all"
      />
    </div>
  );
}
