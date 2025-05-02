'use client'; // Make this a client component to fetch data client-side

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';

// Define the structure of a Product based on your schema
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_urls: string[] | null;
  inventory_count: number;
  is_active: boolean;
  drop_scheduled_time: string | null;
  created_at: string;
  updated_at: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch active products that are currently available (not scheduled for future drop or drop time has passed)
        // and have inventory
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .gt('inventory_count', 0)
          .or(`drop_scheduled_time.is.null,drop_scheduled_time.lte.${now}`) // Available if no drop time OR drop time is in the past
          .order('created_at', { ascending: false }); // Show newest first

        if (error) {
          throw error;
        }
        setProducts(data || []);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(`Failed to load products: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Available Products</h1>
        <p className="text-gray-600">Discover our latest drops and exclusive items</p>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">No products available right now.</p>
          <p className="text-indigo-600">Check back soon for upcoming drops!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
              <div className="relative w-full h-48 bg-gray-200">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <Image
                    src={product.image_urls[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold truncate group-hover:text-indigo-600">{product.name}</h2>
                <p className="text-gray-700 mt-1">${product.price.toFixed(2)}</p>
                {product.inventory_count <= 5 && (
                  <p className="text-xs text-red-600 mt-1">Only {product.inventory_count} left!</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}