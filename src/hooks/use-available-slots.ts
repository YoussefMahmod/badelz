"use client";

import { useState, useEffect, useCallback } from "react";

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  slotDuration: number; // 30 or 60
  availableBlocks: number; // 1-3
  pricePerHour: string | number;
}

export function useAvailableSlots(venueId: string, courtId: string, date: string) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    if (!venueId || !courtId || !date) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/venues/${venueId}/courts/${courtId}/slots?date=${date}`
      );
      const json = await res.json();

      if (res.ok && json.data) {
        setSlots(json.data);
      } else {
        setError(json.message || "Failed to fetch slots");
        setSlots([]);
      }
    } catch {
      setError("Network error");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [venueId, courtId, date]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return { slots, loading, error, refetch: fetchSlots };
}
