import "server-only";

import type { RawExtractedReceiptItem } from "@/lib/receipt/types";

type SupabaseLike = {
  from: (table: string) => any;
};

type ScrapeBacklogRow = {
  item_number: string;
  status: string;
};

export async function getItemsByNumbers(
  supabase: SupabaseLike,
  itemNumbers: string[]
): Promise<Map<string, { canonical_name: string | null }>> {
  if (!itemNumbers.length) return new Map();

  const { data, error } = await supabase
    .from("items")
    .select("item_number, canonical_name")
    .in("item_number", itemNumbers);

  if (error) throw error;

  const mapped = new Map<string, { canonical_name: string | null }>();
  for (const row of data ?? []) {
    mapped.set(row.item_number, { canonical_name: row.canonical_name ?? null });
  }
  return mapped;
}

export async function insertItem(
  supabase: SupabaseLike,
  item: {
    itemNumber: string;
    canonicalName?: string | null;
  }
): Promise<void> {
  const { error } = await supabase.from("items").insert({
    item_number: item.itemNumber,
    canonical_name: item.canonicalName ?? null,
  });

  if (error) throw error;
}

export async function insertPlaceholderItems(
  supabase: SupabaseLike,
  items: RawExtractedReceiptItem[]
): Promise<void> {
  const rows = [...new Map(
    items.map((item) => [
      item.itemNumber,
      {
        item_number: item.itemNumber,
        canonical_name: item.rawName,
        enrichment_status: "pending",
      },
    ])
  ).values()];

  if (!rows.length) return;

  const { error } = await supabase
    .from("items")
    .upsert(rows, { onConflict: "item_number", ignoreDuplicates: true });

  if (error) throw error;
}

export async function addItemsToScrapeBacklog(
  supabase: SupabaseLike,
  itemNumbers: string[]
): Promise<void> {
  const uniqueItemNumbers = [...new Set(itemNumbers.filter(Boolean))];
  if (!uniqueItemNumbers.length) return;

  const { data: existingRows, error: existingError } = await supabase
    .from("scrape_backlog")
    .select("item_number, status")
    .in("item_number", uniqueItemNumbers)
    .in("status", ["pending", "resolved"]);

  if (existingError) throw existingError;

  const alreadyQueued = new Set(
    ((existingRows ?? []) as ScrapeBacklogRow[]).map((row) => row.item_number)
  );
  const rowsToInsert = uniqueItemNumbers
    .filter((itemNumber) => !alreadyQueued.has(itemNumber))
    .map((itemNumber) => ({
      item_number: itemNumber,
      status: "pending",
    }));

  if (!rowsToInsert.length) return;

  const { error } = await supabase.from("scrape_backlog").insert(rowsToInsert);
  if (error) throw error;
}
