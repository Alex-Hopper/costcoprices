import "server-only";

import type { ResolvedReceipt } from "@/lib/receipt/types";

type SupabaseLike = {
  from: (table: string) => any;
};

type WarehouseRegionRow = {
  id: string;
  costco_region_code: string;
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
  ipAddress: string | null
): Promise<string | null> {
  const geo = ipAddress ? await lookupGeoFromIp(ipAddress) : null;
  const { data, error } = await supabase
    .from("warehouses")
    .select("costco_warehouse_id, latitude, longitude")
    .eq("is_active", true)
    .not("costco_warehouse_id", "is", null);

  if (error) throw error;
  if (!data?.length) return null;

  if (!geo?.ll || geo.ll.length !== 2) {
    return data[0]?.costco_warehouse_id ?? null;
  }

  const [userLatitude, userLongitude] = geo.ll;
  let closestWarehouse = data[0]?.costco_warehouse_id ?? null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const warehouse of data) {
    const latitude = Number(warehouse.latitude);
    const longitude = Number(warehouse.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

    const distance =
      Math.pow(latitude - userLatitude, 2) + Math.pow(longitude - userLongitude, 2);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestWarehouse = warehouse.costco_warehouse_id;
    }
  }

  return closestWarehouse;
}

async function lookupGeoFromIp(ipAddress: string) {
  try {
    const geoip = await import("geoip-lite");
    return geoip.default.lookup(ipAddress);
  } catch {
    return null;
  }
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

export async function syncItemRegionPrices(
  supabase: SupabaseLike,
  receipts: ResolvedReceipt[]
): Promise<void> {
  const warehouseIds = [...new Set(receipts.map((receipt) => receipt.warehouseId).filter(Boolean))];
  if (!warehouseIds.length) return;

  const { data: warehouses, error: warehouseError } = await supabase
    .from("warehouses")
    .select("id, costco_region_code")
    .in("id", warehouseIds);

  if (warehouseError) throw warehouseError;

  const regionByWarehouseId = new Map(
    ((warehouses ?? []) as WarehouseRegionRow[]).map((warehouse) => [
      warehouse.id,
      warehouse.costco_region_code,
    ])
  );

  const latestByKey = new Map<
    string,
    {
      item_number: string;
      costco_region_code: string;
      current_price: number;
      current_price_type: string;
      last_updated_at: string;
    }
  >();

  for (const receipt of receipts) {
    if (!receipt.warehouseId) continue;
    const regionCode = regionByWarehouseId.get(receipt.warehouseId);
    if (!regionCode) continue;

    for (const item of receipt.items) {
      const key = `${item.itemNumber}:${regionCode}`;
      latestByKey.set(key, {
        item_number: item.itemNumber,
        costco_region_code: regionCode,
        current_price: item.price,
        current_price_type: item.priceType,
        last_updated_at: receipt.purchaseDate ?? new Date().toISOString(),
      });
    }
  }

  const rows = [...latestByKey.values()];
  if (!rows.length) return;

  const { error } = await supabase
    .from("item_region_prices")
    .upsert(rows, { onConflict: "item_number,costco_region_code" });

  if (error) throw error;
}
