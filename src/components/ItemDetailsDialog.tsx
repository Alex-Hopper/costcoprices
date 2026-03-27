"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SearchResultItem } from "@/lib/search";
import { createClient } from "@/lib/supabase/client";
import { useRegion } from "@/contexts/RegionContext";

type ItemDetailsDialogProps = {
  item: SearchResultItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type WarehouseRelationRow =
  | {
      city: string | null;
      costco_region_code: string | null;
    }
  | Array<{
      city: string | null;
      costco_region_code: string | null;
    }>
  | null;

type RecentSubmissionRow = {
  price: number | string;
  price_type: "fixed" | "per_kg";
  submitted_at: string;
  warehouses: WarehouseRelationRow;
};

type RecentSubmission = {
  price: number;
  priceType: "fixed" | "per_kg";
  submittedAt: string;
  city: string | null;
};

const RECENT_SUBMISSION_LIMIT = 10;
const RECENT_SUBMISSION_FETCH_LIMIT = 60;

function formatSubmissionDate(submittedAt: string) {
  return new Date(submittedAt).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function dedupeRecentSubmissions(submissions: RecentSubmission[]) {
  const seen = new Set<string>();

  return submissions.filter((submission) => {
    const key = [
      submission.city ?? "",
      formatSubmissionDate(submission.submittedAt),
      submission.price.toFixed(2),
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export default function ItemDetailsDialog({
  item,
  open,
  onOpenChange,
}: ItemDetailsDialogProps) {
  const { region, regionLabel } = useRegion();
  const [imageIndex, setImageIndex] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);

  useEffect(() => {
    setImageIndex(0);
  }, [item?.id, open]);

  useEffect(() => {
    if (!open || !item) {
      setRecentSubmissions([]);
      setRecentLoading(false);
      setRecentError(null);
      return;
    }

    let canceled = false;
    const supabase = createClient();

    const loadRecentSubmissions = async () => {
      setRecentLoading(true);
      setRecentError(null);

      try {
        const { data, error } = await supabase
          .from("prices")
          .select("price, price_type, submitted_at, warehouses(city, costco_region_code)")
          .eq("item_number", item.id)
          .order("submitted_at", { ascending: false })
          .limit(RECENT_SUBMISSION_FETCH_LIMIT);

        if (error) throw error;

        const submissions = ((data ?? []) as RecentSubmissionRow[])
          .map((row) => {
            const warehouse = Array.isArray(row.warehouses)
              ? row.warehouses[0] ?? null
              : row.warehouses;

            if (warehouse?.costco_region_code !== region) {
              return null;
            }

            return {
              price: Number(row.price),
              priceType: row.price_type,
              submittedAt: row.submitted_at,
              city: warehouse?.city ?? null,
            };
          })
          .filter((submission): submission is RecentSubmission => submission !== null)
          .filter((submission) => Number.isFinite(submission.price));

        const uniqueSubmissions = dedupeRecentSubmissions(submissions)
          .slice(0, RECENT_SUBMISSION_LIMIT);

        if (!canceled) {
          setRecentSubmissions(uniqueSubmissions);
        }
      } catch {
        if (!canceled) {
          setRecentSubmissions([]);
          setRecentError("Could not load recent submissions.");
        }
      } finally {
        if (!canceled) {
          setRecentLoading(false);
        }
      }
    };

    loadRecentSubmissions();

    return () => {
      canceled = true;
    };
  }, [item, open, region]);

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
  const shouldScrollRecentSubmissions = recentSubmissions.length > 3;

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
              Member-submitted price snapshots. Prices and inventory may vary from warehouse to warehouse.
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

            <div className="rounded-xl border border-cream-border bg-white/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Recent submissions</h3>
                  {/* <p className="mt-1 text-sm text-ink-muted">
                    Up to {RECENT_SUBMISSION_LIMIT} most recent member-submitted prices in {regionLabel}.
                  </p> */}
                </div>
              </div>

              {recentLoading ? (
                <p className="mt-4 text-sm text-ink-muted">Loading recent submissions...</p>
              ) : recentError ? (
                <p className="mt-4 text-sm text-red-700">{recentError}</p>
              ) : recentSubmissions.length === 0 ? (
                <p className="mt-4 text-sm text-ink-muted">
                  No recent submissions yet for this region.
                </p>
              ) : (
                <ScrollArea
                  className={shouldScrollRecentSubmissions ? "mt-4 h-56 overflow-hidden" : "mt-4"}
                >
                  <div className="space-y-2 pr-3">
                    {recentSubmissions.map((submission, index) => (
                      <div
                        key={`${item.id}-${submission.submittedAt}-${index}`}
                        className="flex items-center justify-between gap-4 rounded-lg border border-cream-border bg-home-page/60 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {submission.city ?? "Unknown city"}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {formatSubmissionDate(submission.submittedAt)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-ink">
                          {submission.priceType === "per_kg"
                            ? `$${submission.price.toFixed(2)} / kg`
                            : `$${submission.price.toFixed(2)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
