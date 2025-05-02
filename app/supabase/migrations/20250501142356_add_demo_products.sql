-- filepath: c:\Users\alien\Desktop\Test Projects\malikli\app\supabase\migrations\20250501142356_add_demo_products.sql

-- Note: These INSERT statements assume the handle_new_user trigger is active
-- and will create corresponding profile entries when users are created via auth.
-- However, for demo data, we might need to manually insert profiles if users
-- aren't created through the standard signup flow first, or adjust user IDs.
-- For simplicity, we'll use placeholder UUIDs for user IDs and assume they exist in auth.users.
-- Replace these with actual user UUIDs from your auth.users table if needed.

-- Placeholder User UUIDs (replace with actual ones from your auth.users table if possible)
-- Example:
-- User 1: 00000000-0000-0000-0000-000000000001 (Admin)
-- User 2: 00000000-0000-0000-0000-000000000002 (Regular)
-- User 3: 00000000-0000-0000-0000-000000000003 (Member)

-- Insert Demo Profiles (Manually, if not created by trigger)
-- Ensure these IDs match users in auth.users
INSERT INTO public.profiles (id, email, role, name, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@malikli.test', 'ADMIN', 'Admin User', '2025-04-30T10:00:00Z', '2025-04-30T10:00:00Z'),
('00000000-0000-0000-0000-000000000002', 'user1@malikli.test', 'REGULAR', 'Regular User One', '2025-04-30T10:05:00Z', '2025-04-30T10:05:00Z'),
('00000000-0000-0000-0000-000000000003', 'user2@malikli.test', 'MEMBER', 'Member User Two', '2025-04-30T10:10:00Z', '2025-04-30T10:10:00Z'),
('00000000-0000-0000-0000-000000000004', 'user3@malikli.test', 'REGULAR', 'Regular User Three', '2025-05-01T09:00:00Z', '2025-05-01T09:00:00Z'),
('00000000-0000-0000-0000-000000000005', 'user4@malikli.test', 'REGULAR', NULL, '2025-05-01T11:00:00Z', '2025-05-01T11:00:00Z')
ON CONFLICT (id) DO NOTHING; -- Avoid errors if profiles already exist due to trigger

-- Insert Demo Products
-- Using gen_random_uuid() for product IDs
INSERT INTO public.products (id, name, description, price, image_urls, inventory_count, is_active, drop_scheduled_time, created_at, updated_at) VALUES
(gen_random_uuid(), 'Stealth Hoodie', 'A comfortable black hoodie with a subtle logo.', 79.99, ARRAY['https://via.placeholder.com/400x400.png?text=Stealth+Hoodie'], 50, true, NULL, '2025-04-29T14:00:00Z', '2025-04-29T14:00:00Z'),
(gen_random_uuid(), 'Cyber Sneakers', 'Futuristic sneakers with LED accents.', 149.50, ARRAY['https://via.placeholder.com/400x400.png?text=Cyber+Sneakers'], 25, true, NULL, '2025-04-29T15:00:00Z', '2025-04-29T15:00:00Z'),
(gen_random_uuid(), 'Drop Tee - Limited Edition', 'Exclusive T-shirt for the upcoming drop.', 45.00, ARRAY['https://via.placeholder.com/400x400.png?text=Drop+Tee'], 100, false, '2025-05-10T16:00:00Z', '2025-05-01T10:00:00Z', '2025-05-01T10:00:00Z'), -- Scheduled Drop
(gen_random_uuid(), 'Reflective Cap', 'A stylish cap that shines in the light.', 35.00, ARRAY['https://via.placeholder.com/400x400.png?text=Reflective+Cap'], 75, true, NULL, '2025-04-30T11:00:00Z', '2025-04-30T11:00:00Z'),
(gen_random_uuid(), 'Cargo Pants 2.0', 'Durable cargo pants with extra pockets.', 95.99, ARRAY['https://via.placeholder.com/400x400.png?text=Cargo+Pants'], 40, true, NULL, '2025-04-30T12:00:00Z', '2025-04-30T12:00:00Z'),
(gen_random_uuid(), 'Future Drop Jacket', 'High-tech jacket, coming soon.', 299.00, ARRAY['https://via.placeholder.com/400x400.png?text=Future+Jacket'], 50, false, '2025-05-15T12:00:00Z', '2025-05-01T11:30:00Z', '2025-05-01T11:30:00Z'); -- Scheduled Drop

-- Insert Demo Orders
-- Using gen_random_uuid() for order IDs
-- Link to placeholder user UUIDs
INSERT INTO public.orders (id, user_id, total_amount, status, shipping_address, billing_address, payment_intent_id, created_at, updated_at) VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 114.99, 'shipped', '{"name": "Regular User One", "street": "123 Main St", "city": "Anytown", "state": "CA", "zip": "12345", "country": "USA"}', '{"name": "Regular User One", "street": "123 Main St", "city": "Anytown", "state": "CA", "zip": "12345", "country": "USA"}', 'pi_sample_1', '2025-04-30T11:30:00Z', '2025-04-30T15:00:00Z'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 149.50, 'paid', '{"name": "Member User Two", "street": "456 Oak Ave", "city": "Someville", "state": "NY", "zip": "67890", "country": "USA"}', '{"name": "Member User Two", "street": "456 Oak Ave", "city": "Someville", "state": "NY", "zip": "67890", "country": "USA"}', 'pi_sample_2', '2025-05-01T09:15:00Z', '2025-05-01T09:20:00Z'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 79.99, 'pending', '{"name": "Regular User One", "street": "123 Main St", "city": "Anytown", "state": "CA", "zip": "12345", "country": "USA"}', '{"name": "Regular User One", "street": "123 Main St", "city": "Anytown", "state": "CA", "zip": "12345", "country": "USA"}', 'pi_sample_3', '2025-05-01T12:00:00Z', '2025-05-01T12:00:00Z'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 130.99, 'paid', '{"name": "Regular User Three", "street": "789 Pine Ln", "city": "Metropolis", "state": "TX", "zip": "11223", "country": "USA"}', '{"name": "Regular User Three", "street": "789 Pine Ln", "city": "Metropolis", "state": "TX", "zip": "11223", "country": "USA"}', 'pi_sample_4', '2025-05-01T13:00:00Z', '2025-05-01T13:05:00Z'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000005', 35.00, 'cancelled', '{"name": "User Four", "street": "101 Maple Dr", "city": "Villagetown", "state": "FL", "zip": "44556", "country": "USA"}', '{"name": "User Four", "street": "101 Maple Dr", "city": "Villagetown", "state": "FL", "zip": "44556", "country": "USA"}', 'pi_sample_5', '2025-05-01T14:00:00Z', '2025-05-01T14:10:00Z');

-- Insert Demo Order Items
-- Requires knowing the UUIDs generated for orders and products above.
-- This is tricky in a static script. A better approach might be procedural SQL
-- or inserting after retrieving the generated IDs.
-- For this demo, we'll assume we know the IDs or use subqueries (less efficient).

-- Let's retrieve the IDs first (this is illustrative, won't work directly in migration like this)
-- DECLARE order1_id UUID;
-- DECLARE order2_id UUID;
-- DECLARE order3_id UUID;
-- DECLARE order4_id UUID;
-- DECLARE hoodie_id UUID;
-- DECLARE sneakers_id UUID;
-- DECLARE cap_id UUID;
-- DECLARE pants_id UUID;
-- SELECT id INTO order1_id FROM public.orders WHERE payment_intent_id = 'pi_sample_1';
-- SELECT id INTO order2_id FROM public.orders WHERE payment_intent_id = 'pi_sample_2';
-- SELECT id INTO order3_id FROM public.orders WHERE payment_intent_id = 'pi_sample_3';
-- SELECT id INTO order4_id FROM public.orders WHERE payment_intent_id = 'pi_sample_4';
-- SELECT id INTO hoodie_id FROM public.products WHERE name = 'Stealth Hoodie';
-- SELECT id INTO sneakers_id FROM public.products WHERE name = 'Cyber Sneakers';
-- SELECT id INTO cap_id FROM public.products WHERE name = 'Reflective Cap';
-- SELECT id INTO pants_id FROM public.products WHERE name = 'Cargo Pants 2.0';

