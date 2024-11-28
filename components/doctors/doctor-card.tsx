import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DoctorCardProps = {
  doctor: {
    id: string;
    name: string;
    specialization: string;
    qualification: string;
    experience: number;
    about?: string | null;
  };
  onSelect: () => void;
};

export function DoctorCard({ doctor, onSelect }: DoctorCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onSelect}
    >
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <div>
            <span className="text-xl">Dr. {doctor.name}</span>
            <Badge variant="outline" className="ml-2">
              {doctor.specialization}
            </Badge>
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
        </div>
      </CardContent>
    </Card>
  );
}
