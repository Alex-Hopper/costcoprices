"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { SearchResultItem } from "@/lib/search";
import { useRegion } from "@/contexts/RegionContext";

type ItemDetailsDialogProps = {
  item: SearchResultItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function priceLabel(item: SearchResultItem) {
  return item.priceType === "per_kg"
    ? `$${item.price.toFixed(2)} / kg`
    : `$${item.price.toFixed(2)}`;
}

export default function ItemDetailsDialog({
  item,
  open,
  onOpenChange,
}: ItemDetailsDialogProps) {
  const { region, regionLabel, setRegion } = useRegion();
  const [imageIndex, setImageIndex] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    setImageIndex(0);
    setReportOpen(false);
    setNewPrice("");
  }, [item?.id, open]);

  const updatedAtLabel = useMemo(() => {
    if (!item) return "";
    return new Date(item.updatedAt).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [item]);

  if (!item) return null;

  const images = item.images;
  const currentImage = images[imageIndex] ?? null;
  const unitLabel = item.priceType === "per_kg" ? "per kg" : "each";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="space-y-3">
            <Badge variant="outline" className="w-fit bg-white text-ink-muted">
              Updated {updatedAtLabel}
            </Badge>
            <DialogTitle className="text-2xl font-serif text-ink">{item.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Product details and reporting actions.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-1">
            <div className="flex items-end gap-3">
              <p className="text-3xl font-semibold text-ink">${item.price.toFixed(2)}</p>
              {item.priceType === "per_kg" ? (
                <Badge variant="secondary" className="mb-1 bg-cream-border text-ink-muted">
                  per kg
                </Badge>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Member-submitted price snapshot. Packaging, promotions, and regional inventory may
              vary by warehouse.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <div className="relative h-72 w-full overflow-hidden rounded-lg border border-cream-border bg-white">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className="object-contain p-4"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-ink-faint">
                  <ImageOff className="h-10 w-10" />
                  <span className="text-sm font-medium">No product image yet</span>
                </div>
              )}
            </div>

            {images.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    className={`relative h-16 w-16 overflow-hidden rounded-md border-2 bg-white transition-colors ${
                      index === imageIndex
                        ? "border-home-search-button"
                        : "border-cream-border hover:border-ink-faint"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${item.name} preview ${index + 1}`}
                      fill
                      sizes="64px"
                      className="object-contain p-1.5"
                    />
                  </button>
                ))}
              </div>
            ) : null}

            <Button
              className="mt-2 w-full bg-home-search-button text-home-page hover:opacity-90"
              onClick={() => setReportOpen(true)}
            >
              Report incorrect price
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-ink">Confirm your region</DialogTitle>
            <DialogDescription className="text-sm text-ink-muted">
              Placeholder flow for reporting a corrected price.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-lg border border-cream-border bg-white/70 p-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-base font-medium text-ink">Western Canada</p>
            </div>
            <p className="text-sm text-ink-muted">If this is not your region please check the price for your region.</p>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm text-ink-muted">
              New price ({unitLabel})
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder={item.priceType === "per_kg" ? "e.g. 12.99" : "e.g. 24.99"}
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="bg-white"
            />
          </div>

          <DialogFooter>
            <DialogClose className="inline-flex h-8 items-center justify-center rounded-md border border-cream-border bg-white px-3 text-sm text-ink">
              Cancel
            </DialogClose>
            <Button
              onClick={() => setReportOpen(false)}
              disabled={!newPrice.trim()}
              className="bg-home-search-button text-home-page hover:opacity-90"
            >
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
