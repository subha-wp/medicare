// app/page.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stethoscope, Pill, User } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
            MediBook
          </h1>
          <p className="text-lg text-muted-foreground">
            Your trusted platform for medical appointments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">For Patients</h2>
              <p className="text-sm text-muted-foreground">
                Find and book appointments with qualified doctors in your area
              </p>
              <Link href="/auth/register?role=patient">
                <Button>Register as Patient</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Stethoscope className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">For Doctors</h2>
              <p className="text-sm text-muted-foreground">
                Manage your chambers and appointments efficiently
              </p>
              <Link href="/auth/register?role=doctor">
                <Button>Register as Doctor</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Pill className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">For Pharmacies</h2>
              <p className="text-sm text-muted-foreground">
                Host doctor chambers and expand your business
              </p>
              <Link href="/auth/register?role=pharmacy">
                <Button>Register as Pharmacy</Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="flex justify-center">
          <Link href="/auth/login">
            <Button variant="outline">Already have an account? Login</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
