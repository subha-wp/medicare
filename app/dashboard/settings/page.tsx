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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Settings</h2>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {(user.role === "DOCTOR" || user.role === "PHARMACY") && (
            <TabsTrigger value="documents">Documents</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <ProfileForm
            userRole={user.role}
            initialData={profileData}
            iniavatarUrl={user.avatarUrl}
          />
        </TabsContent>

        {(user.role === "DOCTOR" || user.role === "PHARMACY") && (
          <TabsContent value="documents">
            <DocumentsView documents={profileData.documents} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
