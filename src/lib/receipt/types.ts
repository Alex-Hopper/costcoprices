import type { PriceType } from "@/types";

export type RawExtractedReceiptItem = {
  itemNumber: string;
  rawName: string | null;
  price: number;
  priceType: PriceType;
  unitPrice: number | null;
  isSale: boolean;
};

export type ExtractedReceipt = {
  receiptIndex: number;
  items: RawExtractedReceiptItem[];
  warehouseId: string | null;
  purchaseDate: string | null;
};

export type ExtractedReceiptInfo = {
  receipts: ExtractedReceipt[];
};

export type ResolvedReceiptItem = RawExtractedReceiptItem & {
  existsInCatalog: boolean;
  canonicalName: string | null;
};

export type ResolvedReceipt = {
  receiptIndex: number;
  items: ResolvedReceiptItem[];
  warehouseId: string | null;
  purchaseDate: string | null;
};

export type ResolveItemsResult = {
  receipts: ResolvedReceipt[];
  items: ResolvedReceiptItem[];
  unresolvedItemNumbers: string[];
};

export type ReceiptSubmissionResult = {
  success: boolean;
  receipts: ResolvedReceipt[];
  items: ResolvedReceiptItem[];
  message?: string;
};
