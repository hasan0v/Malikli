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
  image_urls: string[] | null;
  inventory_count: number;
  is_active: boolean;
  size: string[] | null;
  color: string[] | null;
  collection: string | null;
  category: string | null;
  created_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    collection: '',
    color: '',
    size: '',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Get current date
        const now = new Date().toISOString();
        
        // Fetch active products that are currently available and have inventory
        const { data: availableProducts, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .gt('inventory_count', 0)
          .or(`drop_scheduled_time.is.null,drop_scheduled_time.lte.${now}`)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        
        setProducts(availableProducts || []);
        
        // Extract unique filter values from products
        if (availableProducts) {
          const uniqueCategories = Array.from(
            new Set(
              availableProducts
                .map((p) => p.category)
                .filter(Boolean) as string[]
            )
          );
          
          const uniqueCollections = Array.from(
            new Set(
              availableProducts
                .map((p) => p.collection)
                .filter(Boolean) as string[]
            )
          );
          
          const uniqueColors = Array.from(
            new Set(
              availableProducts
                .flatMap((p) => p.color || [])
                .filter(Boolean)
            )
          );
          
          const uniqueSizes = Array.from(
            new Set(
              availableProducts
                .flatMap((p) => p.size || [])
                .filter(Boolean)
            )
          );
          
          setCategories(uniqueCategories);
          setCollections(uniqueCollections);
          setColors(uniqueColors);
          setSizes(uniqueSizes);
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  // Filter products based on selected filters
  const filteredProducts = products.filter((product) => {
    return (
      (filters.category === '' || product.category === filters.category) &&
      (filters.collection === '' || product.collection === filters.collection) &&
      (filters.color === '' || (product.color && product.color.includes(filters.color))) &&
      (filters.size === '' || (product.size && product.size.includes(filters.size)))
    );
  });
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      category: '',
      collection: '',
      color: '',
      size: '',
    });
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
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 flex-1">
            {/* Category Filter */}
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Category</label>
              <select 
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="form-select w-full sm:w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Collection Filter */}
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Collection</label>
              <select
                name="collection"
                value={filters.collection}
                onChange={handleFilterChange}
                className="form-select w-full sm:w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-transparent"
              >
                <option value="">All Collections</option>
                {collections.map((collection) => (
                  <option key={collection} value={collection}>
                    {collection}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Color Filter */}
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Color</label>
              <select
                name="color"
                value={filters.color}
                onChange={handleFilterChange}
                className="form-select w-full sm:w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-transparent"
              >
                <option value="">All Colors</option>
                {colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Size Filter */}
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Size</label>
              <select
                name="size"
                value={filters.size}
                onChange={handleFilterChange}
                className="form-select w-full sm:w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-transparent"
              >
                <option value="">All Sizes</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
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
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative h-64 bg-gray-100">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <Image
                    src={product.image_urls[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
                {/* Show "Low Stock" label if inventory is 10 or fewer */}
                {product.inventory_count <= 10 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {product.inventory_count <= 5 ? `Only ${product.inventory_count} left` : 'Low Stock'}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-[#24225c] group-hover:text-[#76bfd4] transition-colors duration-300 truncate">
                  {product.name}
                </h2>
                <p className="text-gray-600 mt-1">${product.price.toFixed(2)}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {product.color && product.color.length > 0 && (
                    <div className="flex gap-1">
                      {product.color.slice(0, 3).map((color) => (
                        <span 
                          key={color} 
                          className="inline-block h-4 w-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        ></span>
                      ))}
                      {product.color.length > 3 && (
                        <span className="text-xs text-gray-500 ml-1">+{product.color.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
