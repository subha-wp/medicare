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
  Shield,
  ShieldPlus,
  Stethoscope,
  Store,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-emerald-500",
    bgColor: "hover:bg-emerald-500/10",
  },
  {
    label: "Appointments",
    icon: Calendar,
    href: "/dashboard/appointments",
    color: "text-blue-500",
    bgColor: "hover:bg-blue-500/10",
  },
  {
    label: "Doctors",
    icon: Stethoscope,
    href: "/dashboard/doctors",
    color: "text-purple-500",
    bgColor: "hover:bg-purple-500/10",
  },
  {
    label: "Chambers",
    icon: Store,
    href: "/dashboard/chambers",
    color: "text-amber-500",
    bgColor: "hover:bg-amber-500/10",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-gray-500",
    bgColor: "hover:bg-gray-500/10",
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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 py-4 flex flex-col h-full bg-gradient-to-b from-background to-secondary/20"
    >
      <div className="px-3 py-2">
        <div className="flex items-center justify-center mb-6 pt-4">
          <ShieldPlus className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold ml-2 text-primary">MediBook</h1>
        </div>
        <ScrollArea className="flex-1 h-[calc(100vh-12rem)]">
          <div className="space-y-2">
            {routes.map((route) => (
              <motion.div
                key={route.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={pathname === route.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-300 ease-in-out",
                    route.bgColor,
                    {
                      "bg-secondary/80 shadow-md": pathname === route.href,
                      "hover:shadow-sm": pathname !== route.href,
                    }
                  )}
                  onClick={() => onNavigate(route.href)}
                >
                  <route.icon
                    className={cn(
                      "h-5 w-5 mr-3 transition-transform duration-300",
                      route.color,
                      { "scale-110": pathname === route.href }
                    )}
                  />
                  <span
                    className={cn("font-medium", {
                      "text-primary": pathname === route.href,
                    })}
                  >
                    {route.label}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="px-3 py-2 mt-auto border-t border-border/50">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors duration-300"
          >
            <LogOut className="h-5 w-5 mr-3 transition-transform group-hover:rotate-12" />
            <span className="font-medium">Logout</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
