'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabaseClient';
// import Image from 'next/image'; // Unused import
import Link from 'next/link';

interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  type: 'shipping' | 'billing';
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
}

interface NotificationPreference {
  product_drops: boolean;
  order_updates: boolean;
  promotions: boolean;
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

const ProfilePage: React.FC = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth(); 
  const router = useRouter();
  const [name, setName] = useState(''); 
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference>({
    product_drops: true,
    order_updates: true,
    promotions: false
  });

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  useEffect(() => {
    if (!user || authLoading) return; 
    
    const fetchRecentOrders = async () => {
      setOrdersLoading(true);
      try {
        const dummyOrders: Order[] = [
          {
            id: 'ORD-12345',
            created_at: '2025-04-28T15:30:00Z',
            status: 'delivered',
            total_amount: 129.99,
          },
          {
            id: 'ORD-12346',
            created_at: '2025-05-01T12:15:00Z', 
            status: 'processing',
            total_amount: 59.99,
          },
        ];
        await new Promise(resolve => setTimeout(resolve, 300)); 
        setRecentOrders(dummyOrders);
      } catch (err: unknown) {
        const msg = getErrorMessage(err); // Use a different variable name
        console.error('Error fetching orders:', msg);
      } finally {
        setOrdersLoading(false);
      }
    };
    
    const fetchAddresses = async () => {
      setAddressesLoading(true);
      try {
        const dummyAddresses: Address[] = [
          {
            id: '1',
            name: 'Home',
            line1: '123 Main Street',
            line2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            country: 'United States',
            is_default: true,
            type: 'shipping'
          },
          {
            id: '2',
            name: 'Work',
            line1: '456 Business Ave',
            city: 'Boston',
            state: 'MA',
            postal_code: '02108',
            country: 'United States',
            is_default: false,
            type: 'shipping'
          }
        ];
        await new Promise(resolve => setTimeout(resolve, 300)); 
        setAddresses(dummyAddresses);
      } catch (err: unknown) {
        const msg = getErrorMessage(err); // Use a different variable name
        console.error('Error fetching addresses:', msg);
      } finally {
        setAddressesLoading(false);
      }
    };
    
    fetchRecentOrders();
    fetchAddresses();
  }, [user, authLoading]); 

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [authLoading, user, router]);


  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; 

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const { error: updateError } = await supabase 
        .from('profiles')
        .update({
          name: name.trim() || null,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setMessage('Profile updated successfully!');
    } catch (err: unknown) {
      const msg = getErrorMessage(err); // Use a different variable name
      setError(msg || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleNotificationChange = (key: keyof NotificationPreference) => {
    setNotificationPreferences(prev => ({ 
      ...prev, 
      [key]: !prev[key] 
    }));
  };
  
  const saveNotificationPreferences = () => {
    console.log("Saving notification preferences:", notificationPreferences);
    setMessage('Notification preferences updated');
    setTimeout(() => setMessage(''), 3000);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch { // Removed unused _err
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
        return 'bg-[#a0fff8]/20 text-[#24225c]';
      case 'shipped':
        return 'bg-[#ced1ff]/20 text-[#24225c]';
      case 'delivered':
        return 'bg-[#76bfd4]/20 text-[#24225c]';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#76bfd4]"></div>
        <span className="ml-3 text-gray-700">Loading account...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Please sign in to access your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#24225c] mb-8">Your Account</h1>
      
      {message && <div className="mb-6 p-4 bg-[#a0fff8]/20 text-[#24225c] rounded-lg">{message}</div>}
      {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Account Tabs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-[#76bfd4] text-[#76bfd4]'
                : 'border-transparent text-gray-500 hover:text-[#24225c] hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-[#76bfd4] text-[#76bfd4]'
                : 'border-transparent text-gray-500 hover:text-[#24225c] hover:border-gray-300'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'addresses'
                ? 'border-[#76bfd4] text-[#76bfd4]'
                : 'border-transparent text-gray-500 hover:text-[#24225c] hover:border-gray-300'
            }`}
          >
            Addresses
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-[#76bfd4] text-[#76bfd4]'
                : 'border-transparent text-gray-500 hover:text-[#24225c] hover:border-gray-300'
            }`}
          >
            Notifications
          </button>
        </nav>
      </div>
      
      {activeTab === 'profile' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-[#ced1ff]/20">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-[#76bfd4] to-[#b597ff] w-28 h-28 rounded-full flex items-center justify-center mb-4">
                  {profile?.name ? (
                    <span className="text-3xl font-bold text-white">
                      {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-[#24225c]">
                  {profile?.name || 'No name set'}
                </h2>
                <p className="text-gray-600 mb-4">{user.email}</p>
                
                <div className="w-full mt-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Role</span>
                    <span className="font-medium text-[#24225c]">{profile?.role || 'User'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Member since</span>
                    <span className="font-medium text-[#24225c]">April 2025</span> {/* Placeholder */}
                  </div>
                </div>
                
                <button
                  onClick={signOut}
                  className="mt-6 w-full px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-[#ced1ff]/20">
              <h3 className="text-xl font-bold text-[#24225c] mb-6">Account Information</h3>
              
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#24225c] mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-[#76bfd4]"
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#24225c] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#24225c] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#76bfd4] focus:border-[#76bfd4]"
                      placeholder="(Optional)"
                    />
                  </div>
                </div>
                
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-[#b597ff] hover:bg-[#a076ff] text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b597ff]"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6 md:p-8 border border-[#ced1ff]/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#24225c]">Password Settings</h3>
                <button className="text-sm text-[#76bfd4] hover:text-[#5eabc6]">
                  Change Password
                </button>
              </div>
              
              <div className="bg-[#a0fff8]/10 p-4 rounded-lg">
                <p className="text-[#24225c]">
                  For security reasons, we recommend changing your password regularly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'orders' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#24225c]">Your Orders</h3>
            <Link 
              href="/orders" 
              className="text-sm text-[#76bfd4] hover:text-[#5eabc6] hover:underline"
            >
              View All Orders →
            </Link>
          </div>
          
          {ordersLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#76bfd4]"></div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-[#ced1ff]/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">You haven&apos;t placed any orders yet.</p>
              <Link 
                href="/products" 
                className="inline-flex items-center px-5 py-2 bg-[#b597ff] hover:bg-[#a076ff] text-white font-medium rounded-md transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {recentOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#ced1ff]/20">
                  <div className="p-5 flex flex-wrap justify-between items-center border-b border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Order placed on: <span className="font-medium text-[#24225c]">{formatDate(order.created_at)}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Order #: <span className="font-medium text-[#24225c]">{order.id}</span>
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-[#ced1ff]/20 rounded-md flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#76bfd4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-[#24225c]">Order Total: {formatCurrency(order.total_amount)}</p>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/orders?id=${order.id}`} 
                      className="px-4 py-2 border border-[#76bfd4] text-[#76bfd4] hover:bg-[#76bfd4] hover:text-white rounded-md transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'addresses' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#24225c]">Your Addresses</h3>
            <button className="px-4 py-2 bg-[#b597ff] hover:bg-[#a076ff] text-white rounded-md transition-colors text-sm font-medium">
              Add New Address
            </button>
          </div>
          
          {addressesLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#76bfd4]"></div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-[#ced1ff]/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No addresses saved</h3>
              <p className="text-gray-500 mb-6">Add a shipping or billing address to your account.</p>
              <button className="inline-flex items-center px-5 py-2 bg-[#b597ff] hover:bg-[#a076ff] text-white font-medium rounded-md transition-colors">
                Add Address
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {addresses.map((address) => (
                <div key={address.id} className="bg-white rounded-xl shadow-sm p-6 border border-[#ced1ff]/20 relative">
                  {address.is_default && (
                    <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#a0fff8]/20 text-[#24225c]">
                      Default
                    </span>
                  )}
                  
                  <h4 className="font-medium text-[#24225c] mb-1">{address.name}</h4>
                  <p className="text-gray-500 text-sm mb-3">
                    {address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address
                  </p>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-6">
                    <p>{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="px-3 py-1.5 border border-[#76bfd4] text-[#76bfd4] hover:bg-[#76bfd4] hover:text-white rounded text-sm transition-colors">
                      Edit
                    </button>
                    {!address.is_default && (
                      <button className="px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded text-sm transition-colors">
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'notifications' && (
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#24225c] mb-8">Notification Preferences</h3>
            
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-[#ced1ff]/20">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-[#24225c] mb-1">Product Drops</h4>
                    <p className="text-sm text-gray-500">Be notified when new products are available</p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notificationPreferences.product_drops}
                      onChange={() => handleNotificationChange('product_drops')}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#76bfd4] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#76bfd4] peer-focus:ring-opacity-50 after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                  <div>
                    <h4 className="font-medium text-[#24225c] mb-1">Order Updates</h4>
                    <p className="text-sm text-gray-500">Receive notifications about your orders</p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notificationPreferences.order_updates}
                      onChange={() => handleNotificationChange('order_updates')}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#76bfd4] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#76bfd4] peer-focus:ring-opacity-50 after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between pb-5">
                  <div>
                    <h4 className="font-medium text-[#24225c] mb-1">Promotions & Offers</h4>
                    <p className="text-sm text-gray-500">Get special deals and promotional offers</p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notificationPreferences.promotions}
                      onChange={() => handleNotificationChange('promotions')}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#76bfd4] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#76bfd4] peer-focus:ring-opacity-50 after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
                
                <div className="pt-4">
                  <button 
                    onClick={saveNotificationPreferences}
                    className="px-6 py-2 bg-[#b597ff] hover:bg-[#a076ff] text-white font-medium rounded-md transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#24225c]/5 p-6 md:p-8 rounded-xl mt-8">
            <h3 className="text-xl font-bold text-[#24225c] mb-4">Email Subscriptions</h3>
            <p className="text-gray-600 mb-6">
              To update your email preferences, please check the links at the bottom of any email we&apos;ve sent you,
              or contact our customer support team for assistance.
            </p>
            <a href="mailto:support@malikli.com" className="text-[#76bfd4] hover:underline">
              Contact Support →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;