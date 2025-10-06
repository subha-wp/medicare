"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

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
        <button className={cn("flex-none rounded-full", className)}>
          <UserAvatar avatarUrl={user.avatarUrl} size={40} />
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-4">
          <div className="flex items-center space-x-4 px-2">
            <UserAvatar avatarUrl={user.avatarUrl} size={60} />
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-lg font-semibold text-gray-900 truncate">
                {user.email}
              </DrawerTitle>
              <p className="text-sm text-gray-500 capitalize">
                {user.role?.toLowerCase() || 'User'}
              </p>
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
