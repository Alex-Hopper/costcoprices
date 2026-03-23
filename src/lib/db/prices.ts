import "server-only";

import type { ResolvedReceiptItem } from "@/lib/receipt/types";

type SupabaseLike = {
  from: (table: string) => any;
};

export async function warehouseExists(
  supabase: SupabaseLike,
  warehouseId: string | null
): Promise<boolean> {
  if (!warehouseId) return false;

  const { data, error } = await supabase
    .from("warehouses")
    .select("id")
    .eq("id", warehouseId)
    .limit(1);

  if (error) throw error;
  return Boolean(data?.length);
}

export async function getClosestWarehouseFromIp(
  supabase: SupabaseLike,
  _ipAddress: string | null
): Promise<string | null> {
  // Placeholder fallback until IP geolocation is added.
  const { data, error } = await supabase
    .from("warehouses")
    .select("id")
    .eq("is_active", true)
    .limit(1);

  if (error) throw error;
  return data?.[0]?.id ?? null;
}

export async function insertPrices(
  supabase: SupabaseLike,
  params: {
    items: ResolvedReceiptItem[];
    warehouseId: string;
    purchaseDate: string | null;
    sessionToken: string;
  }
): Promise<void> {
  const rows = params.items
    .filter((item) => item.existsInCatalog)
    .map((item) => ({
      item_number: item.itemNumber,
      warehouse_id: params.warehouseId,
      price: item.price,
      price_type: item.priceType,
      currency: "CAD",
      submission_type: "receipt",
      is_sale: false,
      session_token: params.sessionToken,
      submitted_at: params.purchaseDate ?? new Date().toISOString(),
    }));

  if (!rows.length) return;

  const { error } = await supabase.from("prices").insert(rows);
  if (error) throw error;
}
