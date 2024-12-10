import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MapPin, Phone } from "lucide-react";

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
};

export function PharmacyCard({ pharmacy }: PharmacyCardProps) {
  const router = useRouter();

  const handleViewChambers = () => {
    router.push(
      `/dashboard/chambers/list?pharmacyId=${
        pharmacy.id
      }&pharmacyName=${encodeURIComponent(pharmacy.businessName)}`
    );
  };

  const handleCall = () => {
    window.location.href = `tel:${pharmacy.phone}`;
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xl">{pharmacy.businessName}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{pharmacy.address}</p>
          </div>
          {pharmacy.distance !== undefined && (
            <p className="text-sm text-muted-foreground">
              Distance: {pharmacy.distance.toFixed(2)} km
            </p>
          )}
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={handleCall}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call {pharmacy.phone}
          </Button>
          <Button className="w-full mt-2" onClick={handleViewChambers}>
            View Available Chambers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
