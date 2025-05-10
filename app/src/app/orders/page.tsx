'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NextImage from 'next/image'; // Import NextImage
// import { supabase } from '@/utils/supabaseClient'; // Not used with dummy data

interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
}

// Helper function to get error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'An unknown error occurred.';
};

export default function OrdersPage() {  
  const { user, loading: authLoading } = useAuth(); 
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        const timer = setTimeout(() => {
          router.replace('/orders', { scroll: false }); 
        }, 3000); 
        return () => clearTimeout(timer);
      }
    }
  }, [router]);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true); 
      return;
    }
    
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const dummyOrders: Order[] = [
          {
            id: '1',
            created_at: '2025-04-28T15:30:00Z',
            status: 'delivered',
            total_amount: 129.99,
            items: [
              {
                id: '101',
                product_name: 'Limited Edition T-Shirt',
                price: 49.99,
                quantity: 1,
                image_url: 'https://utfs.io/f/90f21efe-8983-455e-800e-3cdcde6e08ec-1.png',
              },
              {
                id: '102',
                product_name: 'Designer Hoodie',
                price: 79.99,
                quantity: 1,
                image_url: 'https://utfs.io/f/c9436ff7-6da0-4a6f-9f7d-9bea54edecd5-2.png',
              },
            ],
          },
          {
            id: '2',
            created_at: '2025-05-01T12:15:00Z', 
            status: 'processing',
            total_amount: 59.99,
            items: [
              {
                id: '103',
                product_name: 'Graphic Print Cap',
                price: 29.99,
                quantity: 2,
                image_url: 'https://utfs.io/f/0a928c47-7369-4bf8-b607-c42600e09b6c-3.png',
              },
            ],
          },
        ];
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setOrders(dummyOrders);
        
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        console.error('Error fetching orders:', err);
        setError(`Failed to load your orders. ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading, router]);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch { // Removed unused _error
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || isLoading) { 
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-700">Loading orders...</span>
      </div>
    );
  }

  if (!user && !authLoading) {
      return <div className="text-center py-10">Please sign in to view your orders.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      
      {error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">You haven&apos;t placed any orders yet.</p>
          <button
            onClick={() => router.push('/')}
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">
                    Order placed on: <span className="font-medium text-gray-700">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Order #: <span className="font-medium text-gray-700">{order.id}</span>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)} capitalize`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 flex">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden relative">
                      {item.image_url ? (
                        <NextImage 
                          src={item.image_url} 
                          alt={item.product_name} 
                          fill
                          sizes="80px"
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900">Total</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}