import "server-only";

import type {
  ExtractedReceipt,
  ExtractedReceiptInfo,
  RawExtractedReceiptItem,
} from "@/lib/receipt/types";

const ITEM_NUMBER_PATTERN = /^\d+$/;
const WAREHOUSE_ID_PATTERN = /^\d+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

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
    receiptIndex: Number.isInteger(receipt.receiptIndex) && receipt.receiptIndex >= 0
      ? receipt.receiptIndex
      : 0,
    items: (receipt.items ?? []).filter(isValidItem),
    warehouseId: sanitizeWarehouseId(receipt.warehouseId),
    purchaseDate: sanitizePurchaseDate(receipt.purchaseDate),
  };
}

function isValidItem(item: RawExtractedReceiptItem): boolean {
  // Item number must exist and be digits only.
  if (typeof item.itemNumber !== "string" || !ITEM_NUMBER_PATTERN.test(item.itemNumber.trim())) {
    return false;
  }

  // Price must be a real number in a sane Costco receipt range.
  if (!Number.isFinite(item.price) || item.price < 0 || item.price > 10000) {
    return false;
  }

  // Price type must be one of the two supported values.
  if (!["fixed", "per_kg"].includes(item.priceType)) {
    return false;
  }

  // Weighted items must include a numeric unit price.
  if (item.priceType === "per_kg" && (!Number.isFinite(item.unitPrice) || item.unitPrice === null)) {
    return false;
  }

  // Fixed-price items must not include a unit price.
  if (item.priceType === "fixed" && item.unitPrice !== null) {
    return false;
  }

  // Sale flag must be a boolean, never truthy/falsy junk data.
  if (typeof item.isSale !== "boolean") {
    return false;
  }

  // Raw receipt name can be null, but if present it must contain visible text.
  if (item.rawName !== null && (typeof item.rawName !== "string" || item.rawName.trim().length === 0)) {
    return false;
  }

  return true;
}

function sanitizeWarehouseId(warehouseId: string | null): string | null {
  // Warehouse ids extracted from receipts should be Costco warehouse numbers, not arbitrary text.
  if (typeof warehouseId !== "string") return null;
  const trimmed = warehouseId.trim();
  return WAREHOUSE_ID_PATTERN.test(trimmed) ? trimmed : null;
}

function sanitizePurchaseDate(purchaseDate: string | null): string | null {
  // Purchase date should already be normalized to ISO before validation reaches this layer.
  if (typeof purchaseDate !== "string") return null;
  const trimmed = purchaseDate.trim();
  return ISO_DATE_PATTERN.test(trimmed) ? trimmed : null;
}
