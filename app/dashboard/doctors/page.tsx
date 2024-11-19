import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DoctorsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/auth/login");

  const doctors = await prisma.doctor.findMany({
    include: {
      chambers: {
        include: {
          pharmacy: true,
        },
      },
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Available Doctors</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader>
              <CardTitle>{doctor.name}</CardTitle>
              <Badge className="w-fit">{doctor.specialization}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {doctor.qualification}
                </p>
                <p className="text-sm">Experience: {doctor.experience} years</p>
                {doctor.about && (
                  <p className="text-sm text-muted-foreground">
                    {doctor.about}
                  </p>
                )}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Chambers</h4>
                  <div className="space-y-2">
                    {doctor.chambers.map((chamber) => (
                      <div
                        key={chamber.id}
                        className="text-sm p-2 bg-secondary/50 rounded-md"
                      >
                        <p className="font-medium">{chamber.pharmacy.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {chamber.weekDays.join(", ")} • {chamber.startTime} -{" "}
                          {chamber.endTime}
                        </p>
                        <p className="text-xs">Fees: ₹{chamber.fees}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
