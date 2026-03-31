-- Countries
create table countries (
  code        char(2) primary key,
  name        text not null,
  currency    char(3) not null,
  is_active   boolean default true
);

insert into countries values ('CA', 'Canada', 'CAD', true);

-- Warehouses
create table warehouses (
  id                   uuid primary key default gen_random_uuid(),
  costco_warehouse_id  text unique,
  name                 text not null,
  address              text,
  city                 text not null,
  province_code        text not null,
  costco_region_code   text not null,
  country_code         char(2) references countries(code),
  latitude             decimal(9,6) not null,
  longitude            decimal(9,6) not null,
  is_business_center   boolean default false,
  is_active            boolean default true
);

-- Items
create table items (
  item_number     text primary key,
  canonical_name  text,
  brand           text,
  category        text,
  is_weighted     boolean default false,
  unit_size       text,
  unit_string     text,
  costco_url      text,
  enrichment_status text not null default 'pending', -- 'pending' | 'enriched' | 'failed'
  created_at      timestamptz default now(),
  last_seen_at    timestamptz default now()
);

-- Item images
create table item_images (
  id            uuid primary key default gen_random_uuid(),
  item_number   text references items(item_number),
  storage_path  text not null,
  display_order integer default 0,
  created_at    timestamptz default now()
);

-- Prices
create table prices (
  id               uuid primary key default gen_random_uuid(),
  item_number      text references items(item_number),
  warehouse_id     uuid references warehouses(id),
  price            decimal(10,2) not null,
  price_type       text not null default 'fixed',
  currency         char(3) not null default 'CAD',
  submission_type  text not null default 'receipt',
  is_sale          boolean default false,
  session_token    text not null default 'N/A',
  notes            text,
  submitted_at     timestamptz default now()
);

create table item_region_prices (
  item_number        text not references items(item_number),
  costco_region_code text not null,  -- 'WC', 'EC', 'CB'
  current_price      decimal(10,2) not null,
  current_price_type text not null,
  last_updated_at    timestamptz default now(),
  primary key (item_number, costco_region_code)
);

create table scrape_backlog (
  id                uuid primary key default gen_random_uuid(),
  item_number       text references items(item_number),
  cycles_in_backlog integer default 0,
  last_attempted_at timestamptz,
  last_failure_reason text,      -- 'no_results' | 'timeout' | 'parse_error'
  status            text default 'pending',  -- 'pending' | 'resolved' | 'failed'
  created_at        timestamptz default now()
);