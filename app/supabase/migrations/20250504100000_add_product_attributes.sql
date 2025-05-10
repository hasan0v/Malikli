-- Add size, color, collection, and category columns to the products table

ALTER TABLE products
ADD COLUMN sizes text[],
ADD COLUMN colors text[],
ADD COLUMN collection text,
ADD COLUMN category text;
