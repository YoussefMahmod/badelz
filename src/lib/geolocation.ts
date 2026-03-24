"use client";

import { AREAS } from "./constants";

/**
 * Haversine formula to calculate distance between two lat/lng points in kilometers.
 */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Gets the user's current position and returns the nearest area key from AREAS.
 * Returns null if geolocation is unavailable, denied, or times out.
 */
export function getNearestArea(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        let nearestKey: string | null = null;
        let minDistance = Infinity;

        for (const area of AREAS) {
          // Skip the "all" entry
          if (area.key === "all") continue;

          const distance = haversine(latitude, longitude, area.lat, area.lng);
          if (distance < minDistance) {
            minDistance = distance;
            nearestKey = area.key;
          }
        }

        resolve(nearestKey);
      },
      () => {
        // Permission denied, position unavailable, or timeout
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache position for 5 minutes
      }
    );
  });
}
