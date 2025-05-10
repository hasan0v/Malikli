'use client'; // Make this a client component to fetch data client-side

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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

interface NextDrop {
  id: string;
  name: string;
  drop_scheduled_time: string;
}

export default function HomePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [nextDrop, setNextDrop] = useState<NextDrop | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  
  // Form state for signup
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get current date
        const now = new Date().toISOString();
        
        // First, check for the next upcoming drop
        const { data: upcomingDrops, error: dropError } = await supabase
          .from('products')
          .select('id, name, drop_scheduled_time')
          .eq('is_active', true)
          .gt('drop_scheduled_time', now)
          .order('drop_scheduled_time', { ascending: true })
          .limit(1);
          
        if (dropError) throw dropError;
        
        if (upcomingDrops && upcomingDrops.length > 0) {
          setNextDrop(upcomingDrops[0]);
        }
        
        // Fetch active products that are currently available (not scheduled for future or drop time has passed)
        // and have inventory
        const { data: availableProducts, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .gt('inventory_count', 0)
          .or(`drop_scheduled_time.is.null,drop_scheduled_time.lte.${now}`) // Available if no drop time OR drop time is in the past
          .order('created_at', { ascending: false }); // Show newest first

        if (productsError) throw productsError;
        
        setProducts(availableProducts || []);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount
  
  // Update the countdown timer every second if there's a scheduled drop
  useEffect(() => {
    if (!nextDrop?.drop_scheduled_time) return;
    
    const calculateTimeRemaining = () => {
      const dropTime = new Date(nextDrop.drop_scheduled_time).getTime();
      const currentTime = new Date().getTime();
      const timeDiff = dropTime - currentTime;
      
      // If the time has passed, refresh page to show products
      if (timeDiff <= 0) {
        window.location.reload();
        return;
      }
      
      // Calculate remaining time
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeRemaining({ days, hours, minutes, seconds });
    };
    
    // Calculate immediately and then every second
    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(timer);
  }, [nextDrop]);
  
  // Handle form submission for sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);
    
    // Form validation
    if (!firstName || !lastName || !email || !password) {
      setFormError('All fields are required');
      setIsSubmitting(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
    
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Sign up with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      
      if (error) throw error;
      
      // Success - show message
      setFormSuccess('Success! You\'re registered and will be notified.');
      
      // Check if the drop is active - redirect after 2 seconds
      setTimeout(() => {
        const dropIsActive = nextDrop && new Date(nextDrop.drop_scheduled_time) <= new Date();
        if (dropIsActive) {
          // Redirect to products page
          router.push('/products');
        } else {
          // Just close the modal
          setShowSignUpModal(false);
          setFormSuccess('');
        }
      }, 2000);
      
    } catch (err: any) {
      console.error('Signup error:', err);
      setFormError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If next drop exists and it's in the future, show the countdown landing page
  if (nextDrop && new Date(nextDrop.drop_scheduled_time) > new Date()) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Hero Section with Countdown */}
        <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#24225c] mb-6">
            {nextDrop.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-[#24225c] mb-10 max-w-2xl">
            Curated Exclusivity. Dropping Soon.
          </p>
          
          {/* Countdown Timer */}
          <div className="mb-12">
            <h2 className="text-xl mb-4 font-semibold text-[#76bfd4]">Next Drop Arrives In:</h2>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-[#ced1ff] rounded-lg">
                <span className="block text-3xl md:text-4xl font-bold text-[#24225c]">{timeRemaining.days}</span>
                <span className="text-gray-600">Days</span>
              </div>
              <div className="p-4 bg-[#ced1ff] rounded-lg">
                <span className="block text-3xl md:text-4xl font-bold text-[#24225c]">{timeRemaining.hours}</span>
                <span className="text-gray-600">Hours</span>
              </div>
              <div className="p-4 bg-[#ced1ff] rounded-lg">
                <span className="block text-3xl md:text-4xl font-bold text-[#24225c]">{timeRemaining.minutes}</span>
                <span className="text-gray-600">Minutes</span>
              </div>
              <div className="p-4 bg-[#ced1ff] rounded-lg">
                <span className="block text-3xl md:text-4xl font-bold text-[#24225c]">{timeRemaining.seconds}</span>
                <span className="text-gray-600">Seconds</span>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <button
            onClick={() => setShowSignUpModal(true)}
            className="bg-[#b597ff] hover:bg-[#9f81ff] transition-colors duration-300 text-white font-semibold py-3 px-8 rounded-md text-lg"
          >
            Sign Up for Drop Access
          </button>
        </div>
        
        {/* Sign-Up Modal */}
        {showSignUpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
              {/* Close button */}
              <button 
                onClick={() => setShowSignUpModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h2 className="text-2xl font-bold text-[#24225c] mb-6">Sign Up for Drop Access</h2>
              
              {formSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  {formSuccess}
                </div>
              ) : (
                <form onSubmit={handleSignUp}>
                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                      {formError}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#76bfd4] hover:bg-[#5eabc6] text-white font-semibold py-2.5 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Otherwise, display the regular products page
  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div>
      {/* Promotional Banner */}
      <div className="mb-8 relative rounded-lg overflow-hidden">
        <div className="h-64 bg-gradient-to-r from-[#24225c] to-[#b597ff]">
          {/* This would ideally be an image or video */}
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center p-6">
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
      
      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">No products available right now.</p>
          <p className="text-[#b597ff]">Check back soon for upcoming drops!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
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
                <h2 className="text-lg font-semibold truncate group-hover:text-[#76bfd4]">{product.name}</h2>
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