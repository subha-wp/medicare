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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No doctors found.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>

      {/* Loading indicator and intersection observer target */}
      <div ref={loadMoreRef} className="h-1" />
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </>
  );
}
