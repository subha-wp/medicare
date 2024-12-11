"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Bell,
  LogIn,
  UserPlus,
  StethoscopeIcon,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleTouchStart = useCallback(() => {
    setTouchStart(Date.now());
    const timer = setTimeout(() => {
      router.push("/register-options"); // Replace with your desired redirect URL
    }, 5000);
    setRedirectTimer(timer);
  }, [router]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
    if (redirectTimer) {
      clearTimeout(redirectTimer);
    }
  }, [redirectTimer]);

  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-100"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center text-green-600">
          MediCare
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero section */}
        <section className="text-center mb-12">
          <div className="w-full flex justify-center p-4">
            <StethoscopeIcon size={95} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">
            Book Your Medical Appointments
          </h2>
          <p className="text-gray-600">
            Fast, easy, and convenient scheduling for your health needs
          </p>
        </section>

        {/* Features */}
        <section className="space-y-6 mb-12">
          <FeatureItem
            icon={<Calendar className="w-6 h-6 text-green-600" />}
            title="Easy Scheduling"
            description="Book appointments with just a few taps"
          />
          <FeatureItem
            icon={<Users className="w-6 h-6 text-green-600" />}
            title="Wide Network"
            description="Access to a vast network of healthcare providers"
          />
          <FeatureItem
            icon={<Bell className="w-6 h-6 text-green-600" />}
            title="Reminders"
            description="Never miss an appointment with timely notifications"
          />
        </section>
      </main>

      {/* Footer with login/register buttons */}
      <footer className="bg-white shadow-lg p-4">
        <div className="flex justify-between gap-4">
          <Link href="/auth/login" passHref legacyBehavior>
            <Button className="flex-1 justify-center" variant="outline" asChild>
              <a>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </a>
            </Button>
          </Link>
          <Link href="/auth/register?role=patient" passHref legacyBehavior>
            <Button className="flex-1 justify-center" asChild>
              <a>
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </a>
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center space-x-4">
      <div className="bg-green-100 rounded-full p-3">{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
