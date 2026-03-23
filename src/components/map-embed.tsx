"use client";

import { motion } from "framer-motion";
import { MapPin, ExternalLink } from "lucide-react";
import { useTranslation } from "@/i18n";

interface MapEmbedProps {
  latitude?: number | null;
  longitude?: number | null;
  address: string;
  venueName: string;
}

export function MapEmbed({ latitude, longitude, address, venueName }: MapEmbedProps) {
  const { t } = useTranslation();

  const mapsUrl = latitude && longitude
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + " " + venueName)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:border-white/15"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c8ff00]/10">
          <MapPin size={20} className="text-[#c8ff00]" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-white">{t("venue.location")}</h4>
          <p className="text-xs text-white/40 line-clamp-2 mt-0.5">{address}</p>
        </div>
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full rounded-full border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
      >
        <MapPin size={15} />
        {t("venue.location")}
        <ExternalLink size={12} className="text-white/30" />
      </a>
    </motion.div>
  );
}
