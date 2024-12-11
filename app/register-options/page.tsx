import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserIcon as UserMd, HospitalIcon as Clinic } from "lucide-react";

export default function RegisterOptions() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center text-green-600">
          MediCare
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Choose Registration Type
        </h2>

        <div className="space-y-6 w-full max-w-md">
          <Link href="/auth/register?role=doctor" passHref legacyBehavior>
            <Button className="w-full h-16 text-lg justify-start px-6" asChild>
              <a>
                <UserMd className="w-6 h-6 mr-4" />
                Register as Doctor
              </a>
            </Button>
          </Link>

          <Link href="/auth/register?role=pharmacy" passHref legacyBehavior>
            <Button
              className="w-full h-16 text-lg justify-start px-6"
              variant="outline"
              asChild
            >
              <a>
                <Clinic className="w-6 h-6 mr-4" />
                Register as Pharmacy
              </a>
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-lg p-4 mt-8">
        <p className="text-center text-gray-600">
          Already have an account?
          <Link
            href="/auth/login"
            className="text-green-600 hover:underline ml-1"
          >
            Login here
          </Link>
        </p>
      </footer>
    </div>
  );
}
