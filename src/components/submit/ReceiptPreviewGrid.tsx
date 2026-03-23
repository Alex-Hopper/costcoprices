"use client";

import { X } from "lucide-react";
import type { UploadReceipt } from "@/components/submit/types";

type ReceiptPreviewGridProps = {
  receipts: UploadReceipt[];
  receiptCountLabel: string;
  onRemove: (id: string) => void;
};

export default function ReceiptPreviewGrid({
  receipts,
  receiptCountLabel,
  onRemove,
}: ReceiptPreviewGridProps) {
  if (!receipts.length) return null;

  return (
    <div className="mt-6">
      <p className="text-sm text-ink-muted">{receiptCountLabel}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {receipts.map((receipt) => (
          <div
            key={receipt.id}
            className="relative overflow-hidden rounded-lg border border-cream-border bg-home-page"
          >
            <img
              src={receipt.previewUrl}
              alt={receipt.file.name}
              className="h-36 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(receipt.id)}
              className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-black/60 text-white"
              aria-label={`Remove ${receipt.file.name}`}
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
