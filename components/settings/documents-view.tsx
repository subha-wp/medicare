import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, X, Download, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useSession } from "@/app/dashboard/SessionProvider";

interface DocumentsViewProps {
  documents: string;
}

export function DocumentsView({ documents }: DocumentsViewProps) {
  const [openDoc, setOpenDoc] = useState<string | null>(null);
  const { user } = useSession();

  const parsedDocs = JSON.parse(documents);

  const documentTitles: { [key: string]: string } = {
    licenseDoc: "License",
    aadhaarDoc: "Aadhaar",
    tradeLicenseDoc: "Trade License",
    gstinDoc: "GSTIN Document",
  };

  const isImageFile = (url: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const isPDFFile = (url: string) => {
    return url.toLowerCase().endsWith(".pdf");
  };

  const renderDocument = (key: string, docUrl: string) => {
    const title = documentTitles[key] || key;
    const isImage = isImageFile(docUrl);
    const isPDF = isPDFFile(docUrl);

    return (
      <div key={key} className="space-y-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <Dialog
          open={openDoc === docUrl}
          onOpenChange={(open) => setOpenDoc(open ? docUrl : null)}
        >
          <DialogTrigger asChild>
            <div className="relative rounded-lg border bg-muted/50 p-4 hover:bg-muted cursor-pointer">
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">
                    Click to view document
                  </p>
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full h-[90vh]">
            <DialogTitle className="text-lg font-semibold mb-4">
              {title}
            </DialogTitle>

            {isImage ? (
              <div className="w-full h-full flex items-center justify-center">
                <Image
                  src={docUrl}
                  alt={title}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            ) : isPDF ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <p className="text-center mb-4">
                  PDF viewer may not be available. You can download the PDF or
                  open it in a new tab.
                </p>
                <object
                  data={`${docUrl}#toolbar=0`}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                ></object>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p>Unsupported file type. Please download to view.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Documents</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {Object.entries(parsedDocs).map(([key, value]) => (
          <div key={key}>
            {value && typeof value === "string" ? (
              renderDocument(key, value)
            ) : (
              <p className="text-sm text-muted-foreground">
                No document uploaded
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
