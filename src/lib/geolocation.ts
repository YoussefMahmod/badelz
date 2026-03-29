"use client";

import { AREAS } from "./constants";

/**
 * Haversine formula to calculate distance between two lat/lng points in kilometers.
 */
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

/**
 * Gets the user's raw coordinates without resolving to an area.
 * Returns null if geolocation is unavailable, denied, or times out.
 */
export function getUserCoordinates(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
}

/**
 * Returns area keys within a given radius (km) of a target area, sorted by distance.
 * Excludes the target area itself and the "all" entry.
 */
export function getAdjacentAreas(areaKey: string, radiusKm: number = 15): string[] {
  const target = AREAS.find((a) => a.key === areaKey);
  if (!target || target.key === "all") return [];

  return AREAS
    .filter((a) => a.key !== "all" && a.key !== areaKey)
    .map((a) => ({
      key: a.key,
      distance: haversine(target.lat, target.lng, a.lat, a.lng),
    }))
    .filter((a) => a.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .map((a) => a.key);
}

/**
 * Returns all area keys sorted by distance from the given coordinates.
 * Excludes the "all" entry.
 */
export function getAreasSortedByProximity(lat: number, lng: number): string[] {
  return AREAS
    .filter((a) => a.key !== "all")
    .map((a) => ({
      key: a.key,
      distance: haversine(lat, lng, a.lat, a.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .map((a) => a.key);
}
