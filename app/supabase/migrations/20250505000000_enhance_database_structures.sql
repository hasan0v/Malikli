-- Enhanced database structure for the MALIKLI1992 e-commerce project
-- 1. Add additional user profile fields
-- 2. Create address table
-- 3. Create collections table
-- 4. Create categories table
-- 5. Define appropriate constraints and optimize for performance

-- 1. Add phone_number to the profiles table
ALTER TABLE public.profiles
ADD COLUMN phone_number TEXT,
ADD COLUMN avatar_url TEXT;

COMMENT ON COLUMN public.profiles.phone_number IS 'User''s phone number';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user''s avatar image';

-- 2. Create addresses table
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Name of the address (e.g., "Home", "Office")
  recipient_name TEXT NOT NULL,
  street_address TEXT NOT NULL,
  apartment TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone_number TEXT,
  is_default BOOLEAN DEFAULT false,
  is_billing_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to addresses table columns
COMMENT ON COLUMN public.addresses.user_id IS 'References the user this address belongs to';
COMMENT ON COLUMN public.addresses.name IS 'Name of the address (e.g., "Home", "Office")';
COMMENT ON COLUMN public.addresses.recipient_name IS 'Name of the person receiving packages at this address';
COMMENT ON COLUMN public.addresses.street_address IS 'Street address line';
COMMENT ON COLUMN public.addresses.apartment IS 'Apartment, suite, unit, etc.';
COMMENT ON COLUMN public.addresses.city IS 'City name';
COMMENT ON COLUMN public.addresses.state IS 'State/province/region';
COMMENT ON COLUMN public.addresses.postal_code IS 'Postal/zip code';
COMMENT ON COLUMN public.addresses.country IS 'Country';
COMMENT ON COLUMN public.addresses.phone_number IS 'Contact phone number for this address';
COMMENT ON COLUMN public.addresses.is_default IS 'Whether this is the default shipping address';
COMMENT ON COLUMN public.addresses.is_billing_default IS 'Whether this is the default billing address';

-- Indexes for addresses
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX idx_addresses_default ON public.addresses(user_id, is_default);
CREATE INDEX idx_addresses_billing_default ON public.addresses(user_id, is_billing_default);

-- 3. Create collections table
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to collections table columns
COMMENT ON COLUMN public.collections.name IS 'Name of the collection';
COMMENT ON COLUMN public.collections.slug IS 'URL-friendly identifier for the collection';
COMMENT ON COLUMN public.collections.description IS 'Description of the collection';
COMMENT ON COLUMN public.collections.cover_image_url IS 'URL to the collection cover image';
COMMENT ON COLUMN public.collections.is_featured IS 'Whether this collection is featured on the homepage';
COMMENT ON COLUMN public.collections.is_active IS 'Whether this collection is active and visible';
COMMENT ON COLUMN public.collections.sort_order IS 'Order in which collections are displayed';

-- Create indexes for collections
CREATE INDEX idx_collections_is_active ON public.collections(is_active);
CREATE INDEX idx_collections_is_featured ON public.collections(is_featured);
CREATE INDEX idx_collections_sort_order ON public.collections(sort_order);

-- 4. Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to categories table columns
COMMENT ON COLUMN public.categories.name IS 'Name of the category';
COMMENT ON COLUMN public.categories.slug IS 'URL-friendly identifier for the category';
COMMENT ON COLUMN public.categories.description IS 'Description of the category';
COMMENT ON COLUMN public.categories.parent_id IS 'Parent category ID for hierarchical structure (null for top-level)';
COMMENT ON COLUMN public.categories.image_url IS 'URL to the category image';
COMMENT ON COLUMN public.categories.is_active IS 'Whether this category is active and visible';
COMMENT ON COLUMN public.categories.sort_order IS 'Order in which categories are displayed';

-- Create indexes for categories
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);
CREATE INDEX idx_categories_sort_order ON public.categories(sort_order);

-- 5. Add relationships between products and categories/collections
-- First, create junction table for product categories (many-to-many)
CREATE TABLE public.product_categories (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Create junction table for product collections (many-to-many)
CREATE TABLE public.product_collections (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

-- Add comments to junction tables
COMMENT ON TABLE public.product_categories IS 'Junction table for product-category relationships';
COMMENT ON TABLE public.product_collections IS 'Junction table for product-collection relationships';

-- Create indexes for junction tables
CREATE INDEX idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON public.product_categories(category_id);
CREATE INDEX idx_product_collections_product_id ON public.product_collections(product_id);
CREATE INDEX idx_product_collections_collection_id ON public.product_collections(collection_id);

-- 6. Update orders table to reference addresses instead of storing as JSONB
-- First add columns for shipping and billing address IDs
ALTER TABLE public.orders
ADD COLUMN shipping_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
ADD COLUMN billing_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL;

-- Add comments to the new columns
COMMENT ON COLUMN public.orders.shipping_address_id IS 'References the shipping address for this order';
COMMENT ON COLUMN public.orders.billing_address_id IS 'References the billing address for this order';

-- Create indexes for the new foreign keys
CREATE INDEX idx_orders_shipping_address_id ON public.orders(shipping_address_id);
CREATE INDEX idx_orders_billing_address_id ON public.orders(billing_address_id);

-- Add triggers to update the updated_at column for the new tables
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
