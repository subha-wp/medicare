//@ts-nocheck
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Building2, Navigation } from "lucide-react";
import MapButton from "../MapButton";

type PharmacyCardProps = {
  pharmacy: {
    id: string;
    name: string;
    businessName: string;
    address: string;
    phone: string;
    location: {
      latitude: number;
      longitude: number;
    };
    distance?: number;
  };
  userLocation?: {
    lat: number;
    lon: number;
  };
};

export function PharmacyCard({ pharmacy, userLocation }: PharmacyCardProps) {
  const router = useRouter();

  const handleViewChambers = () => {
    router.push(
      `/dashboard/chambers/list?pharmacyId=${
        pharmacy.id
      }&pharmacyName=${encodeURIComponent(pharmacy.businessName)}`
    );
  };

  const handleCall = () => {
    if (window.ReactNativeWebView) {
      // We're in the WebView, send a message to the native app
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "phoneCall",
          phone: pharmacy.phone,
        })
      );
    } else {
      // We're in a regular browser, use the default behavior
      window.location.href = `tel:${pharmacy.phone}`;
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-2 shadow-md overflow-hidden relative">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {pharmacy.businessName}
              </h3>
              <p className="text-sm text-gray-500 truncate">{pharmacy.name}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <MapButton
              pharmacyLatitude={pharmacy.location.latitude}
              pharmacyLongitude={pharmacy.location.longitude}
              userLatitude={userLocation ? userLocation.lat : null}
              userLongitude={userLocation ? userLocation.lon : null}
            />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-green-800 leading-relaxed">
              {pharmacy.address}
            </span>
          </div>

          {pharmacy.distance !== undefined && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <Navigation className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                {pharmacy.distance.toFixed(2)} km away
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 bg-transparent"
            onClick={handleCall}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
            onClick={handleViewChambers}
          >
            View Chambers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
