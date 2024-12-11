"use client";

import { useEffect, useState } from "react";
import UserButton from "./UserButton";

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

  return (
    <header className="sticky top-0 z-50 px-2 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="md:mx-6 flex h-14 items-center justify-between">
        <div className="flex">
          <h1 className="text-lg font-semibold">{getGreeting()}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
