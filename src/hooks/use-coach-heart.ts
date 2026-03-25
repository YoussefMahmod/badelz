"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_PREFIX = "badelz-heart-";

function getStorageKey(coachId: string) {
  return `${STORAGE_PREFIX}${coachId}`;
}

function isHeartedInStorage(coachId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getStorageKey(coachId)) === "1";
}

export function useCoachHeart(coachId: string, initialHeartCount: number) {
  const [isHearted, setIsHearted] = useState(false);
  const [heartCount, setHeartCount] = useState(initialHeartCount);
  const [loading, setLoading] = useState(false);

  // Sync from localStorage after mount (avoid hydration mismatch)
  useEffect(() => {
    setIsHearted(isHeartedInStorage(coachId));
  }, [coachId]);

  // Update count if initialHeartCount changes
  useEffect(() => {
    setHeartCount(initialHeartCount);
  }, [initialHeartCount]);

  const toggleHeart = useCallback(async () => {
    if (loading) return;

    const newHearted = !isHearted;
    const action = newHearted ? "heart" : "unheart";

    // Optimistic update
    setIsHearted(newHearted);
    setHeartCount((prev) => Math.max(0, prev + (newHearted ? 1 : -1)));

    // Persist to localStorage
    if (newHearted) {
      localStorage.setItem(getStorageKey(coachId), "1");
    } else {
      localStorage.removeItem(getStorageKey(coachId));
    }

    // Fire API call
    setLoading(true);
    try {
      const res = await fetch(`/api/coaches/${coachId}/heart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (res.ok && json.data?.heartCount != null) {
        setHeartCount(json.data.heartCount);
      }
    } catch {
      // Revert on error
      setIsHearted(!newHearted);
      setHeartCount((prev) => Math.max(0, prev + (newHearted ? -1 : 1)));
      if (newHearted) {
        localStorage.removeItem(getStorageKey(coachId));
      } else {
        localStorage.setItem(getStorageKey(coachId), "1");
      }
    } finally {
      setLoading(false);
    }
  }, [coachId, isHearted, loading]);

  return { isHearted, heartCount, toggleHeart, loading };
}
