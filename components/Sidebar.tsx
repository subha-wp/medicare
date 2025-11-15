"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type LucideIcon,
  Home,
  Calendar,
  Users,
  FileText,
  Briefcase,
  Building,
  Settings,
  Crown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  user: {
    role: "PATIENT" | "DOCTOR" | "PHARMACY";
  };
}

interface SidebarItem {
  title: string;
  icon: LucideIcon;
  href: string;
  role: "PATIENT" | "DOCTOR" | "PHARMACY" | "ALL";
}

const sidebarItems: SidebarItem[] = [
  { title: "Dashboard", icon: Home, href: "/dashboard", role: "ALL" },
  {
    title: "Chambers",
    icon: Building,
    href: "/dashboard/chambers/list",
    role: "PATIENT",
  },
  {
    title: "Appointments",
    icon: Calendar,
    href: "/dashboard/appointments",
    role: "ALL",
  },
  {
    title: "Doctors",
    icon: Users,
    href: "/dashboard/doctors",
    role: "PATIENT",
  },
  {
    title: "Medical Reports",
    icon: FileText,
    href: "/dashboard/medical-reports",
    role: "PATIENT",
  },
  {
    title: "Premium",
    icon: Crown,
    href: "/dashboard/premium",
    role: "PATIENT",
  },

  {
    title: "Chambers",
    icon: Building,
    href: "/dashboard/chambers",
    role: "DOCTOR",
  },
  {
    title: "Patients",
    icon: Users,
    href: "/dashboard/patients",
    role: "DOCTOR",
  },
  {
    title: "Manage Chambers",
    icon: Briefcase,
    href: "/dashboard/chambers",
    role: "PHARMACY",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    role: "ALL",
  },
];

export function Sidebar({ user, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("pb-12 ", className)}>
      <div className="space-y-4 py-2">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-green-600">
            Book My Chamber
          </h2>
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="10" r="3" />
                <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855" />
              </svg>
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </Button>
          </div>
        </div>
        <div className="py-2">
          <h2 className="relative px-7 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2">
              {sidebarItems
                .filter(
                  (item) => item.role === "ALL" || item.role === user.role
                )
                .map((item, index) => (
                  <Button
                    key={index}
                    asChild
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  </Button>
                ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
