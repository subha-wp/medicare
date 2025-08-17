//@ts-nocheck
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
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full animate-ping opacity-20"></div>
        </div>
        <p className="text-emerald-700 font-medium">
          Finding nearby pharmacies...
        </p>
        <p className="text-emerald-600 text-sm mt-1">Please wait a moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {locationError && (
        <div
          className="mx-4 p-4  border border-amber-200 rounded-xl shadow-sm"
          role="alert"
        >
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-amber-800 font-medium text-sm">
                Location Access Limited
              </p>
              <p className="text-amber-700 text-sm mt-1">
                {locationError}. Pharmacies will be shown without distance
                information.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
        {pharmacies.map((pharmacy) => (
          <PharmacyCard
            key={pharmacy.id}
            pharmacy={pharmacy}
            userLocation={userLocation}
          />
        ))}
      </div>

      <div ref={loadMoreRef} className="h-1" />
      {loading && (
        <div className="flex justify-center py-6">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-3 rounded-full border border-emerald-100">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <span className="text-emerald-700 font-medium text-sm">
              Loading more pharmacies...
            </span>
          </div>
        </div>
      )}

      {pharmacies.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Pharmacies Found
          </h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            We couldn&rsquo;t find any pharmacies matching your search. Try
            adjusting your search terms or location.
          </p>
        </div>
      )}
    </div>
  );
}
