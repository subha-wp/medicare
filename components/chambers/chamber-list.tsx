//@ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppointmentDrawer } from "./appointment-drawer";
import UserAvatar from "../UserAvatar";
import { Loader2, MapPin } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import MapButton from "../MapButton";

type Chamber = {
  id: string;
  weekNumber: string;
  weekDay: string;
  startTime: string;
  endTime: string;
  fees: number;
  maxSlots: number;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    qualification: string;
    avatarUrl?: string | null;
  };
  pharmacy: {
    name: string;
    address: string;
    businessName: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  distance: number | null;
};

export function ChamberList() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false); // Added state for loading
  const { userLocation, error: locationError } = useUserLocation();
  const [selectedChamber, setSelectedChamber] = useState<Chamber | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("PATIENT");

  const loadMore = async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      params.set("page", (currentPage + 1).toString());
      if (userLocation) {
        params.set("lat", userLocation.lat.toString());
        params.set("lon", userLocation.lon.toString());
      }

      const response = await fetch(`/api/chambers/search?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        console.error(data.error);
        return;
      }

      setChambers((prev) => [...prev, ...data.chambers]);
      setHasMore(data.hasMore);
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading more chambers:", error);
    } finally {
      setLoading(false);
    }
  };

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
  });

  useEffect(() => {
    const fetchInitialChambers = async () => {
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
          `/api/chambers/search?${params.toString()}`
        );
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        setChambers(data.chambers);
        setHasMore(data.hasMore);
        setCurrentPage(1);
        setUserRole(data.userRole);
      } catch (error) {
        console.error("Error fetching chambers:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialChambers();
  }, [query, userLocation]);

  const handleBookAppointment = (chamber: Chamber) => {
    setSelectedChamber(chamber);
    setDrawerOpen(true);
  };

  function formatTime(time: string): string {
    const [hours, minutes] = time.split(":");
    const hoursNum = parseInt(hours, 10);
    const ampm = hoursNum >= 12 ? "PM" : "AM";
    const formattedHours = hoursNum % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }

  if (chambers.length === 0 && !initialLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No chambers found.
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {locationError && userRole === "PATIENT" && (
        <div
          className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded"
          role="alert"
        >
          {locationError}. Chambers will be shown without distance information.
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {chambers.map((chamber) => (
          <Card
            key={chamber.id}
            className="flex flex-col relative bg-gradient-to-r from-green-50 to-green-100"
          >
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div className="flex space-x-2">
                  <UserAvatar
                    avatarUrl={chamber.doctor?.avatarUrl || undefined}
                  />
                  <div className="flex flex-col justify-start">
                    <span className="text-xl">Dr. {chamber.doctor?.name}</span>
                    <Badge
                      variant="outline"
                      className="max-w-max border-green-500"
                    >
                      {chamber.doctor?.specialization}
                    </Badge>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {chamber.doctor?.qualification}
                </p>
                <div className="space-y-1 mt-2">
                  <p className="text-sm font-medium">Schedule:</p>
                  <p className="text-sm">
                    {chamber.weekNumber.charAt(0).toUpperCase() +
                      chamber.weekNumber.slice(1).toLowerCase()}{" "}
                    {chamber.weekDay.charAt(0).toUpperCase() +
                      chamber.weekDay.slice(1).toLowerCase()}
                  </p>
                  <p className="text-sm">
                    {formatTime(chamber?.startTime)} -{" "}
                    {formatTime(chamber?.endTime)}
                  </p>
                </div>
                <div className="space-y-1 mt-2">
                  <p className="text-sm font-medium">Location:</p>
                  <p className="text-sm">{chamber.pharmacy?.businessName}</p>
                  <p className="text-sm text-muted-foreground">
                    {chamber.pharmacy?.address}
                  </p>
                  {userRole === "PATIENT" && chamber.distance !== null && (
                    <p className="text-sm text-muted-foreground">
                      Distance: {chamber.distance.toFixed(2)} km
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium mt-2">
                  Consultation Fee: ₹{chamber?.fees}
                </p>
              </div>
              {userRole === "PATIENT" && (
                <Button
                  className="w-full mt-4"
                  onClick={() => handleBookAppointment(chamber)}
                >
                  Book Appointment
                </Button>
              )}
            </CardContent>
            <div className="absolute top-1 right-1">
              <MapButton
                pharmacyLatitude={chamber.pharmacy.location.latitude}
                pharmacyLongitude={chamber.pharmacy.location.longitude}
                userLatitude={userLocation ? userLocation.lat : null}
                userLongitude={userLocation ? userLocation.lon : null}
              />
            </div>
          </Card>
        ))}
      </div>

      <AppointmentDrawer
        chamber={selectedChamber}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedChamber(null);
        }}
      />

      {/* Loading indicator and intersection observer target */}
      <div ref={loadMoreRef} className="h-1" />
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {chambers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No chambers found.
        </div>
      )}
    </>
  );
}
