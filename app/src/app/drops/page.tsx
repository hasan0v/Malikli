'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';
import ClientOnly from '@/components/ui/ClientOnly';

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

export default function DropsPage() {
  const [upcomingDrops, setUpcomingDrops] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingDrops = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch products that have a future drop date
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .gt('drop_scheduled_time', now) // Only future drops
          .order('drop_scheduled_time', { ascending: true }); // Sort by earliest first

        if (error) {
          throw error;
        }
        setUpcomingDrops(data || []);
      } catch (err: any) {
        console.error("Error fetching upcoming drops:", err);
        setError(`Failed to load upcoming drops: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingDrops();
  }, []); // Run once on mount
  // A static date formatter to be used only on the client side
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date not scheduled';
    
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
  };// This is a pure calculation function with no React hooks
  const calculateTimeRemaining = (dropDate: string) => {
    const now = new Date();
    const drop = new Date(dropDate);
    const diff = drop.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let result = '';
    if (days > 0) {
      result = `${days} day${days !== 1 ? 's' : ''} ${hours} hr${hours !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      result = `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
    } else {
      result = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    return result;
  };
  
  // Custom hook for time remaining with auto-refresh
  const useTimeRemaining = (dropDate: string | null) => {
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    
    useEffect(() => {
      if (!dropDate) return;
      
      const updateTime = () => {
        setTimeRemaining(calculateTimeRemaining(dropDate));
      };
      
      // Initial calculation
      updateTime();
      
      // Update time every minute
      const timer = setInterval(updateTime, 60000);
      return () => clearInterval(timer);
    }, [dropDate]);
    
    return timeRemaining;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Upcoming Drops</h1>
        <p className="text-gray-600">Be ready for our exclusive product releases</p>
      </div>

      {upcomingDrops.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No upcoming drops scheduled</h2>
          <p className="text-gray-500 mb-6">Check back soon for new product announcements</p>
          <Link 
            href="/" 
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Shop Available Products
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {upcomingDrops.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="md:grid md:grid-cols-3">
                <div className="md:col-span-1 relative h-48 md:h-auto bg-gray-100">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <img 
                      src={product.image_urls[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-6 md:col-span-2">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                    <div className="text-right">
                      <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                      {product.inventory_count > 0 && (
                        <p className="text-sm text-gray-500">Limited stock: {product.inventory_count} available</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div>                      <div className="text-indigo-600 font-semibold">
                        <ClientOnly fallback="Drops on: Loading date...">
                          {() => `Drops on: ${formatDate(product.drop_scheduled_time)}`}
                        </ClientOnly>
                      </div>{product.drop_scheduled_time && (
                        <ClientOnly fallback={
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800 mt-1">
                            Calculating time...
                          </span>
                        }>
                          {() => {
                            // Calculate time directly in the client render phase
                            const timeLeft = calculateTimeRemaining(product.drop_scheduled_time!);
                            return (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800 mt-1">
                                {timeLeft} remaining
                              </span>
                            );
                          }}
                        </ClientOnly>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                        Set Reminder
                      </button>
                      <Link href={`/products/${product.id}`} className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition">
                        View Details
                      </Link>
                    </div>
                  </div>
                  
                  {product.description && (
                    <p className="mt-4 text-gray-600 line-clamp-3">{product.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
