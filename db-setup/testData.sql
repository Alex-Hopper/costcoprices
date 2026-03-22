insert into items (item_number, canonical_name, brand, category, is_weighted, unit_size, costco_url) values
('1234567', 'Kirkland Signature Organic Extra Virgin Olive Oil', 'Kirkland Signature', 'Pantry', false, '2L', null),
('2345678', 'Kirkland Signature Rotisserie Chicken', 'Kirkland Signature', 'Deli', false, null, null),
('3456789', 'Kirkland Signature Wild Sockeye Salmon', 'Kirkland Signature', 'Meat & Seafood', true, '1.36kg', null),
('4567890', 'Kirkland Signature Greek Yogurt', 'Kirkland Signature', 'Dairy', false, '1.36kg', null),
('5678901', 'Kirkland Signature Almond Butter', 'Kirkland Signature', 'Pantry', false, '765g', null),
('6789012', 'Kirkland Signature Chicken Breast', 'Kirkland Signature', 'Meat & Seafood', true, null, null),
('7890123', 'Kirkland Signature Organic Chicken Broth', 'Kirkland Signature', 'Pantry', false, '6 x 946ml', null),
('8901234', 'Kirkland Signature Butter Unsalted', 'Kirkland Signature', 'Dairy', false, '4 x 454g', null),
('9012345', 'Altius Garlic Powder', 'Altius', 'Pantry', false, '675g', null),
('1122334', 'Kirkland Signature Whole Milk', 'Kirkland Signature', 'Dairy', false, '4L', null),
('2233445', 'Kirkland Signature Bacon', 'Kirkland Signature', 'Meat & Seafood', false, '1.5kg', null),
('3344556', 'Kirkland Signature Mixed Nuts', 'Kirkland Signature', 'Snacks', false, '1.13kg', null),
('4455667', 'Kirkland Signature Parmigiano Reggiano', 'Kirkland Signature', 'Dairy', false, '1kg', null),
('5566778', 'Kirkland Signature Eggs Free Range', 'Kirkland Signature', 'Dairy', false, '2 dozen', null),
('6677889', 'Kirkland Signature Coffee Dark Roast', 'Kirkland Signature', 'Beverages', false, '1.36kg', null);




insert into prices (item_number, warehouse_id, price, price_type, currency, submission_type, is_sale, session_token) values
-- WC prices
('1234567', (select id from warehouses where city = 'Vancouver' limit 1), 15.99, 'fixed', 'CAD', 'receipt', false, 'seed-001'),
('2345678', (select id from warehouses where city = 'Vancouver' limit 1), 7.99, 'fixed', 'CAD', 'price_tag', false, 'seed-002'),
('3456789', (select id from warehouses where city = 'Calgary' limit 1), 24.99, 'per_kg', 'CAD', 'price_tag', false, 'seed-003'),
('4567890', (select id from warehouses where city = 'Vancouver' limit 1), 8.49, 'fixed', 'CAD', 'receipt', false, 'seed-004'),
('5678901', (select id from warehouses where city = 'Edmonton' limit 1), 11.49, 'fixed', 'CAD', 'receipt', false, 'seed-005'),
('6789012', (select id from warehouses where city = 'Vancouver' limit 1), 15.79, 'per_kg', 'CAD', 'price_tag', false, 'seed-006'),
('7890123', (select id from warehouses where city = 'Calgary' limit 1), 12.99, 'fixed', 'CAD', 'receipt', false, 'seed-007'),
('8901234', (select id from warehouses where city = 'Vancouver' limit 1), 14.99, 'fixed', 'CAD', 'receipt', true, 'seed-008'),
('9012345', (select id from warehouses where city = 'Edmonton' limit 1), 7.99, 'fixed', 'CAD', 'price_tag', false, 'seed-009'),
('1122334', (select id from warehouses where city = 'Vancouver' limit 1), 5.99, 'fixed', 'CAD', 'receipt', false, 'seed-010'),
('2233445', (select id from warehouses where city = 'Calgary' limit 1), 19.99, 'fixed', 'CAD', 'receipt', false, 'seed-011'),
('3344556', (select id from warehouses where city = 'Vancouver' limit 1), 21.99, 'fixed', 'CAD', 'price_tag', false, 'seed-012'),
('4455667', (select id from warehouses where city = 'Edmonton' limit 1), 16.99, 'fixed', 'CAD', 'receipt', false, 'seed-013'),
('5566778', (select id from warehouses where city = 'Vancouver' limit 1), 9.99, 'fixed', 'CAD', 'receipt', false, 'seed-014'),
('6677889', (select id from warehouses where city = 'Calgary' limit 1), 24.99, 'fixed', 'CAD', 'price_tag', false, 'seed-015'),

