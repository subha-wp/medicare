"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { DocumentsView } from "@/components/settings/documents-view";
import { useSession } from "../SessionProvider";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();

        if (data.error) {
          toast.error(data.error);
          return;
        }

        setProfileData(data.profile);
      } catch (error) {
        toast.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Native-style tab navigation */}
      <div className="bg-white border-b border-gray-200">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full h-12 bg-transparent p-0 rounded-none">
            <TabsTrigger 
              value="profile" 
              className="flex-1 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent "
            >
              Profile
            </TabsTrigger>
            {(user.role === "DOCTOR" || user.role === "PHARMACY") && (
              <TabsTrigger 
                value="documents"
                className="flex-1 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
              >
                Documents
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <div className="px-4 py-6">
              <ProfileForm
                userRole={user.role}
                initialData={profileData}
                iniavatarUrl={user.avatarUrl}
              />
            </div>
          </TabsContent>

          {(user.role === "DOCTOR" || user.role === "PHARMACY") && (
            <TabsContent value="documents" className="mt-0">
              <div className="px-4 py-6">
                <DocumentsView documents={profileData.documents} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
