'use client';

import React from 'react';
import Link from 'next/link';

const HeaderPlaceholder: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">
              MALIKLI1992
            </Link>
            <div className="ml-6 space-x-4 hidden md:flex">
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderPlaceholder;
