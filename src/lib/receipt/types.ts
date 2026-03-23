import type { PriceType } from "@/types";

export type RawExtractedReceiptItem = {
  itemNumber: string;
  rawName: string | null;
  price: number;
  priceType: PriceType;
};

export type ExtractedReceiptInfo = {
  items: RawExtractedReceiptItem[];
  warehouseId: string | null;
  purchaseDate: string | null;
};

export type ResolvedReceiptItem = RawExtractedReceiptItem & {
  existsInCatalog: boolean;
  canonicalName: string | null;
};

export type ResolveItemsResult = {
  items: ResolvedReceiptItem[];
  unresolvedItemNumbers: string[];
};

export type ReceiptSubmissionResult = {
  success: boolean;
  items: ResolvedReceiptItem[];
  warehouseId: string | null;
  purchaseDate: string | null;
  message?: string;
};
