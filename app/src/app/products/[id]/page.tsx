'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/context/AuthContext';

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error('Product not found');
        }

        setProduct(data as Product);
        // Set the first image as the selected one
        if (data.image_urls && data.image_urls.length > 0) {
          setSelectedImage(data.image_urls[0]);
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  const handleAddToCart = () => {
    // In a real app, you would add to cart in database or context
    // For now, we'll just simulate adding to cart
    setAddingToCart(true);
    
    setTimeout(() => {
      alert(`Added ${quantity} of ${product?.name} to cart!`);
      setAddingToCart(false);
    }, 800);
    
    // For a future implementation, you'd call a function to add to the cart
    // Perhaps using a CartContext/provider or directly to Supabase
    // addToCart({ productId: product.id, quantity });
  };

  const isProductAvailable = () => {
    if (!product) return false;
    if (!product.is_active) return false;
    if (product.inventory_count <= 0) return false;

    // Check if drop date has passed or is null
    if (product.drop_scheduled_time) {
      const dropTime = new Date(product.drop_scheduled_time);
      const now = new Date();
      if (dropTime > now) return false;
    }

    return true;
  };
  // Date format function - can cause hydration mismatches if used directly in SSR
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Client-side state to track if component has mounted
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error || 'Product not found'}
        </div>
        <button
          onClick={() => router.push('/')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const isAvailable = isProductAvailable();
  const isUpcoming = product.drop_scheduled_time && new Date(product.drop_scheduled_time) > new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Product Images */}
        <div>
          <div className="relative h-96 rounded-lg overflow-hidden bg-gray-100 mb-4">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.image_urls && product.image_urls.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.image_urls.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded border-2 ${
                    selectedImage === img ? 'border-indigo-500' : 'border-gray-300'
                  } overflow-hidden flex-shrink-0`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="mt-10 lg:mt-0">
          {/* Back Button */}
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-sm text-gray-500 mb-4 hover:text-indigo-600"
          >
            ← Back to all products
          </button>
          
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{product.name}</h1>
          
          {/* Price and Status */}
          <div className="mt-4 flex items-center">
            <p className="text-3xl text-gray-900 font-bold">${product.price.toFixed(2)}</p>
            
            {isAvailable ? (
              <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                In Stock
              </span>
            ) : isUpcoming ? (
              <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                Upcoming
              </span>
            ) : (
              <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                Sold Out
              </span>
            )}
          </div>

          {/* Inventory Count */}
          {isAvailable && product.inventory_count <= 10 && (
            <p className="mt-2 text-sm text-red-600">
              Only {product.inventory_count} left in stock!
            </p>
          )}

          {/* Drop Schedule */}
          {isUpcoming && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-yellow-800 font-medium">
                Upcoming Drop:                <span className="block text-lg">
                  {mounted ? formatDate(product.drop_scheduled_time || '') : 'Loading date...'}
                </span>
              </p>
            </div>
          )}

          {/* Description */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900">Description</h3>
            <div className="mt-2 prose prose-sm text-gray-500">
              {product.description || 'No description available.'}
            </div>
          </div>

          {/* Add to Cart Section */}
          {isAvailable && (
            <div className="mt-8">
              <div className="flex items-center">
                <label htmlFor="quantity" className="mr-4 text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <select
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="max-w-full rounded-md border border-gray-300 py-1.5 text-base leading-5 font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {[...Array(Math.min(10, product.inventory_count))].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`mt-6 w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  addingToCart ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {addingToCart ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add to Cart'
                )}
              </button>
            </div>
          )}

          {/* Sign in / Create account prompt */}
          {!user && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500">
                <button 
                  onClick={() => router.push('/signin')}
                  className="text-indigo-600 font-medium hover:text-indigo-500"
                >
                  Sign in
                </button>{' '}
                or{' '}
                <button 
                  onClick={() => router.push('/signup')}
                  className="text-indigo-600 font-medium hover:text-indigo-500"
                >
                  create an account
                </button>{' '}
                to save items to your wishlist and access exclusive drops.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
