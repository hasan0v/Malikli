'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';

// Interfaces for the shape of data as fetched from Supabase
interface FetchedCategory {
  id: string;
  name: string;
}

interface FetchedCollection {
  id: string;
  name: string;
}

interface FetchedImage {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order?: number; 
}

interface FetchedSize {
  id: string;
  name: string;
  display_name: string;
}

interface FetchedColor {
  id: string;
  name: string;
  display_name: string;
  hex_code: string | null;
}

interface FetchedVariant {
  id: string;
  size_id: string;
  color_id: string;
  inventory_count: number;
  price_adjustment: number;
}

interface FetchedProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory_count: number;
  is_active: boolean;
  created_at: string;
  drop_scheduled_time?: string | null; // Added to match potential selection
  product_categories: { category: FetchedCategory[] | null }[];
  product_collections: { collection: FetchedCollection[] | null }[];
  product_images: FetchedImage[];
  product_size_variants: { size: FetchedSize[] | null }[];
  product_color_variants: { color: FetchedColor[] | null }[];
  product_variants: FetchedVariant[];
}


// Interface for the final transformed Product state
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory_count: number;
  is_active: boolean;
  created_at: string;
  drop_scheduled_time?: string | null; // Ensure this is part of Product if used
  categories: FetchedCategory[];
  collections: FetchedCollection[];
  images: FetchedImage[];
  sizes: FetchedSize[];
  colors: FetchedColor[];
  variants: FetchedVariant[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    categoryId: '',
    collectionId: '',
    colorId: '',
    sizeId: '',
    minPrice: '',
    maxPrice: '',
  });
  
  const [categories, setCategories] = useState<FetchedCategory[]>([]);
  const [collections, setCollections] = useState<FetchedCollection[]>([]);
  const [colors, setColors] = useState<FetchedColor[]>([]);
  const [sizes, setSizes] = useState<FetchedSize[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const now = new Date().toISOString();
        
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            id, 
            name, 
            description, 
            price, 
            inventory_count, 
            is_active, 
            created_at,
            drop_scheduled_time, 
            product_categories!inner (
              category:categories!inner(id, name)
            ),
            product_collections (
              collection:collections!inner(id, name)
            ),
            product_images (
              id, url, is_primary, sort_order
            ),
            product_size_variants (
              size:product_sizes!inner(id, name, display_name)
            ),
            product_color_variants (
              color:product_colors!inner(id, name, display_name, hex_code)
            ),
            product_variants (
              id, size_id, color_id, inventory_count, price_adjustment
            )
          `)
          .eq('is_active', true)
          .or(`drop_scheduled_time.is.null,drop_scheduled_time.lte.${now}`)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        
        // Directly cast to FetchedProductData[] if the shape is expected to match
        const rawSupabaseProducts = productsData as FetchedProductData[] | null;

        const transformedProducts: Product[] = (rawSupabaseProducts || []).map(rawProduct => {
          // No need to cast rawProduct again if rawSupabaseProducts is already FetchedProductData[]
          return {
            id: rawProduct.id,
            name: rawProduct.name,
            description: rawProduct.description,
            price: rawProduct.price,
            inventory_count: rawProduct.inventory_count,
            is_active: rawProduct.is_active,
            created_at: rawProduct.created_at,
            drop_scheduled_time: rawProduct.drop_scheduled_time,
            categories: (rawProduct.product_categories || [])
              .map(pc => pc.category && pc.category.length > 0 ? pc.category[0] : null)
              .filter(Boolean) as FetchedCategory[],
            collections: (rawProduct.product_collections || [])
              .map(pc => pc.collection && pc.collection.length > 0 ? pc.collection[0] : null)
              .filter(Boolean) as FetchedCollection[],
            images: rawProduct.product_images || [],
            sizes: (rawProduct.product_size_variants || [])
              .map(psv => psv.size && psv.size.length > 0 ? psv.size[0] : null)
              .filter(Boolean) as FetchedSize[],
            colors: (rawProduct.product_color_variants || [])
              .map(pcv => pcv.color && pcv.color.length > 0 ? pcv.color[0] : null)
              .filter(Boolean) as FetchedColor[],
            variants: rawProduct.product_variants || [],
          };
        });
        
        setProducts(transformedProducts);
        
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name')
          .eq('is_active', true)
          .order('name');
        
        if (categoriesError) throw categoriesError;
        setCategories((categoriesData as FetchedCategory[]) || []);
        
        const { data: collectionsData, error: collectionsError } = await supabase
          .from('collections')
          .select('id, name')
          .eq('is_active', true)
          .order('name');
        
        if (collectionsError) throw collectionsError;
        setCollections((collectionsData as FetchedCollection[]) || []);
        
        const { data: sizesData, error: sizesError } = await supabase
          .from('product_sizes')
          .select('id, name, display_name')
          .order('sort_order');
        
        if (sizesError) throw sizesError;
        setSizes((sizesData as FetchedSize[]) || []);
        
        const { data: colorsData, error: colorsError } = await supabase
          .from('product_colors')
          .select('id, name, display_name, hex_code')
          .order('sort_order');
        
        if (colorsError) throw colorsError;
        setColors((colorsData as FetchedColor[]) || []);
        
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error fetching products data:', err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);
  
  const filteredProducts = products.filter((product) => {
    if (filters.categoryId && !product.categories.some(category => category.id === filters.categoryId)) {
      return false;
    }
    if (filters.collectionId && !product.collections.some(collection => collection.id === filters.collectionId)) {
      return false;
    }
    if (filters.colorId && !product.colors.some(color => color.id === filters.colorId)) {
      return false;
    }
    if (filters.sizeId && !product.sizes.some(size => size.id === filters.sizeId)) {
      return false;
    }
    const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
    if (product.price < minPrice || product.price > maxPrice) {
      return false;
    }
    return true;
  });
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      categoryId: '',
      collectionId: '',
      colorId: '',
      sizeId: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const calculateInventory = (product: Product): number => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, variant) => sum + variant.inventory_count, 0);
    }
    return product.inventory_count;
  };

  const getMainImageUrl = (product: Product): string => {
    if (!product.images || product.images.length === 0) {
      return '/placeholder-product.jpg';
    }
    const primaryImage = product.images.find(img => img.is_primary);
    if (primaryImage) {
      return primaryImage.url;
    }
    return product.images[0].url;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#76bfd4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error loading products: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#76bfd4] hover:bg-[#5eabc6] text-white font-semibold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative h-64 mb-8 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#24225c] to-[#b597ff]"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white z-10">
          <div className="text-center px-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Explore the Collection</h1>
            <p className="text-lg md:text-xl">Crafted for the Connoisseur. Shop the Drop.</p>
          </div>
        </div>
      </div>
      
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <p className="text-lg text-[#24225c]">
          Timeless silhouettes re‑imagined for the modern tastemaker, crafted in limited numbers for those who curate rather than consume.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Category</label>
              <select 
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                className="form-select w-full sm:w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Collection</label>
              <select
                name="collectionId"
                value={filters.collectionId}
                onChange={handleFilterChange}
                className="form-select w-full sm:w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-transparent"
              >
                <option value="">All Collections</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Color</label>
              <div className="flex gap-1 mb-1">
                {colors.slice(0, 8).map((color) => (
                  <div 
                    key={color.id}
                    className={`w-6 h-6 rounded-full cursor-pointer ${filters.colorId === color.id ? 'ring-2 ring-[#76bfd4]' : 'ring-1 ring-gray-300'}`}
                    style={{ backgroundColor: color.hex_code || '#CCCCCC' }}
                    title={color.display_name}
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      colorId: prev.colorId === color.id ? '' : color.id
                    }))}
                  ></div>
                ))}
              </div>
              <select
                name="colorId"
                value={filters.colorId}
                onChange={handleFilterChange}
                className="form-select w-full sm:w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-transparent"
              >
                <option value="">All Colors</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.display_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Size</label>
              <select
                name="sizeId"
                value={filters.sizeId}
                onChange={handleFilterChange}
                className="form-select w-full sm:w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-transparent"
              >
                <option value="">All Sizes</option>
                {sizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.display_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-auto flex gap-2 items-end">
              <div>
                <label className="block text-sm font-medium text-[#24225c] mb-1">Min $</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  min="0"
                  step="1"
                  className="form-input w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-transparent"
                />
              </div>
              <span className="text-gray-500 mb-2">-</span>
              <div>
                <label className="block text-sm font-medium text-[#24225c] mb-1">Max $</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  min="0"
                  step="1"
                  className="form-input w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={resetFilters}
            className="bg-gray-200 hover:bg-gray-300 text-[#24225c] font-medium py-2 px-4 rounded transition-colors duration-300"
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">No products found matching your criteria.</p>
          <button
            onClick={resetFilters}
            className="text-[#b597ff] hover:underline"
          >
            Clear filters and show all products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const inventory = calculateInventory(product);
            const imageUrl = getMainImageUrl(product);
            
            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="relative h-64 bg-gray-100">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {inventory <= 10 && inventory > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      {inventory <= 5 ? `Only ${inventory} left` : 'Low Stock'}
                    </div>
                  )}
                  {inventory === 0 && (
                    <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                      Sold Out
                    </div>
                  )}
                  
                  {product.categories.length > 0 && (
                    <div className="absolute top-2 left-2 bg-[#24225c] text-white text-xs px-2 py-1 rounded">
                      {product.categories[0].name}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-[#24225c] group-hover:text-[#76bfd4] transition-colors duration-300 truncate">
                    {product.name}
                  </h2>
                  <p className="text-gray-600 mt-1">${product.price.toFixed(2)}</p>
                  
                  {product.colors.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.colors.slice(0, 5).map((color) => (
                        <span 
                          key={color.id} 
                          className="inline-block h-4 w-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: color.hex_code || '#CCCCCC' }}
                          title={color.display_name}
                        ></span>
                      ))}
                      {product.colors.length > 5 && (
                        <span className="text-xs text-gray-500 ml-1">+{product.colors.length - 5}</span>
                      )}
                    </div>
                  )}
                  
                  {product.sizes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.sizes.slice(0, 5).map((size) => (
                        <span 
                          key={size.id}
                          className="inline-block px-1 text-xs border border-gray-300 rounded"
                        >
                          {size.name}
                        </span>
                      ))}
                      {product.sizes.length > 5 && (
                        <span className="text-xs text-gray-500 ml-1">+{product.sizes.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}