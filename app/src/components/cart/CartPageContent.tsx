'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

// Define the types (assuming they are the same as before)
interface Product {
  name?: string;
  price?: number;
  image_urls?: string[] | null;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export default function CartPageContent() {
  const router = useRouter();
  const cartContext = useCart();

  // Handle cases where context might not be ready (though useCart should handle this)
  if (!cartContext) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#76bfd4]"></div>
      </div>
    );
  }

  const {
    cartItems,
    isLoading,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = cartContext;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-[#24225c] mb-8">Your Shopping Bag</h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#76bfd4]"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="mx-auto h-24 w-24 text-[#ced1ff] mb-4">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-[#24225c] mb-2">Your bag is empty</h3>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            href="/products"
            className="bg-[#76bfd4] hover:bg-[#5eabc6] text-white font-medium py-3 px-6 rounded transition-colors duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center p-4 border-b border-gray-200 last:border-b-0"
                >
                  {/* Product Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-4 mb-4 sm:mb-0">
                    {item.product?.image_urls && item.product.image_urls.length > 0 ? (
                      <Image
                        src={item.product.image_urls[0]}
                        alt={item.product?.name || 'Product image'}
                        fill
                        sizes="96px"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium text-[#24225c] mb-1">
                      {item.product?.name || 'Unknown Product'}
                    </h3>
                    <p className="text-gray-600 mb-2">${item.product?.price?.toFixed(2) || '0.00'}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-300 rounded-md w-28">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:text-[#76bfd4]"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value) || 1)}
                          className="w-10 text-center border-none focus:ring-0"
                          min="1"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:text-[#76bfd4]"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Line Item Total */}
                      <div className="text-[#24225c] font-medium">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </div>
                      
                      {/* Remove Button */}
                      <div className="ml-auto">
                        <button
                          onClick={() => handleRemoveItem(item.product_id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Clear Cart Button */}
              <div className="p-4 bg-gray-50 text-right">
                <button
                  onClick={handleClearCart}
                  className="text-sm text-gray-500 hover:text-[#b597ff] underline"
                >
                  Clear Shopping Bag
                </button>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#24225c] mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-[#24225c] font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-600">Calculated at next step</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span className="text-gray-600">Calculated at next step</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between font-semibold">
                  <span className="text-[#24225c]">Estimated Total</span>
                  <span className="text-[#24225c]">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-[#b597ff] hover:bg-[#9f81ff] text-white font-semibold py-3 px-4 rounded transition-colors duration-300"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-4">
                <Link
                  href="/products"
                  className="block text-center text-[#24225c] hover:text-[#76bfd4] transition-colors duration-300"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
