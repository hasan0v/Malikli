-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'REGULAR' CHECK (role IN ('REGULAR', 'MEMBER', 'ADMIN')),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to profiles table columns
COMMENT ON COLUMN public.profiles.id IS 'References the user ID from Supabase Auth';
COMMENT ON COLUMN public.profiles.email IS 'User''s email address';
COMMENT ON COLUMN public.profiles.role IS 'User role (REGULAR, MEMBER, ADMIN)';
COMMENT ON COLUMN public.profiles.name IS 'User''s display name (optional)';

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_urls TEXT[],
  inventory_count INTEGER NOT NULL DEFAULT 0 CHECK (inventory_count >= 0),
  is_active BOOLEAN DEFAULT true NOT NULL,
  drop_scheduled_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to products table columns
COMMENT ON COLUMN public.products.name IS 'Name of the product';
COMMENT ON COLUMN public.products.price IS 'Price of the product';
COMMENT ON COLUMN public.products.image_urls IS 'Array of URLs for product images';
COMMENT ON COLUMN public.products.inventory_count IS 'Available stock quantity';
COMMENT ON COLUMN public.products.is_active IS 'Whether the product is currently available for purchase/viewing';
COMMENT ON COLUMN public.products.drop_scheduled_time IS 'Timestamp when the product becomes available (for drops)';

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Allow null for potential guest checkouts, or make NOT NULL if only logged-in users can order
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled', 'failed')),
  shipping_address JSONB,
  billing_address JSONB,
  payment_intent_id TEXT, -- To store Stripe Payment Intent ID
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to orders table columns
COMMENT ON COLUMN public.orders.user_id IS 'References the user who placed the order';
COMMENT ON COLUMN public.orders.total_amount IS 'Total cost of the order';
COMMENT ON COLUMN public.orders.status IS 'Current status of the order';
COMMENT ON COLUMN public.orders.shipping_address IS 'Shipping address in JSON format';
COMMENT ON COLUMN public.orders.billing_address IS 'Billing address in JSON format';
COMMENT ON COLUMN public.orders.payment_intent_id IS 'Identifier from the payment gateway (e.g., Stripe)';

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT, -- Prevent deleting product if it's in an order
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to order_items table columns
COMMENT ON COLUMN public.order_items.order_id IS 'References the order this item belongs to';
COMMENT ON COLUMN public.order_items.product_id IS 'References the product ordered';
COMMENT ON COLUMN public.order_items.quantity IS 'Quantity of the product ordered';
COMMENT ON COLUMN public.order_items.price_at_purchase IS 'Price of the product at the time of purchase';

-- Function to automatically create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Required for accessing auth.users table
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name'); -- Adjust 'full_name' if using a different metadata key
  RETURN new;
END;
$$;

-- Trigger to call the function after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update 'updated_at' on table updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Optional: Indexes for frequently queried columns
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_drop_time ON public.products(drop_scheduled_time);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
