"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractReceiptInfo } from "@/lib/receipt/extract";
import { hasExtractedItems, sanitizeExtractedReceiptInfo } from "@/lib/receipt/validate";
import { resolveItems } from "@/lib/receipt/resolve";
import {
  getClosestWarehouseFromIp,
  insertPrices,
  resolveWarehouseId,
  syncItemRegionPrices,
} from "@/lib/db/prices";
import type {
  ExtractedReceipt,
  ReceiptSubmissionResult,
  ResolvedReceipt,
} from "@/lib/receipt/types";

export async function receiptSubmission(images: File[]): Promise<ReceiptSubmissionResult> {
  if (!images?.length) {
    return {
      success: false,
      receipts: [],
      items: [],
      message: "No images were provided.",
    };
  }

  const supabase = createAdminClient();

  let extracted;
  try {
    extracted = await extractReceiptInfo(images);
  } catch (error) {
    return {
      success: false,
      receipts: [],
      items: [],
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
      receipts: sanitized.receipts.map(toEmptyResolvedReceipt),
      items: [],
      message: "No items were extracted from the submitted receipts.",
    };
  }

  const headerStore = await headers();
  const userIp =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    null;

  const fallbackWarehouseRef = await getClosestWarehouseFromIp(supabase, userIp);
  const finalizedReceipts = await applyReceiptFallbacks(
    supabase,
    sanitized.receipts,
    fallbackWarehouseRef
  );

  if (finalizedReceipts.some((receipt) => !receipt.warehouseId)) {
    return {
      success: false,
      receipts: finalizedReceipts.map(toEmptyResolvedReceipt),
      items: [],
      message: "Could not resolve a warehouse for one or more receipts.",
    };
  }

  const resolved = await resolveItems(supabase, finalizedReceipts);

  await insertPrices(supabase, {
    receipts: resolved.receipts,
    sessionToken: crypto.randomUUID(),
  });
  await syncItemRegionPrices(supabase, resolved.receipts);

  return {
    success: true,
    receipts: resolved.receipts,
    items: resolved.items,
    message:
      resolved.unresolvedItemNumbers.length > 0
        ? `Submitted with ${resolved.unresolvedItemNumbers.length} unresolved item(s).`
        : "Submission processed successfully.",
  };
}

async function applyReceiptFallbacks(
  supabase: ReturnType<typeof createAdminClient>,
  receipts: ExtractedReceipt[],
  fallbackWarehouseRef: string | null
): Promise<ExtractedReceipt[]> {
  const resolvedFallbackWarehouseId = await resolveWarehouseId(supabase, fallbackWarehouseRef);

  return Promise.all(
    receipts.map(async (receipt) => {
      const resolvedWarehouseId = await resolveWarehouseId(supabase, receipt.warehouseId);
      return {
        ...receipt,
        warehouseId: resolvedWarehouseId ?? resolvedFallbackWarehouseId,
        purchaseDate: receipt.purchaseDate ?? new Date().toISOString(),
      };
    })
  );
}

function toEmptyResolvedReceipt(receipt: ExtractedReceipt): ResolvedReceipt {
  return {
    receiptIndex: receipt.receiptIndex,
    warehouseId: receipt.warehouseId,
    purchaseDate: receipt.purchaseDate,
    items: [],
  };
}
