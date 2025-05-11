'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User } from '@supabase/supabase-js';
import ClientOnly from '@/components/ui/ClientOnly'; // Предполагается, что этот компонент существует

interface ProfileDropdownProps {
  user: User;
  isAdmin: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut, profile } = useAuth();

  // Закрыть выпадающее меню при клике вне его
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
        className="flex items-center space-x-2 focus:outline-none p-1 rounded hover:bg-gray-100" // Добавлены отступы и эффект при наведении для лучшего UX
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
          <ClientOnly fallback="П">
            {() => profile?.name
              ? profile.name.charAt(0).toUpperCase()
              : user.email?.charAt(0).toUpperCase() || 'П'}
          </ClientOnly>
        </div>
        {/* Всегда отображать имя, при необходимости настройте стили для мобильных устройств */}
        <span className="text-sm text-gray-700">
          <ClientOnly fallback="Загрузка...">
            {() => profile?.name || user.email?.split('@')[0] || 'Пользователь'}
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
        <div
          className="absolute md:left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50 origin-top-right md:origin-top-left"
          // Добавлены md:left-0 и md:origin-top-left для десктопа, по умолчанию right-0 и origin-top-right для мобильных
        >
          <div className="px-4 py-3 border-b"> {/* Увеличены отступы */}
            <p className="text-sm font-semibold text-gray-900 truncate"> {/* Имя сделано жирнее */}
              <ClientOnly fallback="Ваш аккаунт">
                {() => profile?.name || "Ваш аккаунт"}
              </ClientOnly>
            </p>
            <p className="text-xs text-gray-500 truncate">
              <ClientOnly fallback="Загрузка...">
                {() => user.email || ""}
              </ClientOnly>
            </p>
          </div>

          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Настройки профиля
          </Link>

          <Link
            href="/orders"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            История заказов
          </Link>

          {isAdmin && (
            <Link
              href="/admin/products" // Путь может отличаться
              className="block px-4 py-2 text-sm text-red-600 font-medium hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Панель администратора
            </Link>
          )}

          <button
            onClick={() => {
              signOut();
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;