-- EC prices (slightly different to test regional variance)
('1234567', (select id from warehouses where city = 'Toronto' limit 1), 16.49, 'fixed', 'CAD', 'receipt', false, 'seed-016'),
('2345678', (select id from warehouses where city = 'Toronto' limit 1), 7.99, 'fixed', 'CAD', 'receipt', false, 'seed-017'),
('3456789', (select id from warehouses where city = 'Ottawa' limit 1), 25.49, 'per_kg', 'CAD', 'price_tag', false, 'seed-018'),
('4567890', (select id from warehouses where city = 'Montreal' limit 1), 8.99, 'fixed', 'CAD', 'receipt', false, 'seed-019'),
('6789012', (select id from warehouses where city = 'Toronto' limit 1), 15.79, 'per_kg', 'CAD', 'price_tag', false, 'seed-020'),
('8901234', (select id from warehouses where city = 'Toronto' limit 1), 14.99, 'fixed', 'CAD', 'receipt', false, 'seed-021'),
('3344556', (select id from warehouses where city = 'Montreal' limit 1), 22.49, 'fixed', 'CAD', 'receipt', false, 'seed-022'),
('5566778', (select id from warehouses where city = 'Toronto' limit 1), 9.99, 'fixed', 'CAD', 'receipt', false, 'seed-023'),
('6677889', (select id from warehouses where city = 'Ottawa' limit 1), 24.99, 'fixed', 'CAD', 'price_tag', false, 'seed-024');




insert into item_region_prices (item_number, costco_region_code, current_price, current_price_type, last_updated_at) values
-- WC
('1234567', 'WC', 15.99, 'fixed', now()),
('2345678', 'WC', 7.99,  'fixed', now()),
('3456789', 'WC', 24.99, 'per_kg', now()),
('4567890', 'WC', 8.49,  'fixed', now()),
('5678901', 'WC', 11.49, 'fixed', now()),
('6789012', 'WC', 15.79, 'per_kg', now()),
('7890123', 'WC', 12.99, 'fixed', now()),
('8901234', 'WC', 14.99, 'fixed', now()),
('9012345', 'WC', 7.99,  'fixed', now()),
('1122334', 'WC', 5.99,  'fixed', now()),
('2233445', 'WC', 19.99, 'fixed', now()),
('3344556', 'WC', 21.99, 'fixed', now()),
('4455667', 'WC', 16.99, 'fixed', now()),
('5566778', 'WC', 9.99,  'fixed', now()),
('6677889', 'WC', 24.99, 'fixed', now()),

-- EC
('1234567', 'EC', 16.49, 'fixed', now()),
('2345678', 'EC', 7.99,  'fixed', now()),
('3456789', 'EC', 25.49, 'per_kg', now()),
('4567890', 'EC', 8.99,  'fixed', now()),
('6789012', 'EC', 15.79, 'per_kg', now()),
('8901234', 'EC', 14.99, 'fixed', now()),
('3344556', 'EC', 22.49, 'fixed', now()),
('5566778', 'EC', 9.99,  'fixed', now()),
('6677889', 'EC', 24.99, 'fixed', now());