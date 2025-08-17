"use client";

import { useEffect, useState } from "react";
import UserButton from "./UserButton";
import { NotificationBell } from "./notifications/notification-bell";

interface UserInfo {
  name?: string;
  businessName?: string;
}

interface HeaderProps {
  user: {
    role: "PATIENT" | "DOCTOR" | "PHARMACY";
  };
}

export function Header({ user }: HeaderProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user-info");
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const getGreeting = () => {
    if (!userInfo) return "Welcome";

    switch (user.role) {
      case "PHARMACY":
        return `Hi, ${userInfo.businessName}`;
      case "DOCTOR":
        return `Hi, Dr. ${userInfo.name}`;
      case "PATIENT":
        return `Hi, ${userInfo.name}`;
      default:
        return "";
    }
  };

  const getRoleSubtitle = () => {
    switch (user.role) {
      case "PHARMACY":
        return "Pharmacy Dashboard";
      case "DOCTOR":
        return "Medical Practice";
      case "PATIENT":
        return "Health Portal";
      default:
        return "";
    }
  };

  const getRoleColors = () => {
    switch (user.role) {
      case "PHARMACY":
        return "text-emerald-700";
      case "DOCTOR":
        return "text-blue-700";
      case "PATIENT":
        return "text-purple-700";
      default:
        return "text-gray-600";
    }
  };

  const getRoleGradient = () => {
    switch (user.role) {
      case "PHARMACY":
        return "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50";
      case "DOCTOR":
        return "bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50";
      case "PATIENT":
        return "bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50";
      default:
        return "bg-white";
    }
  };

  const getRoleTextGradient = () => {
    switch (user.role) {
      case "PHARMACY":
        return "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent";
      case "DOCTOR":
        return "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent";
      case "PATIENT":
        return "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent";
      default:
        return "text-gray-600";
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full ${getRoleGradient()} backdrop-blur-md border-b border-white/20 shadow-lg supports-[backdrop-filter]:bg-opacity-90`}
    >
      <div className="px-4 sm:px-6 flex h-16 sm:h-14 items-center justify-between max-w-7xl mx-auto">
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h1
            className={`text-lg sm:text-base font-semibold ${getRoleTextGradient()} truncate`}
          >
            {getGreeting()}
          </h1>
          <p className="text-xs text-gray-600 font-medium tracking-wide uppercase">
            {getRoleSubtitle()}
          </p>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-2 flex-shrink-0">
          <div className="relative">
            <NotificationBell />
          </div>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
