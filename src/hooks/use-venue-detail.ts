"use client";

import { useState, useEffect } from "react";

interface Court {
  id: string;
  name: string;
  nameAr: string | null;
  sportType: string;
  pricePerHour: string;
  isActive: boolean;
  sortOrder: number;
  slotCount: number;
}

interface VenueDetail {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  phone: string;
  whatsapp: string | null;
  address: string;
  addressAr: string | null;
  city: string;
  cityAr: string | null;
  latitude: number | null;
  longitude: number | null;
  coverPhoto: string | null;
  photos: string[];
  sportTypes: string[];
  rating: number;
  ratingCount: number;
  courts: Court[];
}

export function useVenueDetail(venueId: string) {
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!venueId) return;

    let cancelled = false;

    async function fetchVenue() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/venues/${venueId}`);
        const json = await res.json();

        if (cancelled) return;

        if (res.ok && json.data) {
          setVenue(json.data);
        } else if (res.status === 404) {
          setError("not_found");
        } else {
          setError(json.message || "Failed to fetch venue");
        }
      } catch {
        if (!cancelled) setError("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVenue();
    return () => {
      cancelled = true;
    };
  }, [venueId]);

  return { venue, loading, error };
}
