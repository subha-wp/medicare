//components/dashboard/sidebar.tsx
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Settings,
  Stethoscope,
  Store,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Appointments",
    icon: Calendar,
    href: "/dashboard/appointments",
    color: "text-violet-500",
  },
  {
    label: "Doctors",
    icon: Stethoscope,
    href: "/dashboard/doctors",
    color: "text-pink-700",
  },
  {
    label: "Chambers",
    icon: Store,
    href: "/dashboard/chambers",
    color: "text-orange-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const onNavigate = (url: string) => {
    router.push(url);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-secondary/10">
      <div className="px-3 py-2 flex-1">
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start", {
                "bg-secondary/80": pathname === route.href,
              })}
              onClick={() => onNavigate(route.href)}
            >
              <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
              {route.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
