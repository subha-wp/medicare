// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppointmentDrawer } from "./appointment-drawer";
import UserAvatar from "../UserAvatar";
import {
  Loader2,
  MapPin,
  Clock,
  Calendar,
  Shield,
  AlertTriangle,
  FileText,
  Phone,
} from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import MapButton from "../MapButton";

type Chamber = {
  id: string;
  weekNumbers: string[];
  weekDays: string[];
  scheduleType: string;
  startTime: string;
  endTime: string;
  fees: number;
  maxSlots: number;
  slotDuration: number;
  doctor: {
    id: string;
    name: string;
    specialization: string;
    qualification: string;
    avatarUrl?: string | null;
    licenseNo?: string | null;
  };
  pharmacy: {
    name: string;
    address: string;
    businessName: string;
    phone?: string | null;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  distance: number | null;
  isVerified?: boolean;
  verificationDate?: string | null;
};

export function ChamberList() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const doctorId = searchParams.get("doctorId");
  const doctorName = searchParams.get("doctorName");
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { userLocation, error: locationError } = useUserLocation();
  const [selectedChamber, setSelectedChamber] = useState<Chamber | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("PATIENT");

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (doctorId) params.set("doctorId", doctorId);
      params.set("page", (currentPage + 1).toString());
      if (userLocation) {
        params.set("lat", userLocation.lat.toString());
        params.set("lon", userLocation.lon.toString());
      }

      const response = await fetch(`/api/chambers/all?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error("API Error:", data.error);
        return;
      }

      setChambers((prev) => [...prev, ...data.chambers]);
      setHasMore(data.hasMore);
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading more chambers:", error);
    } finally {
      setLoadingMore(false);
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
        setChambers([]);
        setCurrentPage(1);
        setHasMore(true);

        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (doctorId) params.set("doctorId", doctorId);
        params.set("page", "1");
        if (userLocation) {
          params.set("lat", userLocation.lat.toString());
          params.set("lon", userLocation.lon.toString());
        }

        const response = await fetch(`/api/chambers/all?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          console.error("API Error:", data.error);
          setChambers([]);
          setHasMore(false);
          return;
        }

        setChambers(data.chambers || []);
        setHasMore(data.hasMore || false);
        setUserRole(data.userRole || "PATIENT");
      } catch (error) {
        console.error("Error fetching chambers:", error);
        setChambers([]);
        setHasMore(false);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialChambers();
  }, [query, userLocation, doctorId]);

  const handleBookAppointment = (chamber: Chamber) => {
    setSelectedChamber(chamber);
    setDrawerOpen(true);
  };

  const handleCallPharmacy = (phone: string | null | undefined) => {
    if (!phone) return;
    
    if (window.ReactNativeWebView) {
      // We're in the WebView, send a message to the native app
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "phoneCall",
          phone: phone,
        })
      );
    } else {
      // We're in a regular browser, use the default behavior
      window.location.href = `tel:${phone}`;
    }
  };

  function formatTime(time: string): string {
    const [hours, minutes] = time.split(":");
    const hoursNum = Number.parseInt(hours, 10);
    const ampm = hoursNum >= 12 ? "PM" : "AM";
    const formattedHours = hoursNum % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
        <p className="text-sm text-gray-500">Finding chambers near you...</p>
      </div>
    );
  }

  if (chambers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No chambers found
        </h3>
        <p className="text-sm text-gray-500 text-center">
          {userLocation
            ? "Try adjusting your search or expanding your location radius"
            : "Enable location access for better results or try different search terms"}
        </p>
      </div>
    );
  }

  return (
    <>
      {locationError && userRole === "PATIENT" && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Location access needed for better results
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {locationError}. Showing chambers without distance sorting.
            </p>
          </div>
        </div>
      )}

      {doctorId && doctorName && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
            <span className="text-blue-600 text-xs font-bold">Dr</span>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">
              Showing chambers for Dr. {doctorName}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              {chambers.length} chamber{chambers.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {chambers.map((chamber) => (
          <Card
            key={chamber.id}
            className="overflow-hidden border-2 shadow-sm bg-white hover:shadow-md transition-all duration-200"
          >
            <CardContent className="p-0">
              {/* Header Section */}
              <div className="relative p-4 pb-3">
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <UserAvatar
                      avatarUrl={chamber.doctor?.avatarUrl || undefined}
                      className="w-12 h-12"
                    />
                    {chamber.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight">
                      Dr. {chamber.doctor?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {chamber.doctor?.qualification}
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-2 bg-green-50 text-green-700 border-green-200 text-xs font-medium"
                    >
                      {chamber.doctor?.specialization}
                    </Badge>
                    {chamber.doctor?.licenseNo && (
                      <div className="flex items-center gap-1 mt-2">
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">
                          License: {chamber.doctor.licenseNo}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <MapButton
                      pharmacyLatitude={chamber.pharmacy.location.latitude}
                      pharmacyLongitude={chamber.pharmacy.location.longitude}
                      userLatitude={userLocation ? userLocation.lat : null}
                      userLongitude={userLocation ? userLocation.lon : null}
                    />
                    {userRole === "PATIENT" && chamber.distance !== null && (
                      <div className="text-xs text-gray-500 font-medium">
                        {chamber.distance.toFixed(1)} km
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="px-4 pb-4 space-y-4">
                {/* Schedule Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">
                      Schedule
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    {chamber.scheduleType === "WEEKLY_RECURRING" &&
                    chamber.weekDays.length === 1
                      ? `Every ${
                          chamber.weekDays[0].charAt(0) +
                          chamber.weekDays[0].slice(1).toLowerCase()
                        }`
                      : chamber.scheduleType === "MULTI_WEEKLY"
                      ? `${chamber.weekDays
                          .map(
                            (day) => day.charAt(0) + day.slice(1).toLowerCase()
                          )
                          .join(" & ")}`
                      : chamber.scheduleType === "MONTHLY_SPECIFIC"
                      ? `${chamber.weekNumbers
                          .map(
                            (num) => num.charAt(0) + num.slice(1).toLowerCase()
                          )
                          .join(" & ")} ${chamber.weekDays
                          .map(
                            (day) => day.charAt(0) + day.slice(1).toLowerCase()
                          )
                          .join(" & ")}`
                      : "Custom Schedule"}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatTime(chamber?.startTime)} -{" "}
                      {formatTime(chamber?.endTime)}
                    </span>
                  </div>
                </div>

                {/* Location Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-medium text-pink-600">
                      Location
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {chamber.pharmacy?.businessName}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {chamber.pharmacy?.address}
                  </p>
                </div>

                {/* Fee and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{chamber?.fees}
                    </span>
                    <span className="text-sm text-gray-500">consultation</span>
                  </div>

                  <div>
                    {chamber.isVerified ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-800 border-orange-200"
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Booking Unavailable
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {chamber.pharmacy?.phone && (
                  <Button
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 bg-transparent"
                    onClick={() => handleCallPharmacy(chamber.pharmacy?.phone)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Pharmacy
                  </Button>
                )}
                {userRole === "PATIENT" && chamber.isVerified && (
                  <Button
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
                    onClick={() => handleBookAppointment(chamber)}
                  >
                    Book Appointment
                  </Button>
                )}
              </div>
            </CardContent>
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
      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-green-600" />
            <span className="text-sm text-gray-500">
              Loading more chambers...
            </span>
          </div>
        </div>
      )}
    </>
  );
}
