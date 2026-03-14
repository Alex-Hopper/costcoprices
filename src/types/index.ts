export type Country = {
  code: string;
  name: string;
  currency: string;
  is_active: boolean;
};

export type Warehouse = {
  id: string
  costco_warehouse_id: string | null
  name: string
  address: string | null
  city: string
  province_code: string      // 'BC', 'ON'
  costco_region_code: string // 'WC', 'EC'
  country_code: string
  latitude: number
  longitude: number
  is_business_center: boolean
  is_active: boolean
}

export type ItemImage = {
  id: string;
  item_number: string;
  storage_path: string;
  display_order: number;
  created_at: string;
};

export type Item = {
  item_number: string;
  canonical_name: string | null;
  brand: string | null;
  category: string | null;
  is_weighted: boolean;
  unit_size: string | null;
  costco_url: string | null;
  created_at: string;
  last_seen_at: string;
  images?: ItemImage[];
};

export type PriceType = 'fixed' | 'per_kg';
export type SubmissionType = 'receipt' | 'price_tag';

export type Price = {
  id: string;
  item_number: string;
  warehouse_id: string;
  price: number;
  price_type: PriceType;
  currency: string;
  submission_type: SubmissionType;
  is_sale: boolean;
  session_token: string;
  notes: string | null;
  submitted_at: string;
  item?: Item;
  warehouse?: Warehouse;
};

// Intermediate type during confirmation screen, never saved directly
export type ExtractedItem = {
  item_number: string;
  name: string; // raw name from receipt/tag, may be truncated
  price: number;
  price_type: PriceType;
  selected: boolean;
};

// Full context for browsing — what gets shown to users
export type PriceWithContext = Price & {
  item: Item;
  warehouse: Warehouse;
  distance_km?: number;
};
