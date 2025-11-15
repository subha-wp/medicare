"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

import {
  Check,
  FileText,
  LogOutIcon,
  Monitor,
  Moon,
  Sun,
  UserIcon,
  Settings,
  ChevronRight,
  Crown,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import UserAvatar from "./UserAvatar";
import { useSession } from "@/app/dashboard/SessionProvider";
import { logout } from "@/app/auth/actions";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
      if (user?.role === "PATIENT") {
        fetchPremiumStatus();
      }
    }
  }, [user?.role, isOpen]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        let name = "User";
        if (data.profile) {
          switch (user?.role) {
            case "PATIENT":
              name = data.profile.name || "User";
              break;
            case "DOCTOR":
              name = data.profile.name || "User";
              break;
            case "PHARMACY":
              name = data.profile.businessName || data.profile.name || "User";
              break;
          }
        }
        setUserName(name);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserName("User");
    }
  };

  const fetchPremiumStatus = async () => {
    try {
      const response = await fetch("/api/premium/status");
      const data = await response.json();
      const premium = data.isPremium || false;
      setIsPremium(premium);
      
      if (premium && data.membership) {
        const endDate = new Date(data.membership.endDate);
        const now = new Date();
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining > 0) {
          setMembershipStatus(`${daysRemaining} days remaining`);
        } else {
          setMembershipStatus("Expired");
        }
      } else {
        setMembershipStatus(null);
      }
    } catch (error) {
      console.error("Error fetching premium status:", error);
      setIsPremium(false);
      setMembershipStatus(null);
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    onClick, 
    href, 
    rightElement 
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick?: () => void;
    href?: string;
    rightElement?: React.ReactNode;
  }) => {
    const content = (
      <div className="flex items-center justify-between w-full py-3 px-1">
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="text-base font-medium text-gray-900">{label}</span>
        </div>
        {rightElement || <ChevronRight className="w-4 h-4 text-gray-400" />}
      </div>
    );

    if (href) {
      return (
        <Link href={href} onClick={() => setIsOpen(false)}>
          {content}
        </Link>
      );
    }

    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <button className={cn("flex-none rounded-full relative", className)}>
          <UserAvatar avatarUrl={user.avatarUrl} size={40} />
          {user?.role === "PATIENT" && isPremium && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-4">
          <div className="flex items-center space-x-4 px-2">
            <div className="relative">
              <UserAvatar avatarUrl={user.avatarUrl} size={60} />
              {user?.role === "PATIENT" && isPremium && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Crown className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-xl font-bold text-gray-900 truncate mb-1 text-left">
                {userName || "User"}
              </DrawerTitle>
              {user?.role === "PATIENT" && (
                <div className="flex items-center gap-2 mt-1">
                  {isPremium ? (
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200 text-xs font-medium">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium {membershipStatus && `• ${membershipStatus}`}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-500 font-medium">
                      Free Plan
                    </span>
                  )}
                </div>
              )}
              {user?.role !== "PATIENT" && (
                <span className="text-xs text-gray-500 font-medium capitalize">
                  {user.role?.toLowerCase() || 'User'}
                </span>
              )}
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-2">
          {/* Profile Section */}
          <div className="space-y-1">
            <MenuItem
              icon={UserIcon}
              label="Profile"
              href="/dashboard/settings"
            />
            {user?.role === "PATIENT" && (
              <MenuItem
                icon={Crown}
                label="Premium"
                href="/dashboard/premium"
                rightElement={
                  isPremium ? (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                      Active
                    </Badge>
                  ) : undefined
                }
              />
            )}
          </div>

          <Separator className="my-4" />

          {/* Theme Section */}
          <div className="space-y-1">
            <div className="py-2 px-1">
              <div className="flex items-center space-x-3 mb-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <span className="text-base font-medium text-gray-900">Theme</span>
              </div>
              <div className="space-y-2 ml-8">
                <button
                  onClick={() => setTheme("system")}
                  className="flex items-center justify-between w-full py-2 px-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">System default</span>
                  </div>
                  {theme === "system" && <Check className="w-4 h-4 text-green-600" />}
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className="flex items-center justify-between w-full py-2 px-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Sun className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Light</span>
                  </div>
                  {theme === "light" && <Check className="w-4 h-4 text-green-600" />}
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className="flex items-center justify-between w-full py-2 px-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Moon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Dark</span>
                  </div>
                  {theme === "dark" && <Check className="w-4 h-4 text-green-600" />}
                </button>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Logout Section */}
          <div className="space-y-1">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full py-3 px-1 text-left hover:bg-red-50 rounded-lg"
            >
              <LogOutIcon className="w-5 h-5 text-red-600" />
              <span className="text-base font-medium text-red-600">Logout</span>
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
