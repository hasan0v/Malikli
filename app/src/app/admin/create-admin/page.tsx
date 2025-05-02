'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function AdminUserCreationPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [showPromoteForm, setShowPromoteForm] = useState(false);
  
  const router = useRouter();
  
  // Authorization check - only allow admins
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log('User not authenticated, redirecting');
        router.push('/signin?redirect=/admin/create-admin');
        return;
      }
      
      if (profile?.role !== 'ADMIN') {
        console.log('User not admin, redirecting');
        router.push('/');
        return;
      }
    }
  }, [user, profile, authLoading, router]);

  // Show loading or empty state while checking authorization
  if (authLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  // Don't render the actual page content for non-admins
  if (!user || profile?.role !== 'ADMIN') {
    return null;
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Step 1: Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      if (!data.user) {
        throw new Error('Failed to create user.');
      }

      // Save the user ID for the promotion step
      setUserId(data.user.id);
      setMessage(`User created with ID: ${data.user.id}. You can now promote them to admin.`);
      setShowPromoteForm(true);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the user');
    } finally {
      setLoading(false);
    }
  };
  const handlePromoteToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError('No user ID available. Please create a user first.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Get the current session to include the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('Making API call with token:', session.access_token.substring(0, 10) + '...');
      
      // We need to use a server action or API route for this since it requires the service role key
      const response = await fetch('/api/admin/promote-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // Add Authorization header
        },
        body: JSON.stringify({ userId }),
      });

      // Get the response data
      let data;
      const responseText = await response.text();
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error(`Invalid response format: ${responseText.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        console.error('Error response:', response.status, data);
        throw new Error(data.error || `Failed to promote user (Status ${response.status})`);
      }

      setMessage('User successfully promoted to admin role!');
      
      // Optional: Redirect to admin dashboard or another page
      setTimeout(() => {
        router.push('/admin/products/new');
      }, 2000);
      
    } catch (err: any) {
      console.error('Promotion error:', err);
      setError(err.message || 'An error occurred while promoting the user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Admin User</h1>

      {!showPromoteForm ? (
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      ) : (
        <form onSubmit={handlePromoteToAdmin} className="space-y-4">
          <div className="bg-green-50 p-4 rounded-md mb-4">
            <p className="text-green-800">User created! Now you can promote them to admin.</p>
            <p className="text-sm text-gray-600 mt-1">User ID: {userId}</p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Promoting...' : 'Promote to Admin'}
          </button>
        </form>
      )}
      
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {message && !showPromoteForm && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}
