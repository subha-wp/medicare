"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Stethoscope, GraduationCap, Clock, User } from "lucide-react";
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
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-2 shadow-md overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start gap-3">
          <div className="relative">
            <UserAvatar avatarUrl={doctor.avatarUrl} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Stethoscope className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              Dr. {doctor.name}
            </h3>
            <Badge className="bg-green-50 text-green-500 border-green-200 hover:bg-green-100 mt-1">
              <Stethoscope className="w-3 h-3 mr-1" />
              {doctor.specialization}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <GraduationCap className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              {doctor.qualification}
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">
              {doctor.experience} years experience
            </span>
          </div>

          {doctor.about && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {doctor.about}
                </p>
              </div>
            </div>
          )}
        </div>

        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          onClick={handleViewChambers}
        >
          View Available Chambers
        </Button>
      </CardContent>
    </Card>
  );
}
