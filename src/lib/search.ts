export type SearchResultItem = {
  id: string;
  name: string;
  price: number;
  priceType: "fixed" | "per_kg";
  updatedAt: string;
  images: string[];
  image: string;
};

type RegionCode = "WC" | "EC";

type SupabaseLike = {
  from: (table: string) => any;
};

type ItemRow = {
  item_number: string;
  canonical_name: string | null;
};

export function slugifyQuery(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function queryFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .join(" ");
}

function fallbackImage(name: string) {
  const lowered = name.toLowerCase();
  if (lowered.includes("chicken")) return "/hero-images/chicken.png";
  return "/hero-images/milk.png";
}

function toDisplayImagePath(storagePath: string, fallback: string) {
  if (!storagePath) return fallback;
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }
  if (storagePath.startsWith("/")) return storagePath;
  return `/${storagePath}`;
}

export async function searchItemsBySlug(
  supabase: SupabaseLike,
  slug: string,
  region: RegionCode
) {
  const searchTerm = queryFromSlug(slug).trim();
  if (!searchTerm) return [];

  const sanitized = searchTerm.replace(/[%_]/g, "").replace(/\s+/g, " ");
  const ilikePattern = `%${sanitized}%`;

  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("item_number, canonical_name")
    .or(`canonical_name.ilike.${ilikePattern},item_number.ilike.${ilikePattern}`)
    .limit(50);

  if (itemsError) throw itemsError;
  if (!items?.length) return [];

  const itemRows = items as ItemRow[];
  const itemNumbers = itemRows.map((item) => item.item_number);

  const { data: regionPrices, error: pricesError } = await supabase
    .from("item_region_prices")
    .select("item_number, current_price, current_price_type, last_updated_at")
    .eq("costco_region_code", region)
    .in("item_number", itemNumbers);

  if (pricesError) throw pricesError;
  if (!regionPrices?.length) return [];

  const { data: itemImages, error: imagesError } = await supabase
    .from("item_images")
    .select("item_number, storage_path, display_order")
    .in("item_number", itemNumbers)
    .order("display_order", { ascending: true });

  if (imagesError) throw imagesError;

  const itemByNumber = new Map(itemRows.map((item) => [item.item_number, item]));
  const imagesByNumber = new Map<string, string[]>();

  for (const row of itemImages ?? []) {
    const list = imagesByNumber.get(row.item_number) ?? [];
    list.push(row.storage_path);
    imagesByNumber.set(row.item_number, list);
  }

  const mapped: SearchResultItem[] = regionPrices.map((priceRow: any) => {
    const base = itemByNumber.get(priceRow.item_number);
    const name = base?.canonical_name || priceRow.item_number;
    const fallback = fallbackImage(name);
    const storagePaths = imagesByNumber.get(priceRow.item_number) ?? [];
    const images =
      storagePaths.length > 0
        ? storagePaths.map((path) => toDisplayImagePath(path, fallback))
        : [fallback];

    return {
      id: priceRow.item_number,
      name,
      price: Number(priceRow.current_price),
      priceType: priceRow.current_price_type,
      updatedAt: priceRow.last_updated_at,
      images,
      image: images[0],
    };
  });

  return mapped.sort((a, b) => a.name.localeCompare(b.name));
}
