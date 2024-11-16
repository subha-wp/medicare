"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";

interface FileUploadProps {
  onChange: (value: string) => void;
  value: string;
  label: string;
}

export function FileUpload({ onChange, value, label }: FileUploadProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <CldUploadWidget
      onUpload={(result: any) => onChange(result.info.secure_url)}
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        maxFiles: 1,
        resourceType: "auto",
      }}
    >
      {({ open }) => {
        return (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => open()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {value ? "Change file" : `Upload ${label}`}
            </Button>
            {value && (
              <div className="text-sm text-muted-foreground truncate">
                {value.split("/").pop()}
              </div>
            )}
          </div>
        );
      }}
    </CldUploadWidget>
  );
}