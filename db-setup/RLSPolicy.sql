-- ── Enable RLS ──────────────────────────────────────────────────────────────
alter table countries enable row level security;
alter table warehouses enable row level security;
alter table items enable row level security;
alter table item_images enable row level security;
alter table prices enable row level security;


-- ── Countries ────────────────────────────────────────────────────────────────
-- Read only, managed manually
create policy "countries: public read"
on countries for select to anon using (true);


-- ── Warehouses ───────────────────────────────────────────────────────────────
-- Read only, seeded by script with service role
create policy "warehouses: public read"
on warehouses for select to anon using (true);


-- ── Items ────────────────────────────────────────────────────────────────────
-- Read only, populated by scraper with service role
create policy "items: public read"
on items for select to anon using (true);


-- ── Item Images ──────────────────────────────────────────────────────────────
-- Read only, populated by scraper with service role
create policy "item_images: public read"
on item_images for select to anon using (true);


-- ── Prices ───────────────────────────────────────────────────────────────────
-- Public read
create policy "prices: public read"
on prices for select to anon using (true);

-- Public insert only — no updates or deletes
-- Once a price is submitted it cannot be changed from the client
create policy "prices: public insert"
on prices for insert to anon
with check (
  price > 0
  and price < 10000        -- sanity check, no $10k items
  and price_type in ('fixed', 'per_kg')
  and submission_type in ('receipt', 'price_tag')
  and currency = 'CAD'     -- Canada only for now
  and session_token is not null
  and session_token != ''
);