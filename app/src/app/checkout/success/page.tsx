'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface OrderConfirmation {
  orderNumber: string;
  orderDate: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingMethod: string;
  items: any[]; // Using any for simplicity
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order confirmation from session storage
    const storedOrderDetails = sessionStorage.getItem('orderConfirmation');
    
    if (storedOrderDetails) {
      try {
        const parsedDetails = JSON.parse(storedOrderDetails);
        setOrderDetails(parsedDetails);
      } catch (error) {
        console.error('Error parsing order details:', error);
      }
    } else {
      // Redirect to home if no order details found (prevents accessing success page directly)
      // Wait a moment to ensure this isn't triggered during initial load
      const timer = setTimeout(() => {
        if (!orderDetails) {
          router.push('/');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    setLoading(false);
  }, [router]);

  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get estimated delivery date based on shipping method
  const getEstimatedDelivery = (method: string, orderDate: string) => {
    const orderTime = new Date(orderDate);
    let daysToAdd = 0;
    
    switch (method) {
      case 'standard':
        daysToAdd = 5; // 3-5 business days, using max
        break;
      case 'express':
        daysToAdd = 2; // 1-2 business days, using max
        break;
      case 'overnight':
        daysToAdd = 1; // Next business day
        break;
      default:
        daysToAdd = 7;
    }
    
    // Add the days, accounting for weekends in a simple way
    const deliveryDate = new Date(orderTime);
    let daysAdded = 0;
    
    while (daysAdded < daysToAdd) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      // Skip weekends (0 is Sunday, 6 is Saturday)
      const dayOfWeek = deliveryDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };
    
    return deliveryDate.toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#76bfd4]"></div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#24225c] mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-6">
          We couldn't find your order details. Please try placing an order first.
        </p>
        <Link href="/products" className="bg-[#76bfd4] hover:bg-[#5eabc6] text-white font-semibold py-3 px-6 rounded transition-colors duration-300">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Banner */}
      <div className="mb-8 text-center">
        <div className="inline-block p-4 bg-green-100 rounded-full mb-3">
          <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#24225c] mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600">
          Thank you for your purchase. We've sent a confirmation email to your inbox.
        </p>
      </div>
      
      {/* Order Information */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-[#24225c] mb-3">Order Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="text-[#24225c] font-medium">{orderDetails.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="text-[#24225c]">{formatDate(orderDetails.orderDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="text-[#24225c]">Credit Card</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Total:</span>
                <span className="text-[#24225c] font-semibold">${orderDetails.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-[#24225c] mb-3">Shipping Information</h2>
            <div className="mb-4">
              <p className="font-medium text-[#24225c]">{orderDetails.shippingAddress.name}</p>
              <p className="text-gray-600">{orderDetails.shippingAddress.address}</p>
              <p className="text-gray-600">
                {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
              </p>
              <p className="text-gray-600">{orderDetails.shippingAddress.country}</p>
            </div>
            <div className="mb-2">
              <span className="font-medium text-[#24225c]">Shipping Method:</span>
              <span className="text-gray-600 ml-1">
                {orderDetails.shippingMethod === 'standard' && 'Standard Shipping (3-5 business days)'}
                {orderDetails.shippingMethod === 'express' && 'Express Shipping (1-2 business days)'}
                {orderDetails.shippingMethod === 'overnight' && 'Overnight Shipping (Next business day)'}
              </span>
            </div>
            <div>
              <span className="font-medium text-[#24225c]">Estimated Delivery:</span>
              <span className="text-gray-600 ml-1">
                {getEstimatedDelivery(orderDetails.shippingMethod, orderDetails.orderDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#24225c] mb-6">Order Items</h2>
        
        <div className="divide-y divide-gray-200">
          {orderDetails.items.map((item) => (
            <div key={item.id} className="py-4 flex items-start">
              <div className="relative h-20 w-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mr-4">
                {item.product?.image_urls && item.product.image_urls.length > 0 ? (
                  <Image
                    src={item.product.image_urls[0]}
                    alt={item.product?.name || ''}
                    fill
                    sizes="80px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className="text-[#24225c] font-medium">{item.product?.name || 'Unknown Product'}</h3>
                <p className="text-gray-500">Quantity: {item.quantity}</p>
              </div>
              
              <div className="text-[#24225c] font-medium">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-[#24225c]">${orderDetails.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-[#24225c]">${orderDetails.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span className="text-[#24225c]">${orderDetails.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span className="text-[#24225c]">Total:</span>
              <span className="text-[#24225c]">${orderDetails.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Next Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Link href="/products" className="bg-[#b597ff] hover:bg-[#9f81ff] text-white font-semibold py-3 px-6 rounded-md transition-colors duration-300">
          Continue Shopping
        </Link>
        <Link href="/profile" className="bg-white border border-gray-300 hover:bg-gray-50 text-[#24225c] font-semibold py-3 px-6 rounded-md transition-colors duration-300">
          View My Orders
        </Link>
      </div>
    </div>
  );
}
