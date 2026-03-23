import "server-only";

import type { ExtractedReceiptInfo, RawExtractedReceiptItem } from "@/lib/receipt/types";

export function sanitizeExtractedReceiptInfo(data: ExtractedReceiptInfo): ExtractedReceiptInfo {
  const items = (data.items ?? []).filter((item: any) => {
    if (typeof item.itemNumber !== "string") return false;
    if (typeof item.price !== "number" || item.price < 0 || item.price > 10000) return false;
    if (!["fixed", "per_kg"].includes(item.priceType)) return false;
    return true;
  });

  return {
    items,
    warehouseId: data.warehouseId ?? null,
    purchaseDate: data.purchaseDate ?? null,
  };
}

export function hasExtractedItems(data: ExtractedReceiptInfo): boolean {
  return data.items.length > 0;
}
