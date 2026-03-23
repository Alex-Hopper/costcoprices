import "server-only";

import { getItemsByNumbers } from "@/lib/db/items";
import { queueScrapeJobs } from "@/lib/scraper/queue";
import { scrapeCostcoItem } from "@/lib/scraper/costco";
import type {
  ExtractedReceipt,
  ResolveItemsResult,
  ResolvedReceipt,
} from "@/lib/receipt/types";

type SupabaseLike = {
  from: (table: string) => any;
};

export async function resolveItems(
  supabase: SupabaseLike,
  receipts: ExtractedReceipt[]
): Promise<ResolveItemsResult> {
  const allItems = receipts.flatMap((receipt) => receipt.items);
  const uniqueItemNumbers = [...new Set(allItems.map((item) => item.itemNumber).filter(Boolean))];
  const existing = await getItemsByNumbers(supabase, uniqueItemNumbers);

  const initiallyMissing = uniqueItemNumbers.filter((itemNumber) => !existing.has(itemNumber));

  if (initiallyMissing.length) {
    await queueScrapeJobs(initiallyMissing);
    await Promise.allSettled(initiallyMissing.map((itemNumber) => scrapeCostcoItem(itemNumber)));
  }

  const refreshed = await getItemsByNumbers(supabase, uniqueItemNumbers);
  const unresolvedItemNumbers = uniqueItemNumbers.filter((itemNumber) => !refreshed.has(itemNumber));

  const resolvedReceipts: ResolvedReceipt[] = receipts.map((receipt) => ({
    receiptIndex: receipt.receiptIndex,
    warehouseId: receipt.warehouseId,
    purchaseDate: receipt.purchaseDate,
    items: receipt.items.map((item) => {
      const resolved = refreshed.get(item.itemNumber);
      return {
        ...item,
        existsInCatalog: Boolean(resolved),
        canonicalName: resolved?.canonical_name ?? null,
      };
    }),
  }));

  return {
    receipts: resolvedReceipts,
    items: resolvedReceipts.flatMap((receipt) => receipt.items),
    unresolvedItemNumbers,
  };
}
