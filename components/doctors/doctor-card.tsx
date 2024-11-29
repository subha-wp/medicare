import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import UserAvatar from "../UserAvatar";

type DoctorCardProps = {
  doctor: {
    id: string;
    name: string;
    specialization: string;
    qualification: string;
    avatarUrl: string;
    experience: number;
    about?: string | null;
  };
};

export function DoctorCard({ doctor }: DoctorCardProps) {
  const router = useRouter();

  const handleViewChambers = () => {
    router.push(
      `/dashboard/chambers/list?doctorId=${
        doctor.id
      }&doctorName=${encodeURIComponent(doctor.name)}`
    );
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <div className="flex space-x-2">
            <UserAvatar avatarUrl={doctor.avatarUrl} />
            <div className="flex flex-col">
              <span className="text-xl">Dr. {doctor.name}</span>
              <Badge variant="outline" className="max-w-max">
                {doctor.specialization}
              </Badge>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {doctor.qualification}
          </p>
          <p className="text-sm">Experience: {doctor.experience} years</p>
          {doctor.about && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {doctor.about}
            </p>
          )}
          <Button className="w-full mt-4" onClick={handleViewChambers}>
            View Available Chambers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
