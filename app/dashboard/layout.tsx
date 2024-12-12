// @ts-nocheck
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { validateRequest } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/bottom-nav";
import SessionProvider from "./SessionProvider";
import { redirect } from "next/navigation";

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
  const session = await validateRequest();

  if (!session.user) redirect("/");

  return (
    <SessionProvider value={session}>
      <div className="flex h-screen bg-green-50">
        {session.user && (
          <aside className="w-64 bg-gray-100 border-r hidden md:block">
            <Sidebar user={session.user} />
          </aside>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          {session.user && <Header user={session.user} />}
          <main className="flex-1 overflow-y-auto p-2 md:p-8 mb-12">
            {children}
          </main>
          {session.user && <BottomNav userRole={session.user.role} />}
        </div>
      </div>
    </SessionProvider>
  );
}
