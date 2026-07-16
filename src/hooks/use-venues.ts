"use client";

import { useState, useEffect, useCallback } from "react";

interface Venue {
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
  sportTypes: string[];
  rating: number;
  ratingCount: number;
  courtCount: number;
  minPrice: number;
  maxPrice: number;
}

interface UseVenuesOptions {
  city?: string;
  search?: string;
}

export function useVenues(options: UseVenuesOptions = {}) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.city && options.city !== "all") params.set("city", options.city);
      if (options.search) params.set("search", options.search);
      params.set("limit", "50");

      const res = await fetch(`/api/venues?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.data) {
        setVenues(json.data);
      } else {
        setError(json.message || "Failed to fetch venues");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [options.city, options.search]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  return { venues, loading, error, refetch: fetchVenues };
}
