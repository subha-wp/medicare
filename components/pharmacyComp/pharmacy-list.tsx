"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PharmacyCard } from "./pharmacy-card";
import { Loader2 } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

type Pharmacy = {
  id: string;
  name: string;
  businessName: string;
  address: string;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
};

export function PharmacyList() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const { userLocation, error: locationError } = useUserLocation();

  const loadMore = async () => {
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      params.set("page", (currentPage + 1).toString());
      if (userLocation) {
        params.set("lat", userLocation.lat.toString());
        params.set("lon", userLocation.lon.toString());
      }

      const response = await fetch(
        `/api/pharmacies/search?${params.toString()}`
      );
      const data = await response.json();

      if (data.error) {
        console.error(data.error);
        return;
      }

      setPharmacies((prev) => [...prev, ...data.pharmacies]);
      setHasMore(data.hasMore);
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading more pharmacies:", error);
    }
  };

  const { loadMoreRef, loading } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
  });

  useEffect(() => {
    const fetchInitialPharmacies = async () => {
      try {
        setInitialLoading(true);
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        params.set("page", "1");
        if (userLocation) {
          params.set("lat", userLocation.lat.toString());
          params.set("lon", userLocation.lon.toString());
        }

        const response = await fetch(
          `/api/pharmacies/search?${params.toString()}`
        );
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        setPharmacies(data.pharmacies);
        setHasMore(data.hasMore);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialPharmacies();
  }, [query, userLocation]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  console.log("pharmacies", pharmacies);

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
        {pharmacies.map((pharmacy) => (
          <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
        ))}
      </div>

      {/* Loading indicator and intersection observer target */}
      <div ref={loadMoreRef} className="h-1" />
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {pharmacies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No pharmacies found.
        </div>
      )}
    </>
  );
}
