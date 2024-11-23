"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";

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
  const pathname = usePathname();
  const router = useRouter();

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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/auth/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 px-2 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="md:mx-6 flex h-14 items-center justify-between">
        <div className="flex">
          <h1 className="text-lg font-semibold">{getGreeting()}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
