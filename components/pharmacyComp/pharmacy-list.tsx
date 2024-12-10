/* eslint-disable react-hooks/exhaustive-deps */
//@ts-nocheck
"use client";
import { useEffect, useRef, useState } from "react";
import { useIntersection } from "@/hooks/use-intersection";
import { useSearchParams } from "next/navigation";
import { PharmacyCard } from "./pharmacy-card";
import { Loader2 } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";

type Pharmacy = {
  id: string;
  name: string;
  businessName: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
};

export function PharmacyList() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { userLocation, error: locationError } = useUserLocation();

  // Reference for the last item in the list
  const lastPharmacyRef = useRef<HTMLDivElement>(null);
  const entry = useIntersection(lastPharmacyRef, {
    threshold: 0,
    root: null,
    rootMargin: "0px",
  });

  const fetchPharmacies = async (cursor?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (cursor) params.set("cursor", cursor);
      if (userLocation) {
        params.set("lat", userLocation.lat.toString());
        params.set("lon", userLocation.lon.toString());
      }

      const response = await fetch(
        `/api/pharmacies/search?${params.toString()}`
      );
      const data = await response.json();

      if (!cursor) {
        setPharmacies(data.pharmacies);
      } else {
        setPharmacies((prev) => [...prev, ...data.pharmacies]);
      }

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    setPharmacies([]);
    setNextCursor(null);
    setHasMore(true);
    fetchPharmacies();
  }, [query, userLocation]);

  // Fetch more when scrolling to bottom
  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !loading && nextCursor) {
      fetchPharmacies(nextCursor);
    }
  }, [entry?.isIntersecting, hasMore, loading, nextCursor]);

  if (pharmacies.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pharmacies found.
      </div>
    );
  }

  console.log("pharmacy list", pharmacies);

  return (
    <>
      {locationError && (
        <div
          className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded"
          role="alert"
        >
          {locationError}. Pharmacies will be shown without distance
          information.
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pharmacies.map((pharmacy, index) => (
          <div
            key={pharmacy.id}
            ref={index === pharmacies.length - 1 ? lastPharmacyRef : null}
          >
            <PharmacyCard pharmacy={pharmacy} />
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </>
  );
}
