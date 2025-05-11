'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
              <Image src="/images/logo.png" alt="Логотип MALIKLI1992" width={120} height={70} className="mr-2" />
            </Link>
            <nav className="ml-6 space-x-4 hidden md:flex">
              <Link href="/about" className="text-[#24225c] hover:text-[#76bfd4] transition-colors duration-300">
                О нас
              </Link>
              <Link href="/delivery" className="text-[#24225c] hover:text-[#76bfd4] transition-colors duration-300">
                Информация о доставке
              </Link>
              {isAdmin && (
                <DropdownLink 
                  label="Админ" 
                  links={[
                    { href: '/admin/create-admin', label: 'Добавить администратора' },
                    { href: '/admin/products/new', label: 'Добавить товар' },
                    { href: '/admin/products', label: 'Управление товарами' },
                    { href: '/admin/orders', label: 'Управление заказами' }
                  ]} 
                  className="text-[#b597ff]"
                />
              )}
            </nav>
          </div>

          {/* Mobile menu button and cart icon */}
          <div className="md:hidden flex items-center space-x-3">
            <ClientCartIcon />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#24225c] hover:text-[#76bfd4] hover:bg-[#ced1ff] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#76bfd4] transition-colors duration-300"
            >
              <span className="sr-only">Открыть главное меню</span>
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
            <ClientCartIcon />
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
              О нас
            </Link>
            <Link 
              href="/delivery" 
              className="block py-2 text-base font-medium text-[#24225c] hover:bg-[#ced1ff] hover:text-[#76bfd4] transition-colors duration-300 px-2 rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Информация о доставке
            </Link>

            {isAdmin && (
              <div className="py-2">
                <p className="px-2 text-sm font-semibold text-[#b597ff]">Админ</p>
                <Link 
                  href="/admin/create-admin" 
                  className="block py-2 text-base font-medium text-[#24225c] hover:bg-[#ced1ff] px-2 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Добавить администратора
                </Link>
                <Link 
                  href="/admin/products/new" 
                  className="block py-2 text-base font-medium text-[#24225c] hover:bg-[#ced1ff] px-2 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Добавить товар
                </Link>
                <Link 
                  href="/admin/products" 
                  className="block py-2 text-base font-medium text-[#24225c] hover:bg-[#ced1ff] px-2 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Управление товарами
                </Link>
                <Link 
                  href="/admin/orders" 
                  className="block py-2 text-base font-medium text-[#24225c] hover:bg-[#ced1ff] px-2 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Управление заказами
                </Link>
              </div>
            )}
            {/* Add AuthStatus for mobile menu */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <AuthStatus />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavigationHeader;
