// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

import { cn } from "../lib/utils";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] }); // Uncomment and apply if needed

export const metadata: Metadata = {
  title: "MediBook - Professional Medical Appointment Booking",
  description: "Book appointments with doctors near you",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className, // Apply Inter font class if needed
          "min-h-screen  antialiased"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
