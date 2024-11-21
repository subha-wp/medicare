// components/chambers/chamber-list.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import Link from "next/link";

interface ChamberListProps {
  chambers: any[];
  userRole: string;
}

export function ChamberList({ chambers, userRole }: ChamberListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChambers = chambers.filter((chamber) => {
    const searchString =
      `${chamber.doctor.name} ${chamber.doctor.specialization} ${chamber.pharmacy.name} ${chamber.pharmacy.address}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search chambers..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredChambers.map((chamber) => (
          <Card key={chamber.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">
                    {chamber.doctor.name}
                  </h3>
                  <Badge variant="outline" className="">
                    {chamber.doctor.specialization}
                  </Badge>
                </div>
                <Badge>{chamber.fees} ₹</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {chamber.doctor.qualification}
                </p>
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {chamber.pharmacy.businessName}
                    </p>
                    <p className="text-muted-foreground">
                      {chamber.pharmacy.address}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-sm">
                    <span className="font-medium">Schedule:</span>{" "}
                    {chamber.weekNumber} {chamber.weekDay}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Time:</span>{" "}
                    {chamber.startTime} - {chamber.endTime}
                  </p>
                </div>
                {userRole === "PATIENT" && (
                  <Link
                    href={`/dashboard/appointments/book?chamber=${chamber.id}`}
                  >
                    <Button className="w-full mt-2">Book Appointment</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChambers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No chambers found matching your search.
        </div>
      )}
    </div>
  );
}
