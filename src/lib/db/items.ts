import "server-only";

type SupabaseLike = {
  from: (table: string) => any;
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
