'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // You can add options for user metadata here if needed
      options: {
        data: {
          full_name: 'Adam Smith',
          
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error.message);
      setError(`Sign up failed: ${error.message}`);
    } else if (data.user && data.user.identities?.length === 0) {
        // This case might happen if email confirmation is required but the user already exists without confirmation.
        // Supabase might return a user object but indicate it's not fully confirmed.
        console.log('Sign up successful, but requires verification or user might already exist.');
        setMessage('Please check your email to confirm your account, or try signing in if you already have an account.');
        // Consider if you need specific handling for data.session being null here
    } else if (data.user) {
      console.log('Sign up successful:', data.user);
      setMessage('Sign up successful! Check your email for verification if enabled.');
      // User state will be updated by the AuthProvider listener
      setEmail(''); // Clear form
      setPassword('');
    } else {
        // Fallback case if no user and no error, though less common
        setError('An unexpected issue occurred during sign up.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4 p-4 border rounded shadow-md">
      <h2 className="text-xl font-semibold">Sign Up</h2>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6} // Supabase default minimum password length
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
};
