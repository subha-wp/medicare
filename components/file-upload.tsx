import { useState, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

interface FileUploadProps {
  onChange: (url: string) => void;
  value?: string;
  label: string;
}

export function FileUpload({ onChange, value, label }: FileUploadProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleUpload = useCallback(
    (result: any) => {
      onChange(result.info.secure_url);
    },
    [onChange]
  );

  if (!isMounted) {
    return null;
  }

  return (
    <CldUploadWidget
      onSuccess={handleUpload}
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
