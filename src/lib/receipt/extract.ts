import "server-only";

import type { ExtractedReceiptInfo } from "@/lib/receipt/types";

/**
 * TODO:
 * Implement Claude Vision extraction here.
 * Should return parsed items, optional warehouse, and optional purchase date.
 */
export async function extractReceiptInfo(_images: File[]): Promise<ExtractedReceiptInfo> {
  throw new Error("extractReceiptInfo is not implemented yet.");
}
