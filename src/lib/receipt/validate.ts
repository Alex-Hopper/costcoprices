import "server-only";

import type {
  ExtractedReceipt,
  ExtractedReceiptInfo,
  RawExtractedReceiptItem,
} from "@/lib/receipt/types";

export function sanitizeExtractedReceiptInfo(data: ExtractedReceiptInfo): ExtractedReceiptInfo {
  return {
    receipts: (data.receipts ?? []).map(sanitizeReceipt),
  };
}

export function hasExtractedItems(data: ExtractedReceiptInfo): boolean {
  return data.receipts.some((receipt) => receipt.items.length > 0);
}

export function flattenExtractedReceiptItems(data: ExtractedReceiptInfo): RawExtractedReceiptItem[] {
  return data.receipts.flatMap((receipt) => receipt.items);
}

function sanitizeReceipt(receipt: ExtractedReceipt): ExtractedReceipt {
  return {
    receiptIndex: typeof receipt.receiptIndex === "number" ? receipt.receiptIndex : 0,
    items: (receipt.items ?? []).filter(isValidItem),
    warehouseId: receipt.warehouseId ?? null,
    purchaseDate: receipt.purchaseDate ?? null,
  };
}

function isValidItem(item: RawExtractedReceiptItem): boolean {
  if (typeof item.itemNumber !== "string" || item.itemNumber.trim().length === 0) return false;
  if (typeof item.price !== "number" || item.price < 0 || item.price > 10000) return false;
  if (!["fixed", "per_kg"].includes(item.priceType)) return false;
  if (item.priceType === "per_kg" && typeof item.unitPrice !== "number") return false;
  if (item.priceType === "fixed" && item.unitPrice !== null) return false;
  if (typeof item.isSale !== "boolean") return false;
  return true;
}
