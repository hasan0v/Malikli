'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error.message);
      setError(`Sign in failed: ${error.message}`);
    } else {
      console.log('Sign in successful!');
      // AuthProvider listener will handle state update and redirect/UI change
      // No need to clear form here as the component might unmount or page might redirect
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4 p-4 border rounded shadow-md">
      <h2 className="text-xl font-semibold">Sign In</h2>
      <div>
        <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">Email:</label>
        <input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700">Password:</label>
        <input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
};
