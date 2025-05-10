-- Normalize product attributes (sizes, colors, images) for better organization and flexibility
-- This migration converts array-based attributes to proper normalized tables

-- 1. Create sizes table for standardized product sizes
CREATE TABLE public.product_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to size table columns
COMMENT ON TABLE public.product_sizes IS 'Standardized product sizes';
COMMENT ON COLUMN public.product_sizes.name IS 'Internal size code (e.g., "S", "M", "L", "XL")';
COMMENT ON COLUMN public.product_sizes.display_name IS 'User-friendly size name for display';
COMMENT ON COLUMN public.product_sizes.sort_order IS 'Order to display sizes in';

-- Create index for sort order
CREATE INDEX idx_product_sizes_sort_order ON public.product_sizes(sort_order);

-- 2. Create colors table for standardized product colors
CREATE TABLE public.product_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  hex_code TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to colors table columns
COMMENT ON TABLE public.product_colors IS 'Standardized product colors';
COMMENT ON COLUMN public.product_colors.name IS 'Internal color code (e.g., "red", "navy_blue")';
COMMENT ON COLUMN public.product_colors.display_name IS 'User-friendly color name for display';
COMMENT ON COLUMN public.product_colors.hex_code IS 'Hex color code for visual representation';
COMMENT ON COLUMN public.product_colors.sort_order IS 'Order to display colors in';

-- Create index for sort order
CREATE INDEX idx_product_colors_sort_order ON public.product_colors(sort_order);

-- 3. Create proper product images table
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to images table columns
COMMENT ON TABLE public.product_images IS 'Product images with metadata';
COMMENT ON COLUMN public.product_images.product_id IS 'The product this image belongs to';
COMMENT ON COLUMN public.product_images.url IS 'URL to the image file';
COMMENT ON COLUMN public.product_images.alt_text IS 'Alternative text for accessibility';
COMMENT ON COLUMN public.product_images.is_primary IS 'Whether this is the main/featured image';
COMMENT ON COLUMN public.product_images.sort_order IS 'Order to display images in';

-- Create indexes for product_images
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_is_primary ON public.product_images(is_primary);
CREATE INDEX idx_product_images_sort_order ON public.product_images(sort_order);

-- 4. Create junction tables for product sizes (many-to-many)
CREATE TABLE public.product_size_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES public.product_sizes(id) ON DELETE CASCADE,
  inventory_count INTEGER DEFAULT 0 CHECK (inventory_count >= 0),
  price_adjustment NUMERIC(10, 2) DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, size_id)
);

-- Add comments to product_size_variants table
COMMENT ON TABLE public.product_size_variants IS 'Product size variants with inventory tracking';
COMMENT ON COLUMN public.product_size_variants.inventory_count IS 'Inventory count specific to this size';
COMMENT ON COLUMN public.product_size_variants.price_adjustment IS 'Price adjustment for this size (can be positive or negative)';
COMMENT ON COLUMN public.product_size_variants.sku IS 'Stock keeping unit code for this specific variant';

-- Create indexes for product_size_variants
CREATE INDEX idx_product_size_variants_product_id ON public.product_size_variants(product_id);
CREATE INDEX idx_product_size_variants_size_id ON public.product_size_variants(size_id);

-- 5. Create junction tables for product colors (many-to-many)
CREATE TABLE public.product_color_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_id UUID NOT NULL REFERENCES public.product_colors(id) ON DELETE CASCADE,
  inventory_count INTEGER DEFAULT 0 CHECK (inventory_count >= 0),
  price_adjustment NUMERIC(10, 2) DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, color_id)
);

-- Add comments to product_color_variants table
COMMENT ON TABLE public.product_color_variants IS 'Product color variants with inventory tracking';
COMMENT ON COLUMN public.product_color_variants.inventory_count IS 'Inventory count specific to this color';
COMMENT ON COLUMN public.product_color_variants.price_adjustment IS 'Price adjustment for this color (can be positive or negative)';
COMMENT ON COLUMN public.product_color_variants.sku IS 'Stock keeping unit code for this specific variant';

-- Create indexes for product_color_variants
CREATE INDEX idx_product_color_variants_product_id ON public.product_color_variants(product_id);
CREATE INDEX idx_product_color_variants_color_id ON public.product_color_variants(color_id);

-- 6. Create combined product variants table (for products with both size and color)
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_id UUID REFERENCES public.product_sizes(id) ON DELETE SET NULL,
  color_id UUID REFERENCES public.product_colors(id) ON DELETE SET NULL,
  inventory_count INTEGER DEFAULT 0 CHECK (inventory_count >= 0),
  price_adjustment NUMERIC(10, 2) DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, size_id, color_id)
);

-- Add comments to product_variants table
COMMENT ON TABLE public.product_variants IS 'Combined product variants (size + color) with inventory tracking';
COMMENT ON COLUMN public.product_variants.inventory_count IS 'Inventory count specific to this variant combination';
COMMENT ON COLUMN public.product_variants.price_adjustment IS 'Price adjustment for this variant (can be positive or negative)';
COMMENT ON COLUMN public.product_variants.sku IS 'Stock keeping unit code for this specific variant';

