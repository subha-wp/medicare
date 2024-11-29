import { useState, useEffect } from "react";

interface Location {
  lat: number;
  lon: number;
}

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setError("Unable to retrieve your location");
      }
    );
  }, []);

  return { userLocation, error };
}
