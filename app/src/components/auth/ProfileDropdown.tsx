'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User } from '@supabase/supabase-js';
import ClientOnly from '@/components/ui/ClientOnly';

interface ProfileDropdownProps {
  user: User;
  isAdmin: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut, profile } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 focus:outline-none"
        aria-expanded={isOpen}
      >        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
          <ClientOnly fallback="U">
            {() => profile?.name 
              ? profile.name.charAt(0).toUpperCase() 
              : user.email?.charAt(0).toUpperCase() || 'U'}
          </ClientOnly>
        </div>
        <span className="hidden md:inline-block text-sm">
          <ClientOnly fallback="Loading...">
            {() => profile?.name || user.email?.split('@')[0] || 'User'}
          </ClientOnly>
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-2 border-b">            <p className="text-sm font-medium text-gray-900 truncate">
              <ClientOnly fallback="Your Account">
                {() => profile?.name || "Your Account"}
              </ClientOnly>
            </p>
            <p className="text-xs text-gray-500 truncate">
              <ClientOnly fallback="Loading...">
                {() => user.email || ""}
              </ClientOnly>
            </p>
          </div>

          <Link 
            href="/profile" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Profile Settings
          </Link>

          <Link 
            href="/orders" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Order History
          </Link>
          
          {isAdmin && (
            <Link 
              href="/admin/products" 
              className="block px-4 py-2 text-sm text-red-600 font-medium hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}
          
          <button
            onClick={() => {
              signOut();
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
