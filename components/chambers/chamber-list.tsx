//@ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppointmentDrawer } from "./appointment-drawer";
import UserAvatar from "../UserAvatar";
import { calculateDistance } from "@/lib/distance";
import { useUserLocation } from "@/hooks/useUserLocation";

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
    avatarUrl?: string;
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
};

type ChamberWithDistance = Chamber & { distance?: number };

type ChamberListProps = {
  chambers: Chamber[];
  userRole: string;
  doctorName?: string;
};

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hoursNum = parseInt(hours, 10);
  const ampm = hoursNum >= 12 ? "PM" : "AM";
  const formattedHours = hoursNum % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
}

export function ChamberList({
  chambers,
  userRole,
  doctorName,
}: ChamberListProps) {
  const [selectedChamber, setSelectedChamber] = useState<Chamber | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { userLocation, error: locationError } = useUserLocation();
  const [chambersWithDistance, setChambersWithDistance] =
    useState<ChamberWithDistance[]>(chambers);

  useEffect(() => {
    if (userLocation && userRole === "PATIENT") {
      const chambersWithDistanceCalculated = chambers.map((chamber) => ({
        ...chamber,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lon,
          chamber.pharmacy.location.latitude,
          chamber.pharmacy.location.longitude
        ),
      }));
      setChambersWithDistance(
        chambersWithDistanceCalculated.sort(
          (a, b) => (a.distance || 0) - (b.distance || 0)
        )
      );
    } else {
      setChambersWithDistance(chambers);
    }
  }, [chambers, userLocation, userRole]);

  const handleBookAppointment = (chamber: Chamber) => {
    setSelectedChamber(chamber);
    setDrawerOpen(true);
  };

  return (
    <div>
      {doctorName && (
        <h2 className="text-2xl font-bold mb-6">
          Chambers for Dr. {decodeURIComponent(doctorName)}
        </h2>
      )}

      {locationError && userRole === "PATIENT" && (
        <div
          className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded"
          role="alert"
        >
          {locationError}. Chambers will be shown without distance information.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chambersWithDistance.map((chamber) => (
          <Card key={chamber.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div className="flex space-x-2">
                  <UserAvatar avatarUrl={chamber.doctor.avatarUrl} />
                  <div className="flex flex-col justify-start">
                    <span className="text-xl">Dr. {chamber.doctor.name}</span>
                    <Badge variant="outline" className="max-w-max">
                      {chamber.doctor.specialization}
                    </Badge>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {chamber.doctor.qualification}
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
                    {formatTime(chamber.startTime)} -{" "}
                    {formatTime(chamber.endTime)}
                  </p>
                </div>
                <div className="space-y-1 mt-2">
                  <p className="text-sm font-medium">Location:</p>
                  <p className="text-sm">{chamber.pharmacy.businessName}</p>
                  <p className="text-sm text-muted-foreground">
                    {chamber.pharmacy.address}
                  </p>
                  {userRole === "PATIENT" && chamber.distance !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      Distance: {chamber.distance.toFixed(2)} km
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium mt-2">
                  Consultation Fee: ₹{chamber.fees}
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

      {chambersWithDistance.length === 0 && (
        <div className="text-center py-8 text-muted-foreground" role="alert">
          No chambers available.
        </div>
      )}
    </div>
  );
}
