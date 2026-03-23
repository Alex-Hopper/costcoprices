"use client";

import { Camera, Images } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReceiptUploadControlsProps = {
  hasReceipts: boolean;
  onOpenGallery: () => void;
  onOpenCamera: () => void;
};

export default function ReceiptUploadControls({
  hasReceipts,
  onOpenGallery,
  onOpenCamera,
}: ReceiptUploadControlsProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Button variant="outline" size="lg" className="bg-white" onClick={onOpenGallery}>
        <Images className="mr-2 size-4" />
        Select from gallery
      </Button>
      <Button variant="outline" size="lg" className="bg-white" onClick={onOpenCamera}>
        <Camera className="mr-2 size-4" />
        Take a picture
      </Button>
      {hasReceipts ? (
        <Button variant="ghost" size="lg" onClick={onOpenGallery}>
          Add another
        </Button>
      ) : null}
    </div>
  );
}
