'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Added Image import
import AuthStatus from '../auth/AuthStatus';
import { useAuth } from '@/context/AuthContext';
import DropdownLink from './DropdownLink';
import ClientCartIcon from '../cart/ClientCartIcon';

const NavigationHeader: React.FC = () => {
  const { profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isAdmin = profile?.role === 'ADMIN';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-xl font-bold text-[#24225c] hover:text-[#76bfd4] transition-colors duration-300">
              <Image src="/images/logo.png" alt="MALIKLI1992 Logo" width={70} height={70} className="mr-2" />
              
            </Link>
            <nav className="ml-6 space-x-4 hidden md:flex">
              <Link href="/about" className="text-[#24225c] hover:text-[#76bfd4] transition-colors duration-300">
                About Us
              </Link>
              <Link href="/delivery" className="text-[#24225c] hover:text-[#76bfd4] transition-colors duration-300">
                Delivery Information
              </Link>
              {isAdmin && (
                <DropdownLink 
                  label="Admin" 
                  links={[
                    { href: '/admin/create-admin', label: 'Add New Admin' },
                    { href: '/admin/products/new', label: 'Add Product' },
                    { href: '/admin/products', label: 'Manage Products' },
                    { href: '/admin/orders', label: 'Manage Orders' }
                  ]} 
                  className="text-[#b597ff]"
                />
              )}
            </nav>
          </div>
          
          {/* Mobile menu button and cart icon */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Using ClientCartIcon to prevent hydration issues */}
            <ClientCartIcon />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#24225c] hover:text-[#76bfd4] hover:bg-[#ced1ff] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#76bfd4] transition-colors duration-300"
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
          
          {/* Desktop icons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Using ClientCartIcon to prevent hydration issues */}
            <ClientCartIcon />
            
            {/* Auth Status */}
            <AuthStatus />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-2 pb-4 border-t border-gray-200">
            <Link 
              href="/about" 
              className="block py-2 text-base font-medium text-[#24225c] hover:bg-[#ced1ff] hover:text-[#76bfd4] transition-colors duration-300 px-2 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/delivery" 
              className="block py-2 text-base font-medium text-[#24225c] hover:bg-[#ced1ff] hover:text-[#76bfd4] transition-colors duration-300 px-2 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Delivery Information
            </Link>
            
            {isAdmin && (
              <>
                <div className="py-2">
                  <p className="px-2 text-sm font-semibold text-[#b597ff]">Admin</p>
                  <Link 
                    href="/admin/create-admin" 
                    className="block py-2 text-base font-medium text-[#24225c] hover:bg-[#ced1ff] px-2 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Add New Admin
                  </Link>
                  <Link 
                    href="/admin/products/new" 
                    className="block py-2 text-base font-medium text-[#24225c] hover:bg-[#ced1ff] px-2 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Add Product
                  </Link>
                  <Link 
                    href="/admin/products" 
                    className="block py-2 text-base font-medium text-[#24225c] hover:bg-[#ced1ff] px-2 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Manage Products
                  </Link>
                  <Link 
                    href="/admin/orders" 
                    className="block py-2 text-base font-medium text-[#24225c] hover:bg-[#ced1ff] px-2 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Manage Orders
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default NavigationHeader;
