"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { extractReceiptInfo } from "@/lib/receipt/extract";
import { sanitizeExtractedReceiptInfo, hasExtractedItems } from "@/lib/receipt/validate";
import { resolveItems } from "@/lib/receipt/resolve";
import {
  getClosestWarehouseFromIp,
  insertPrices,
  warehouseExists,
} from "@/lib/db/prices";
import type { ReceiptSubmissionResult } from "@/lib/receipt/types";

export async function receiptSubmission(images: File[]): Promise<ReceiptSubmissionResult> {
  if (!images?.length) {
    return {
      success: false,
      items: [],
      warehouseId: null,
      purchaseDate: null,
      message: "No images were provided.",
    };
  }

  const supabase = await createClient();

  let extracted;
  try {
    extracted = await extractReceiptInfo(images);
  } catch (error) {
    return {
      success: false,
      items: [],
      warehouseId: null,
      purchaseDate: null,
      message:
        error instanceof Error
          ? error.message
          : "Failed to extract receipt information.",
    };
  }

  const sanitized = sanitizeExtractedReceiptInfo(extracted);

  if (!hasExtractedItems(sanitized)) {
    return {
      success: false,
      items: [],
      warehouseId: sanitized.warehouseId,
      purchaseDate: sanitized.purchaseDate,
      message: "No items were extracted from this receipt.",
    };
  }

  const headerStore = await headers();
  const userIp =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    null;

  const extractedWarehouseValid = await warehouseExists(supabase, sanitized.warehouseId);
  const warehouseId = extractedWarehouseValid
    ? sanitized.warehouseId
    : await getClosestWarehouseFromIp(supabase, userIp);

  if (!warehouseId) {
    return {
      success: false,
      items: [],
      warehouseId: null,
      purchaseDate: null,
      message: "Could not resolve a warehouse for this submission.",
    };
  }

  const purchaseDate = sanitized.purchaseDate ?? new Date().toISOString();
  const resolved = await resolveItems(supabase, sanitized.items);

  await insertPrices(supabase, {
    items: resolved.items,
    warehouseId,
    purchaseDate,
    sessionToken: crypto.randomUUID(),
  });

  return {
    success: true,
    items: resolved.items,
    warehouseId,
    purchaseDate,
    message:
      resolved.unresolvedItemNumbers.length > 0
        ? `Submitted with ${resolved.unresolvedItemNumbers.length} unresolved item(s).`
        : "Submission processed successfully.",
  };
}
