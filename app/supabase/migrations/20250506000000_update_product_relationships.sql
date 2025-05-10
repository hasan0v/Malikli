-- Restore and enhance the junction tables for product relationships with categories and collections
-- This migration recreates the many-to-many relationships between products and categories/collections

-- 1. Recreate junction table for product categories (many-to-many)
CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (product_id, category_id)
);

-- 2. Recreate junction table for product collections (many-to-many)
CREATE TABLE IF NOT EXISTS public.product_collections (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (product_id, collection_id)
);

-- Add comments to junction tables
COMMENT ON TABLE public.product_categories IS 'Junction table for product-category relationships';
COMMENT ON TABLE public.product_collections IS 'Junction table for product-collection relationships';
COMMENT ON COLUMN public.product_categories.is_primary IS 'Whether this is the primary category for the product';
COMMENT ON COLUMN public.product_categories.sort_order IS 'Order to display the product within this category';
COMMENT ON COLUMN public.product_collections.is_featured IS 'Whether this product is featured in this collection';
COMMENT ON COLUMN public.product_collections.sort_order IS 'Order to display the product within this collection';

-- Create indexes for junction tables
CREATE INDEX idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON public.product_categories(category_id);
CREATE INDEX idx_product_categories_is_primary ON public.product_categories(is_primary);
CREATE INDEX idx_product_collections_product_id ON public.product_collections(product_id);
CREATE INDEX idx_product_collections_collection_id ON public.product_collections(collection_id);
CREATE INDEX idx_product_collections_is_featured ON public.product_collections(is_featured);

-- Create a function to migrate data from text columns to junction tables
CREATE OR REPLACE FUNCTION migrate_product_relationships() 
RETURNS void AS $$
DECLARE
    product_record RECORD;
    category_id UUID;
    collection_id UUID;
BEGIN
    -- Process each product with category or collection text values
    FOR product_record IN 
        SELECT id, category, collection FROM public.products 
        WHERE category IS NOT NULL OR collection IS NOT NULL
    LOOP
        -- Handle category relationship
        IF product_record.category IS NOT NULL THEN
            -- Try to find the category ID by name
            SELECT id INTO category_id FROM public.categories 
            WHERE name = product_record.category
            LIMIT 1;
            
            -- If category exists, create relationship
            IF category_id IS NOT NULL THEN
                -- Insert into junction table, ignore if already exists
                INSERT INTO public.product_categories (product_id, category_id, is_primary)
                VALUES (product_record.id, category_id, true)
                ON CONFLICT (product_id, category_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Handle collection relationship
        IF product_record.collection IS NOT NULL THEN
            -- Try to find the collection ID by name
            SELECT id INTO collection_id FROM public.collections 
            WHERE name = product_record.collection
            LIMIT 1;
            
            -- If collection exists, create relationship
            IF collection_id IS NOT NULL THEN
                -- Insert into junction table, ignore if already exists
                INSERT INTO public.product_collections (product_id, collection_id, is_featured)
                VALUES (product_record.id, collection_id, false)
                ON CONFLICT (product_id, collection_id) DO NOTHING;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function only if there are products with category/collection values
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE category IS NOT NULL OR collection IS NOT NULL LIMIT 1) THEN
        PERFORM migrate_product_relationships();
    END IF;
END $$;

-- Drop the migration function after use
DROP FUNCTION IF EXISTS migrate_product_relationships();