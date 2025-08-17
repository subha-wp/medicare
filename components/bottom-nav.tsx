/* eslint-disable react-hooks/exhaustive-deps */
//@ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Users, Building2, Pill } from "lucide-react";
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
            label: "Pharmacy",
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
          { href: "/dashboard/patients", icon: Users, label: "Cases" },
          { href: "/dashboard/chambers", icon: Building2, label: "Chambers" },
        ]
      : []),
    ...(userRole === "PHARMACY"
      ? [{ href: "/dashboard/chambers", icon: Building2, label: "Clinic" }]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex justify-around relative px-1 py-2">
        {navItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            ref={(el) => (navRefs.current[index] = el)}
            className={cn(
              "flex flex-col items-center py-2 px-3 text-xs font-medium transition-all duration-300 ease-out relative z-10 rounded-2xl min-w-[50px]",
              pathname === item.href
                ? "text-green-600 transform scale-105"
                : "text-gray-600 hover:text-green-600 hover:scale-105 active:scale-95"
            )}
            onClick={() => setActiveIndex(index)}
          >
            <item.icon
              className={cn(
                "h-5 w-5 mb-1 transition-all duration-300",
                pathname === item.href ? "text-green-600" : ""
              )}
            />
            <span
              className={cn(
                "transition-all duration-300 leading-tight text-[10px]",
                pathname === item.href
                  ? "font-semibold text-green-600"
                  : "font-medium"
              )}
            >
              {item.label}
            </span>
            {pathname === item.href && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
            )}
          </Link>
        ))}
      </div>
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
