"use client";

import type { DragEventHandler } from "react";
import { Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ReceiptDropzoneProps = {
  isDragging: boolean;
  onDragOver: DragEventHandler<HTMLDivElement>;
  onDragLeave: DragEventHandler<HTMLDivElement>;
  onDrop: DragEventHandler<HTMLDivElement>;
  onClick: () => void;
};

export default function ReceiptDropzone({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: ReceiptDropzoneProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={`mt-5 cursor-pointer rounded-2xl border-2 border-dashed p-10 transition-colors ${
        isDragging
          ? "border-home-search-button bg-home-page"
          : "border-cream-border bg-home-page/50 hover:border-ink-faint"
      }`}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <Upload className="size-9 text-ink-muted" />
        <p className="mt-3 text-lg font-medium text-ink">Drag and drop receipt photos here</p>
        <p className="mt-1 text-sm text-ink-muted">or tap to choose from your photo library</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="outline" className="bg-white text-ink-muted">
            Images only
          </Badge>
          <Badge variant="outline" className="bg-white text-ink-muted">
            Multiple files supported
          </Badge>
        </div>
      </div>
    </div>
  );
}
