'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthStatus from '../auth/AuthStatus';
import { useAuth } from '@/context/AuthContext';
import DropdownLink from './DropdownLink';

const NavigationHeader: React.FC = () => {
  const { profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isAdmin = profile?.role === 'ADMIN';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">
              malikli1992
            </Link>
            <nav className="ml-6 space-x-4 hidden md:flex">
              <Link href="/" className="text-gray-700 hover:text-indigo-600">
                Products
              </Link>
              <Link href="/drops" className="text-gray-700 hover:text-indigo-600">
                Upcoming Drops
              </Link>
              {isAdmin && (
                <DropdownLink 
                  label="Admin" 
                  links={[
                    { href: '/admin/products', label: 'Products' },
                    { href: '/admin/products/new', label: 'Add New Product' },
                    { href: '/admin/create-admin', label: 'Create Admin' },
                    { href: '/admin/orders', label: 'Orders' }
                  ]} 
                />
              )}
              <Link href="/about" className="text-gray-700 hover:text-indigo-600">
                About
              </Link>
            </nav>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
            <div className="hidden md:flex items-center">
              <AuthStatus />
            </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-2 pb-4 border-t border-gray-200">
            <Link 
              href="/" 
              className="block py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              href="/drops" 
              className="block py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Upcoming Drops
            </Link>
            <Link 
              href="/about" 
              className="block py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            {isAdmin && (
              <>
                <Link 
                  href="/admin/products" 
                  className="block py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin: Products
                </Link>
                <Link 
                  href="/admin/products/new" 
                  className="block py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin: Add Product
                </Link>
                <Link 
                  href="/admin/create-admin" 
                  className="block py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin: Create Admin
                </Link>
                <Link 
                  href="/admin/orders" 
                  className="block py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin: Orders
                </Link>
              </>
            )}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <AuthStatus />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavigationHeader;
