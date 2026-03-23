"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UploadReceipt } from "@/components/submit/types";
import SubmitSuccessCard from "@/components/submit/SubmitSuccessCard";
import ReceiptDropzone from "@/components/submit/ReceiptDropzone";
import ReceiptUploadControls from "@/components/submit/ReceiptUploadControls";
import ReceiptPreviewGrid from "@/components/submit/ReceiptPreviewGrid";

function makeId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function SubmitPage() {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [receipts, setReceipts] = useState<UploadReceipt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      receipts.forEach((receipt) => URL.revokeObjectURL(receipt.previewUrl));
    };
  }, [receipts]);

  const receiptCountLabel = useMemo(() => {
    if (receipts.length === 1) return "1 receipt added";
    return `${receipts.length} receipts added`;
  }, [receipts.length]);

  const addFiles = (files: FileList | File[]) => {
    const selected = Array.from(files);
    if (!selected.length) return;

    const imageFiles = selected.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== selected.length) {
      setError("Only image files are allowed.");
    } else {
      setError(null);
    }

    setReceipts((previous) => {
      const existingIds = new Set(previous.map((entry) => entry.id));
      const next: UploadReceipt[] = [];

      for (const file of imageFiles) {
        const id = makeId(file);
        if (existingIds.has(id)) continue;
        next.push({ id, file, previewUrl: URL.createObjectURL(file) });
      }

      return [...previous, ...next];
    });
  };

  const removeReceipt = (id: string) => {
    setReceipts((previous) => {
      const target = previous.find((receipt) => receipt.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return previous.filter((receipt) => receipt.id !== id);
    });
  };

  const resetFlow = () => {
    receipts.forEach((receipt) => URL.revokeObjectURL(receipt.previewUrl));
    setReceipts([]);
    setError(null);
    setIsSubmitting(false);
    setSubmitted(false);
  };

  const openGalleryPicker = () => galleryInputRef.current?.click();
  const openCameraPicker = () => cameraInputRef.current?.click();

  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const onSubmit = async () => {
    if (!receipts.length || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 700));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-home-page">
        <Banner />
        <Navbar />

        <div className="mx-auto flex w-full max-w-3xl px-6 py-16">
          <SubmitSuccessCard onSubmitAnother={resetFlow} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-home-page">
      <Banner />
      <Navbar />

      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <Card className="border-cream-border bg-white/85">
          <CardHeader className="pb-0">
            <CardTitle className="text-3xl font-serif text-ink">Submit a receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-muted">
              Upload receipt photos to help update prices. You can add one now, then add more.
            </p>

            <ReceiptDropzone
              isDragging={isDragging}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={openGalleryPicker}
            />

            <ReceiptUploadControls
              hasReceipts={receipts.length > 0}
              onOpenGallery={openGalleryPicker}
              onOpenCamera={openCameraPicker}
            />

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files ?? []);
                event.currentTarget.value = "";
              }}
            />

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files ?? []);
                event.currentTarget.value = "";
              }}
            />

            {error ? (
              <p className="mt-3 text-sm text-red-700">{error}</p>
            ) : null}

            <ReceiptPreviewGrid
              receipts={receipts}
              receiptCountLabel={receiptCountLabel}
              onRemove={removeReceipt}
            />

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={onSubmit}
                disabled={receipts.length === 0 || isSubmitting}
                className="bg-home-search-button text-home-page hover:opacity-90"
              >
                {isSubmitting ? "Submitting..." : "Submit receipts"}
              </Button>
              {receipts.length > 0 ? (
                <Button variant="ghost" size="lg" onClick={resetFlow}>
                  Clear all
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
