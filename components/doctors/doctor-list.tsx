/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState } from "react";
import { useIntersection } from "@/hooks/use-intersection";
import { useSearchParams } from "next/navigation";
import { DoctorCard } from "./doctor-card";
import { DoctorChambersDialog } from "./doctor-chambers-dialog";
import { Loader2 } from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  about?: string | null;
};

export function DoctorList() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Reference for the last item in the list
  const lastDoctorRef = useRef<HTMLDivElement>(null);
  const entry = useIntersection(lastDoctorRef, {
    threshold: 0,
    root: null,
    rootMargin: "0px",
  });

  const fetchDoctors = async (cursor?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (cursor) params.set("cursor", cursor);

      const response = await fetch(`/api/doctors/search?${params.toString()}`);
      const data = await response.json();

      if (!cursor) {
        setDoctors(data.doctors);
      } else {
        setDoctors((prev) => [...prev, ...data.doctors]);
      }

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    setDoctors([]);
    setNextCursor(null);
    setHasMore(true);
    fetchDoctors();
  }, [query]);

  // Fetch more when scrolling to bottom
  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !loading && nextCursor) {
      fetchDoctors(nextCursor);
    }
  }, [entry?.isIntersecting]);

  if (doctors.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No doctors found.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor, index) => (
          <div
            key={doctor.id}
            ref={index === doctors.length - 1 ? lastDoctorRef : null}
          >
            <DoctorCard
              doctor={doctor}
              onSelect={() => setSelectedDoctor(doctor)}
            />
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      <DoctorChambersDialog
        doctor={selectedDoctor}
        open={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
      />
    </>
  );
}
