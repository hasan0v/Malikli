'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory_count: number;
  is_active: boolean;
  created_at: string;
  // These will be loaded through joins with the updated DB structure
  categories: { id: string; name: string }[];
  collections: { id: string; name: string }[];
  images: { id: string; url: string; is_primary: boolean }[];
  sizes: { id: string; name: string; display_name: string }[];
  colors: { id: string; name: string; display_name: string; hex_code: string | null }[];
  variants: {
    id: string;
    size_id: string;
    color_id: string;
    inventory_count: number;
    price_adjustment: number;
  }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    categoryId: '',
    collectionId: '',
    colorId: '',
    sizeId: '',
    minPrice: '',
    maxPrice: '',
  });
  
  // Filter options
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [collections, setCollections] = useState<{id: string, name: string}[]>([]);
  const [colors, setColors] = useState<{id: string, name: string, display_name: string, hex_code: string | null}[]>([]);
  const [sizes, setSizes] = useState<{id: string, name: string, display_name: string}[]>([]);

  // Fetch all needed data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Get current date
        const now = new Date().toISOString();
        
        // Fetch active products with their relationships
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
        
        // Transform the data to match our Product interface
        const transformedProducts: Product[] = (productsData || []).map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          inventory_count: product.inventory_count,
          is_active: product.is_active,
          created_at: product.created_at,
          categories: product.product_categories.map((pc: any) => pc.category),
          collections: product.product_collections.map((pc: any) => pc.collection),
          images: product.product_images,
          sizes: product.product_size_variants.map((psv: any) => psv.size),
          colors: product.product_color_variants.map((pcv: any) => pcv.color),
          variants: product.product_variants,
        }));
        
        setProducts(transformedProducts);
        
        // Fetch all available categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name')
          .eq('is_active', true)
          .order('name');
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
        // Fetch all available collections
        const { data: collectionsData, error: collectionsError } = await supabase
          .from('collections')
          .select('id, name')
          .eq('is_active', true)
          .order('name');
        
        if (collectionsError) throw collectionsError;
        setCollections(collectionsData || []);
        
        // Fetch all available sizes
        const { data: sizesData, error: sizesError } = await supabase
          .from('product_sizes')
          .select('id, name, display_name')
          .order('sort_order');
        
        if (sizesError) throw sizesError;
        setSizes(sizesData || []);
        
        // Fetch all available colors
        const { data: colorsData, error: colorsError } = await supabase
          .from('product_colors')
          .select('id, name, display_name, hex_code')
          .order('sort_order');
        
        if (colorsError) throw colorsError;
        setColors(colorsData || []);
        
      } catch (err: any) {
        console.error('Error fetching products data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);
  
  // Filter products based on selected filters
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (filters.categoryId && !product.categories.some(category => category.id === filters.categoryId)) {
      return false;
    }
    
    // Collection filter
    if (filters.collectionId && !product.collections.some(collection => collection.id === filters.collectionId)) {
      return false;
    }
    
    // Color filter
    if (filters.colorId && !product.colors.some(color => color.id === filters.colorId)) {
      return false;
    }
    
    // Size filter
    if (filters.sizeId && !product.sizes.some(size => size.id === filters.sizeId)) {
      return false;
    }
    
    // Price range filter
    const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
    
    if (product.price < minPrice || product.price > maxPrice) {
      return false;
    }
    
    return true;
  });
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Reset all filters
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

  // Calculate inventory for display
  const calculateInventory = (product: Product): number => {
    // If we have variants, sum their inventory
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, variant) => sum + variant.inventory_count, 0);
    }
    // Otherwise use the product inventory count
    return product.inventory_count;
  };

  // Get the primary image URL or first available
  const getMainImageUrl = (product: Product): string => {
    if (!product.images || product.images.length === 0) {
      return '/placeholder-product.jpg'; // Provide a placeholder image
    }
    
    // Try to find the primary image first
    const primaryImage = product.images.find(img => img.is_primary);
    if (primaryImage) {
      return primaryImage.url;
    }
    
    // Otherwise use the first image
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
      {/* Promotional Banner */}
      <div className="relative h-64 mb-8 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#24225c] to-[#b597ff]"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white z-10">
          <div className="text-center px-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Explore the Collection</h1>
            <p className="text-lg md:text-xl">Crafted for the Connoisseur. Shop the Drop.</p>
          </div>
        </div>
      </div>
      
      {/* Introduction Narrative */}
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <p className="text-lg text-[#24225c]">
          Timeless silhouettes re‑imagined for the modern tastemaker, crafted in limited numbers for those who curate rather than consume.
        </p>
      </div>
      
      {/* Enhanced Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 flex-1">
            {/* Category Filter */}
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
            
            {/* Collection Filter */}
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
            
            {/* Color Filter */}
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
            
            {/* Size Filter */}
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
            
            {/* Price Range Filters */}
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
          
          {/* Reset Filters Button */}
          <button
            onClick={resetFilters}
            className="bg-gray-200 hover:bg-gray-300 text-[#24225c] font-medium py-2 px-4 rounded transition-colors duration-300"
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      {/* Products Grid */}
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
                  {/* Show "Low Stock" label if inventory is 10 or fewer */}
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
                  
                  {/* Show category badge */}
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
                  
                  {/* Display available colors */}
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
                  
                  {/* Display available sizes */}
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
