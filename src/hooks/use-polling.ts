"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Smart polling hook — calls fetcher on an interval.
 * Pauses when tab is hidden, resumes on focus.
 */
export function usePolling(
  fetcher: () => void,
  intervalMs: number = 5000,
  enabled: boolean = true
) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const poll = useCallback(() => {
    fetcherRef.current();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (intervalId) return;
      intervalId = setInterval(poll, intervalMs);
    };

    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        poll(); // Fetch immediately on tab focus
        start();
      }
    };

    // Start polling
    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [poll, intervalMs, enabled]);
}
