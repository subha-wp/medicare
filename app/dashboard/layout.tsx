// @ts-nocheck
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { validateRequest } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/bottom-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediBook",
  description: "Book your medical appointments with ease",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          {user && (
            <aside className="w-64 bg-gray-100 border-r hidden md:block">
              <Sidebar user={user} />
            </aside>
          )}
          <div className="flex-1 flex flex-col overflow-hidden">
            {user && <Header user={user} />}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              {children}
            </main>
            {user && <BottomNav userRole={user.role} />}
          </div>
        </div>
      </body>
    </html>
  );
}
