"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Calendar,
  Users,
  FileText,
  Building,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  userRole: "PATIENT" | "DOCTOR" | "PHARMACY";
}

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/appointments", icon: Calendar, label: "Appointments" },
    ...(userRole === "PATIENT"
      ? [
          { href: "/dashboard/doctors", icon: Users, label: "Doctors" },
          {
            href: "/dashboard/medical-reports",
            icon: FileText,
            label: "Reports",
          },
        ]
      : []),
    ...(userRole === "DOCTOR"
      ? [
          { href: "/dashboard/patients", icon: Users, label: "Patients" },
          { href: "/dashboard/chambers", icon: Building, label: "Chambers" },
        ]
      : []),
    ...(userRole === "PHARMACY"
      ? [{ href: "/dashboard/chambers", icon: Building, label: "Chambers" }]
      : []),
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center py-2 px-3 text-xs",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
