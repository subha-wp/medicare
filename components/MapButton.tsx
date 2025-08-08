//@ts-nocheck
import { MapPin } from "lucide-react";
import { Button } from "./ui/button";
import React from "react";

// Define an interface for the component props
interface MapButtonProps {
  pharmacyLatitude: number;
  pharmacyLongitude: number;
  userLatitude: number | null;
  userLongitude: number | null;
}

export default function MapButton({
  pharmacyLatitude,
  pharmacyLongitude,
  userLatitude,
  userLongitude,
}: MapButtonProps) {
  const openMaps = () => {
    let url = `https://www.google.com/maps/search/?api=1&query=${pharmacyLatitude},${pharmacyLongitude}`;

    if (userLatitude !== null && userLongitude !== null) {
      url = `https://www.google.com/maps/dir/?api=1&origin=${userLatitude},${userLongitude}&destination=${pharmacyLatitude},${pharmacyLongitude}`;
    }

    if (window.ReactNativeWebView) {
      // We're in the Expo WebView
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "openMaps",
          pharmacyLatitude,
          pharmacyLongitude,
          userLatitude,
          userLongitude,
        })
      );
    } else {
      // We're in a regular browser
      window.open(url, "_blank");
    }
  };

  return (
    <div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={openMaps}
        aria-label="Open in Maps"
      >
        <MapPin className="h-4 w-4 text-green-500" />
      </Button>
    </div>
  );
}
