'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabaseClient';
import Image from 'next/image';

const ProfilePage: React.FC = () => {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // If still loading auth state, show loading indicator
  if (loading) {
    return <div className="text-center py-10">Loading profile data...</div>;
  }

  // If not logged in, redirect to sign in page
  if (!user) {
    router.push('/signin');
    return <div className="text-center py-10">Redirecting to sign in...</div>;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md my-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Profile</h1>

      {message && <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>}

      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center">
            {/* Profile avatar - either use user's avatar or show initials */}
            {profile?.name ? (
              <span className="text-2xl font-bold text-indigo-700">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </span>
            ) : (
              <span className="text-2xl font-bold text-indigo-700">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <p className="text-lg font-medium">{profile?.name || 'No name set'}</p>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm mt-1 bg-gray-100 px-2 py-1 rounded inline-block">
              Role: {profile?.role || 'User'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      <div className="mt-10 pt-6 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