-- Create indexes for product_variants
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_size_id ON public.product_variants(size_id);
CREATE INDEX idx_product_variants_color_id ON public.product_variants(color_id);

-- Migration functions to move data from arrays to normalized tables

-- Function to create product sizes from arrays
CREATE OR REPLACE FUNCTION migrate_product_sizes() 
RETURNS void AS $$
DECLARE
    product_record RECORD;
    size_value TEXT;
    size_id UUID;
BEGIN
    -- Create standard sizes if they don't exist
    INSERT INTO public.product_sizes (name, display_name, sort_order)
    VALUES 
        ('XS', 'Extra Small', 10),
        ('S', 'Small', 20),
        ('M', 'Medium', 30),
        ('L', 'Large', 40),
        ('XL', 'Extra Large', 50),
        ('XXL', '2X Large', 60)
    ON CONFLICT (name) DO NOTHING;
    
    -- Process each product with sizes
    FOR product_record IN SELECT id, sizes FROM public.products WHERE sizes IS NOT NULL AND array_length(sizes, 1) > 0
    LOOP
        -- For each size in the array
        FOREACH size_value IN ARRAY product_record.sizes
        LOOP
            -- Find or create the size
            SELECT id INTO size_id FROM public.product_sizes WHERE name = size_value;
            
            -- If size doesn't exist, create it
            IF size_id IS NULL THEN
                INSERT INTO public.product_sizes (name, display_name)
                VALUES (size_value, size_value)
                RETURNING id INTO size_id;
            END IF;
            
            -- Create the product-size relationship
            INSERT INTO public.product_size_variants (product_id, size_id)
            VALUES (product_record.id, size_id)
            ON CONFLICT (product_id, size_id) DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create product colors from arrays
CREATE OR REPLACE FUNCTION migrate_product_colors() 
RETURNS void AS $$
DECLARE
    product_record RECORD;
    color_value TEXT;
    color_id UUID;
BEGIN
    -- Process each product with colors
    FOR product_record IN SELECT id, colors FROM public.products WHERE colors IS NOT NULL AND array_length(colors, 1) > 0
    LOOP
        -- For each color in the array
        FOREACH color_value IN ARRAY product_record.colors
        LOOP
            -- Find or create the color
            SELECT id INTO color_id FROM public.product_colors WHERE name = color_value;
            
            -- If color doesn't exist, create it
            IF color_id IS NULL THEN
                INSERT INTO public.product_colors (name, display_name)
                VALUES (color_value, color_value)
                RETURNING id INTO color_id;
            END IF;
            
            -- Create the product-color relationship
            INSERT INTO public.product_color_variants (product_id, color_id)
            VALUES (product_record.id, color_id)
            ON CONFLICT (product_id, color_id) DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create product images from arrays
CREATE OR REPLACE FUNCTION migrate_product_images() 
RETURNS void AS $$
DECLARE
    product_record RECORD;
    image_url TEXT;
    sort_index INTEGER;
    is_first BOOLEAN;
BEGIN
    -- Process each product with image_urls
    FOR product_record IN SELECT id, image_urls FROM public.products WHERE image_urls IS NOT NULL AND array_length(image_urls, 1) > 0
    LOOP
        sort_index := 0;
        is_first := true;
        
        -- For each image URL in the array
        FOREACH image_url IN ARRAY product_record.image_urls
        LOOP
            -- Create the product image entry
            INSERT INTO public.product_images (product_id, url, is_primary, sort_order)
            VALUES (product_record.id, image_url, is_first, sort_index);
            
            sort_index := sort_index + 10;
            is_first := false;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration functions if there are products with array data
DO $$
BEGIN
    -- Migrate sizes if there are products with sizes
    IF EXISTS (SELECT 1 FROM public.products WHERE sizes IS NOT NULL AND array_length(sizes, 1) > 0 LIMIT 1) THEN
        PERFORM migrate_product_sizes();
    END IF;
    
    -- Migrate colors if there are products with colors
    IF EXISTS (SELECT 1 FROM public.products WHERE colors IS NOT NULL AND array_length(colors, 1) > 0 LIMIT 1) THEN
        PERFORM migrate_product_colors();
    END IF;
    
    -- Migrate images if there are products with image_urls
    IF EXISTS (SELECT 1 FROM public.products WHERE image_urls IS NOT NULL AND array_length(image_urls, 1) > 0 LIMIT 1) THEN
        PERFORM migrate_product_images();
    END IF;
END $$;

-- Drop the migration functions after use
DROP FUNCTION IF EXISTS migrate_product_sizes();
DROP FUNCTION IF EXISTS migrate_product_colors();
DROP FUNCTION IF EXISTS migrate_product_images();

-- Add triggers to update the updated_at column for the new tables
CREATE TRIGGER update_product_sizes_updated_at BEFORE UPDATE ON public.product_sizes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_colors_updated_at BEFORE UPDATE ON public.product_colors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_images_updated_at BEFORE UPDATE ON public.product_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_size_variants_updated_at BEFORE UPDATE ON public.product_size_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_color_variants_updated_at BEFORE UPDATE ON public.product_color_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
