import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppointmentBookingForm } from "../appointments/appointment-booking-form";

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
  children?: (chamber: Chamber) => React.ReactNode;
};

export function ChamberList({
  chambers,
  userRole,
  children,
}: ChamberListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {chambers.map((chamber) => (
        <Card key={chamber.id}>
          <CardHeader>
            <CardTitle>{chamber.doctor.name}</CardTitle>
            <Badge variant="outline" className="w-fit">
              {chamber.doctor.specialization}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {chamber.weekNumber} {chamber.weekDay}
              </p>
              <p className="text-sm">
                {chamber.startTime} - {chamber.endTime}
              </p>
              <p className="text-sm font-medium">Fees: ₹{chamber.fees}</p>
              <p className="text-sm">
                {chamber.pharmacy.businessName} ({chamber.pharmacy.address})
              </p>
              {/* {children && children(chamber)} */}
              <AppointmentBookingForm
                chamberId={chamber.id}
                availableSlots={chamber.maxSlots}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
