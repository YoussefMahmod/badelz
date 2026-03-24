"use client";

import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { AREAS } from "@/lib/constants";
import { getNearestArea } from "@/lib/geolocation";
import { useTranslation } from "@/i18n";
import { useLocale } from "@/i18n";

interface AreaSelectorProps {
  mode: "single" | "multi";
  selected: string | string[];
  onChange: (value: string | string[]) => void;
  showDetectButton?: boolean;
}

export function AreaSelector({
  mode,
  selected,
  onChange,
  showDetectButton = true,
}: AreaSelectorProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [detecting, setDetecting] = useState(false);

  const selectableAreas = AREAS.filter((a) => a.key !== "all");

  const isSelected = (key: string): boolean => {
    if (mode === "single") {
      return selected === key;
    }
    return Array.isArray(selected) && selected.includes(key);
  };

  const handleSelect = (key: string) => {
    if (mode === "single") {
      // Toggle off if already selected, otherwise select
      onChange(selected === key ? "" : key);
    } else {
      const current = Array.isArray(selected) ? selected : [];
      if (current.includes(key)) {
        onChange(current.filter((k) => k !== key));
      } else {
        onChange([...current, key]);
      }
    }
  };

  const handleDetect = async () => {
    setDetecting(true);
    try {
      const areaKey = await getNearestArea();
      if (areaKey) {
        if (mode === "single") {
          onChange(areaKey);
        } else {
          const current = Array.isArray(selected) ? selected : [];
          if (!current.includes(areaKey)) {
            onChange([...current, areaKey]);
          }
        }
      }
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">
        {mode === "single" ? t("location.selectArea") : t("location.selectAreas")}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {showDetectButton && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleDetect}
            disabled={detecting}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-2.5 text-xs text-gray-500 transition-all hover:border-gray-400 hover:text-gray-700 disabled:opacity-50"
          >
            {detecting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>{t("location.detecting")}</span>
              </>
            ) : (
              <>
                <MapPin size={14} />
                <span>{t("location.detectLocation")}</span>
              </>
            )}
          </motion.button>
        )}

        {selectableAreas.map((area) => {
          const active = isSelected(area.key);
          return (
            <motion.button
              key={area.key}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(area.key)}
              className={`rounded-xl px-3 py-2.5 text-xs transition-all ${
                active
                  ? "border-2 border-[#c8ff00] bg-[#c8ff00]/10 text-gray-900 font-medium"
                  : "border border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
              }`}
            >
              {locale === "ar" ? area.labelAr : area.labelEn}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
