"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DoctorCard } from "./doctor-card";
import { Loader2 } from "lucide-react";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  avatarUrl: string;
  about?: string | null;
};

export function DoctorList() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadMore = async () => {
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      params.set("page", (currentPage + 1).toString());

      const response = await fetch(`/api/doctors/search?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        console.error(data.error);
        return;
      }

      setDoctors((prev) => [...prev, ...data.doctors]);
      setHasMore(data.hasMore);
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading more doctors:", error);
    }
  };

  const { loadMoreRef, loading } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
  });

  useEffect(() => {
    const fetchInitialDoctors = async () => {
      try {
        setInitialLoading(true);
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        params.set("page", "1");

        const response = await fetch(
          `/api/doctors/search?${params.toString()}`
        );
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        setDoctors(data.doctors);
        setHasMore(data.hasMore);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialDoctors();
  }, [query]);

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full animate-ping opacity-20"></div>
        </div>
        <p className="text-blue-700 font-medium">
          Finding qualified doctors...
        </p>
        <p className="text-blue-600 text-sm mt-1">Please wait a moment</p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Doctors Found
        </h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          We couldn&#39;t find any doctors matching your search criteria. Try
          adjusting your search terms or browse all specializations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>

      <div ref={loadMoreRef} className="h-1" />
      {loading && (
        <div className="flex justify-center py-6">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-full border border-blue-100">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-blue-700 font-medium text-sm">
              Loading more doctors...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
