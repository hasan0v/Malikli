'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const menuItems = [
    { label: 'Панель управления', path: '/admin', icon: '📊' },
    { label: 'Товары', path: '/admin/products', icon: '🏷️' },
    { label: 'Заказы', path: '/admin/orders', icon: '📦' },
    { label: 'Пользователи', path: '/admin/users', icon: '👥' },
    { label: 'Настройки', path: '/admin/settings', icon: '⚙️' },
  ];

  useEffect(() => {
    // Get current user info
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        // Redirect to login if not authenticated
        router.push('/signin?redirect=/admin');
      }
    };

    fetchUser();

    // Close the profile menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [router]);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Desktop */}
        <aside className="w-64 bg-[#24225c] text-white min-h-screen p-4 hidden md:block">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#3c3a8a]">
            <div className="text-xl font-bold">Malikli Админ</div>
          </div>
          
          {/* Navigation Links */}
          <nav className="mb-8">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                      pathname === item.path || pathname.startsWith(`${item.path}/`)
                        ? 'bg-[#3c3a8a] text-white'
                        : 'text-gray-200 hover:bg-[#3c3a8a] hover:text-white'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Profile Section - Desktop */}
          <div className="mt-auto pt-4 border-t border-[#3c3a8a]">
            <div 
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#3c3a8a] rounded-md transition-colors relative"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-[#76bfd4] flex items-center justify-center mr-3 text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 truncate">
                <div className="text-sm font-medium truncate">{user?.email || 'Администратор'}</div>
                <div className="text-xs text-gray-300">Администратор</div>
              </div>
              <span className="ml-2">▾</span>
            </div>
            
            {/* Profile Dropdown Menu - Desktop */}
            {profileMenuOpen && (
              <div 
                ref={profileMenuRef}
                className="absolute bottom-16 left-4 w-56 bg-white text-gray-800 rounded-md shadow-lg py-1 z-10"
              >
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                  Ваш профиль
                </Link>
                <Link href="/admin/settings" className="block px-4 py-2 hover:bg-gray-100">
                  Настройки аккаунта
                </Link>
                <Link href="/" className="block px-4 py-2 hover:bg-gray-100">
                  Вернуться в магазин
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Header - Mobile */}
        <div className="md:hidden bg-[#24225c] text-white p-4 w-full flex items-center justify-between sticky top-0 z-10">
          <div className="text-xl font-bold">Malikli Админ</div>
          <div className="flex items-center">
            {/* Profile Menu Trigger - Mobile */}
            <div 
              className="w-8 h-8 rounded-full bg-[#76bfd4] flex items-center justify-center mr-3 cursor-pointer"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="text-2xl focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
            
            {/* Profile Dropdown - Mobile */}
            {profileMenuOpen && (
              <div 
                ref={profileMenuRef}
                className="absolute top-14 right-4 w-56 bg-white text-gray-800 rounded-md shadow-lg py-1 z-20"
              >
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                  Ваш профиль
                </Link>
                <Link href="/admin/settings" className="block px-4 py-2 hover:bg-gray-100">
                  Настройки аккаунта
                </Link>
                <Link href="/" className="block px-4 py-2 hover:bg-gray-100">
                  Вернуться в магазин
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#24225c] text-white z-10">
            <nav className="p-4">
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                        pathname === item.path || pathname.startsWith(`${item.path}/`)
                          ? 'bg-[#3c3a8a] text-white'
                          : 'text-gray-200 hover:bg-[#3c3a8a] hover:text-white'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
