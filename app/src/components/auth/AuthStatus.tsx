'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProfileDropdown from './ProfileDropdown';

const AuthStatus: React.FC = () => {
  // signOut удален из деструктуризации, так как он здесь напрямую не используется.
  // ProfileDropdown, вероятно, обрабатывает действие выхода из системы.
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="text-sm text-gray-500">Загрузка пользователя...</div>;
  }

  const isAdmin = profile?.role === 'ADMIN'; // Также может быть 'admin' на основе предыдущих примеров

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <ProfileDropdown user={user} isAdmin={isAdmin} />
      ) : (
        <>
          <Link href="/signin" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">
            Войти
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Зарегистрироваться
          </Link>
        </>
      )}
    </div>
  );
};

export default AuthStatus;