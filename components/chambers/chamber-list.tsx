//@ts-nocheck
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppointmentDrawer } from "./appointment-drawer";
import { useState } from "react";

type Chamber = {
  id: string;
  weekNumber: string;
  weekDay: string;
  startTime: string;
  endTime: string;
  fees: number;
  maxSlots: number;
  doctor: {
    name: string;
    specialization: string;
    qualification: string;
  };
  pharmacy: {
    name: string;
    address: string;
    businessName: string;
  };
};

type ChamberListProps = {
  chambers: Chamber[];
  userRole: string;
};

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hoursNum = parseInt(hours, 10);
  const ampm = hoursNum >= 12 ? "PM" : "AM";
  const formattedHours = hoursNum % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
}

export function ChamberList({ chambers, userRole }: ChamberListProps) {
  const [selectedChamber, setSelectedChamber] = useState<Chamber | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleBookAppointment = (chamber: Chamber) => {
    setSelectedChamber(chamber);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chambers.map((chamber) => (
          <Card key={chamber.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div>
                  <span className="text-xl">{chamber.doctor.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {chamber.doctor.specialization}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 flex-1">
                <p className="text-sm text-muted-foreground">
                  {chamber.doctor.qualification}
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Schedule:</p>
                  <p className="text-sm">
                    {chamber.weekNumber} {chamber.weekDay}
                  </p>
                  <p className="text-sm">
                    {formatTime(chamber.startTime)} -{" "}
                    {formatTime(chamber.endTime)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Location:</p>
                  <p className="text-sm">{chamber.pharmacy.businessName}</p>
                  <p className="text-sm text-muted-foreground">
                    {chamber.pharmacy.address}
                  </p>
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
    </>
  );
}
