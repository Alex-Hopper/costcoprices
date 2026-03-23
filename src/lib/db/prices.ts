import "server-only";

import type { ResolvedReceipt } from "@/lib/receipt/types";

type SupabaseLike = {
  from: (table: string) => any;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function resolveWarehouseId(
  supabase: SupabaseLike,
  warehouseRef: string | null
): Promise<string | null> {
  if (!warehouseRef) return null;

  const column = UUID_PATTERN.test(warehouseRef) ? "id" : "costco_warehouse_id";
  const { data, error } = await supabase
    .from("warehouses")
    .select("id")
    .eq(column, warehouseRef)
    .limit(1);

  if (error) throw error;
  return data?.[0]?.id ?? null;
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
    receipts: ResolvedReceipt[];
    sessionToken: string;
  }
): Promise<void> {
  const rows = params.receipts.flatMap((receipt) =>
    receipt.items
      .filter((item) => item.existsInCatalog && receipt.warehouseId)
      .map((item) => ({
        item_number: item.itemNumber,
        warehouse_id: receipt.warehouseId!,
        price: item.price,
        price_type: item.priceType,
        currency: "CAD",
        submission_type: "receipt",
        is_sale: item.isSale,
        session_token: params.sessionToken,
        submitted_at: receipt.purchaseDate ?? new Date().toISOString(),
      }))
  );

  if (!rows.length) return;

  const { error } = await supabase.from("prices").insert(rows);
  if (error) throw error;
}
