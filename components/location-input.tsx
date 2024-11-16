"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationInputProps {
  onLocationSelect: (location: { latitude: number; longitude: number }) => void;
}

export function LocationInput({ onLocationSelect }: LocationInputProps) {
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationSelect({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={getCurrentLocation}
      disabled={loading}
      className="w-full"
    >
      <MapPin className="h-4 w-4 mr-2" />
      {loading ? "Getting location..." : "Get Current Location"}
    </Button>
  );
}