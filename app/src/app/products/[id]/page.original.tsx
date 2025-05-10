'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

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
  size: string[] | null;
  color: string[] | null;
  collection: string | null;
  category: string | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, openCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showSizeError, setShowSizeError] = useState(false);
  const [showColorError, setShowColorError] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

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
        
        // Set default selected size and color if available
        if (data.size && data.size.length > 0) {
          setSelectedSize(data.size[0]);
        }
        
        if (data.color && data.color.length > 0) {
          setSelectedColor(data.color[0]);
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
  
  const incrementQuantity = () => {
    if (product && quantity < product.inventory_count) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Validate size and color selection
    if (product.size && product.size.length > 0 && !selectedSize) {
      setShowSizeError(true);
      return;
    } else {
      setShowSizeError(false);
    }
    
    if (product.color && product.color.length > 0 && !selectedColor) {
      setShowColorError(true);
      return;
    } else {
      setShowColorError(false);
    }
    
    try {
      setAddingToCart(true);
      await addToCart(product.id, quantity);
      // Open the cart sidebar after adding the item
      openCart();
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
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
  
  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showZoom) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#76bfd4]"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error || 'Product not found'}</p>
        <Link href="/products" className="bg-[#76bfd4] hover:bg-[#5eabc6] text-white font-semibold py-2 px-6 rounded transition-colors duration-300">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Path Navigation */}
      <div className="mb-6 text-sm">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="text-[#76bfd4] hover:text-[#5eabc6]">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link href="/products" className="ml-1 text-[#76bfd4] hover:text-[#5eabc6]">
                Products
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-gray-500 truncate max-w-xs">{product.name}</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div 
            className="relative h-96 bg-gray-100 overflow-hidden cursor-zoom-in rounded-lg mb-4"
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={handleImageHover}
            onClick={() => setShowZoom(!showZoom)}
          >
            {selectedImage ? (
              <>
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'contain' }}
                />
                {showZoom && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div 
                      className="absolute w-[200%] h-[200%] transform"
                      style={{ 
                        backgroundImage: `url(${selectedImage})`, 
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        top: `-${zoomPosition.y}%`,
                        left: `-${zoomPosition.x}%`,
                      }}
                    ></div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>No Image Available</p>
              </div>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {product.image_urls && product.image_urls.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.image_urls.map((imageUrl, index) => (
                <button
                  key={index}
                  className={`relative h-20 w-20 flex-shrink-0 border-2 rounded overflow-hidden ${
                    selectedImage === imageUrl ? 'border-[#76bfd4]' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImage(imageUrl)}
                >
                  <Image
                    src={imageUrl}
                    alt={`${product.name} image ${index + 1}`}
                    fill
                    sizes="80px"
                    style={{ objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-[#24225c] mb-2">{product.name}</h1>
          
          {product.collection && (
            <p className="text-[#b597ff] mb-4">
              {product.collection} Collection
              {product.category && ` · ${product.category}`}
            </p>
          )}
          
          <p className="text-2xl font-semibold text-[#24225c] mb-6">
            ${product.price.toFixed(2)}
          </p>
          
          {/* Description */}
          <div className="prose prose-sm mb-6 text-gray-700">
            <p>{product.description}</p>
          </div>
          
          {/* Size Selection */}
          {product.size && product.size.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-[#24225c]">Size</label>
                {showSizeError && (
                  <span className="text-sm text-red-500">Please select a size</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.size.map((size) => (
                  <button
                    key={size}
                    className={`px-4 py-2 border rounded-md transition-colors duration-300 ${
                      selectedSize === size
                        ? 'border-[#76bfd4] bg-[#a0fff8] bg-opacity-20 text-[#24225c]'
                        : 'border-gray-300 text-gray-700 hover:border-[#76bfd4]'
                    }`}
                    onClick={() => {
                      setSelectedSize(size);
                      setShowSizeError(false);
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Color Selection */}
          {product.color && product.color.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-[#24225c]">Color</label>
                {showColorError && (
                  <span className="text-sm text-red-500">Please select a color</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {product.color.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-[#76bfd4]' : ''
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    onClick={() => {
                      setSelectedColor(color);
                      setShowColorError(false);
                    }}
                    title={color}
                  >
                    {selectedColor === color && (
                      <svg 
                        className="w-4 h-4 text-white drop-shadow" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Quantity Selector and Add to Cart */}
          <div className="mt-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-[#24225c] mb-2">Quantity</label>
                <div className="flex border border-gray-300 rounded-md">
                  <button 
                    className="px-3 py-2 text-gray-500 hover:text-[#76bfd4] disabled:text-gray-300"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.inventory_count}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product.inventory_count, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full text-center border-none focus:ring-0"
                  />
                  <button 
                    className="px-3 py-2 text-gray-500 hover:text-[#76bfd4] disabled:text-gray-300"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.inventory_count}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Inventory Status */}
              <div className="w-full md:w-2/3 flex items-center">
                {product.inventory_count <= 10 ? (
                  <p className="text-sm text-red-600 font-medium">
                    {product.inventory_count <= 5 ? (
                      <>
                        <svg className="inline-block w-4 h-4 mr-1 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Only {product.inventory_count} left in stock!
                      </>
                    ) : (
                      <>Low stock - {product.inventory_count} remaining</>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-green-600">In Stock</p>
                )}
              </div>
            </div>
            
            {isProductAvailable() ? (
              <button
                className={`w-full py-3 rounded-md text-white font-semibold ${
                  addingToCart
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#b597ff] hover:bg-[#9f81ff] transition-colors duration-300'
                }`}
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            ) : (
              <button
                className="w-full py-3 bg-gray-300 text-gray-500 rounded-md font-semibold cursor-not-allowed"
                disabled
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
