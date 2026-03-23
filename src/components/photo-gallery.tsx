"use client";

import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { useTranslation } from "@/i18n";

interface PhotoGalleryProps {
  photos: string[];
  coverPhoto?: string | null;
  venueName: string;
}

export function PhotoGallery({ photos, coverPhoto, venueName }: PhotoGalleryProps) {
  const { t } = useTranslation();

  const allPhotos = coverPhoto ? [coverPhoto, ...photos] : photos;

  // No photos - placeholder
  if (allPhotos.length === 0) {
    return (
      <div className="relative h-64 sm:h-80 w-full bg-gray-100 flex flex-col items-center justify-center gap-3 rounded-2xl mx-4">
        <Camera className="h-12 w-12 text-gray-300" />
        <span className="text-sm text-gray-400">{t("venue.photos")}</span>
      </div>
    );
  }

  // Single photo - full width
  if (allPhotos.length === 1) {
    return (
      <div className="group relative h-64 sm:h-80 w-full overflow-hidden rounded-2xl mx-4">
        <img
          src={allPhotos[0]}
          alt={`${venueName} 1`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="eager"
        />
      </div>
    );
  }

  // 2+ photos - grid layout: 1 large + small stack
  return (
    <div className="h-64 sm:h-80 rounded-2xl overflow-hidden mx-4">
      <div className="grid h-full grid-cols-3 gap-1.5">
        {/* Large photo - takes 2/3 width */}
        <div className="group relative col-span-2 overflow-hidden rounded-s-2xl">
          <img
            src={allPhotos[0]}
            alt={`${venueName} 1`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="eager"
          />
        </div>

        {/* Small photo stack - takes 1/3 width */}
        <div className="flex flex-col gap-1.5">
          {allPhotos.slice(1, 3).map((photo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * (idx + 1) }}
              className={`group relative flex-1 overflow-hidden ${
                idx === 0 ? "rounded-te-2xl" : "rounded-be-2xl"
              }`}
            >
              <img
                src={photo}
                alt={`${venueName} ${idx + 2}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* "More" overlay on last photo if there are more */}
              {idx === 1 && allPhotos.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    +{allPhotos.length - 3}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
          {/* If only 2 photos total, fill remaining space */}
          {allPhotos.length === 2 && (
            <div className="flex-1 bg-gray-100 rounded-be-2xl flex items-center justify-center">
              <Camera className="h-6 w-6 text-gray-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