-- Since we can't easily use variables like above in a simple migration,
-- we'll use subqueries. This is less performant but works for demo data.
-- Make sure the names/payment_intent_ids used in subqueries are unique.

INSERT INTO public.order_items (id, order_id, product_id, quantity, price_at_purchase, created_at) VALUES
(gen_random_uuid(), (SELECT id from public.orders WHERE payment_intent_id = 'pi_sample_1'), (SELECT id from public.products WHERE name = 'Reflective Cap'), 1, 35.00, '2025-04-30T11:30:00Z'),
(gen_random_uuid(), (SELECT id from public.orders WHERE payment_intent_id = 'pi_sample_1'), (SELECT id from public.products WHERE name = 'Stealth Hoodie'), 1, 79.99, '2025-04-30T11:30:00Z'),
(gen_random_uuid(), (SELECT id from public.orders WHERE payment_intent_id = 'pi_sample_2'), (SELECT id from public.products WHERE name = 'Cyber Sneakers'), 1, 149.50, '2025-05-01T09:15:00Z'),
(gen_random_uuid(), (SELECT id from public.orders WHERE payment_intent_id = 'pi_sample_3'), (SELECT id from public.products WHERE name = 'Stealth Hoodie'), 1, 79.99, '2025-05-01T12:00:00Z'),
(gen_random_uuid(), (SELECT id from public.orders WHERE payment_intent_id = 'pi_sample_4'), (SELECT id from public.products WHERE name = 'Cargo Pants 2.0'), 1, 95.99, '2025-05-01T13:00:00Z'),
(gen_random_uuid(), (SELECT id from public.orders WHERE payment_intent_id = 'pi_sample_4'), (SELECT id from public.products WHERE name = 'Reflective Cap'), 1, 35.00, '2025-05-01T13:00:00Z');
