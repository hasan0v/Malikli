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
      console.error('Ошибка входа:', error.message);
      setError(`Ошибка входа: ${error.message}`);
    } else {
      console.log('Вход выполнен успешно!');
      // Слушатель AuthProvider обработает обновление состояния и перенаправление/изменение UI
      // Нет необходимости очищать форму здесь, так как компонент может размонтироваться или страница может перенаправиться
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4 p-4 border rounded shadow-md">
      <h2 className="text-xl font-semibold">Вход</h2>
      <div>
        <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">Электронная почта:</label>
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
        <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700">Пароль:</label>
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
        {loading ? 'Вход...' : 'Войти'}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
};