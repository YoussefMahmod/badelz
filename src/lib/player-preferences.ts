"use client";

const PREFS_KEY = "badelz-player-prefs";
const LEGACY_PHONE_KEY = "badelz-player-phone";

export interface PlayerPreferences {
  area?: string;
  level?: string;
  name?: string;
  phone?: string;
  detectedArea?: string;
}

export function getPlayerPreferences(): PlayerPreferences {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      return JSON.parse(raw) as PlayerPreferences;
    }
  } catch {
    // corrupted JSON, fall through to legacy
  }

  // Fall back to legacy keys
  const phone = localStorage.getItem(LEGACY_PHONE_KEY) || undefined;
  return { phone };
}

export function setPlayerPreferences(partial: Partial<PlayerPreferences>): void {
  if (typeof window === "undefined") return;

  const current = getPlayerPreferences();
  const merged = { ...current, ...partial };
  localStorage.setItem(PREFS_KEY, JSON.stringify(merged));

  // Keep legacy phone key in sync for backwards compatibility
  if (merged.phone) {
    localStorage.setItem(LEGACY_PHONE_KEY, merged.phone);
  }
}
