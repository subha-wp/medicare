// app/auth/register/page.tsx
import { Suspense } from "react";
import RegisterForm from "./register-form";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
