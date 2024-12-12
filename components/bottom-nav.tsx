/* eslint-disable react-hooks/exhaustive-deps */
//@ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Calendar, Users, Building2, Pill } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  userRole: "PATIENT" | "DOCTOR" | "PHARMACY";
}

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const index = navItems.findIndex((item) => item.href === pathname);
    setActiveIndex(index !== -1 ? index : 0);
  }, [pathname]);

  useEffect(() => {
    const activeTab = navRefs.current[activeIndex];
    if (activeTab) {
      const { offsetLeft, offsetWidth } = activeTab;
      setIndicatorStyle({
        width: `${offsetWidth}px`,
        left: `${offsetLeft}px`,
      });
    }
  }, [activeIndex]);

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/appointments", icon: Calendar, label: "Appointments" },
    ...(userRole === "PATIENT"
      ? [
          {
            href: "/dashboard/chambers/list",
            icon: Building2,
            label: "Chambers",
          },
          {
            href: "/dashboard/pharmacies",
            icon: Pill,
            label: "Pharmacies",
          },
          {
            href: "/dashboard/doctors",
            icon: Users,
            label: "Doctors",
          },
        ]
      : []),
    ...(userRole === "DOCTOR"
      ? [
          { href: "/dashboard/patients", icon: Users, label: "Patients" },
          { href: "/dashboard/chambers", icon: Building2, label: "Chambers" },
        ]
      : []),
    ...(userRole === "PHARMACY"
      ? [{ href: "/dashboard/chambers", icon: Building2, label: "Chambers" }]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-green-50 to-green-100 border-t md:hidden">
      <div className="flex justify-around relative">
        <div
          className="absolute bottom-0 h-1 bg-primary transition-all duration-300 ease-in-out"
          style={indicatorStyle}
        />
        {navItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            ref={(el) => (navRefs.current[index] = el)}
            className={cn(
              "flex flex-col items-center py-2 px-3 text-[10px] transition-colors duration-300 ease-in-out",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
            onClick={() => setActiveIndex(index)}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
