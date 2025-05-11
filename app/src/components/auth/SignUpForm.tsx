'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Add state for full name
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, // Use the state value for full_name
        }
      }
    });

    if (error) {
      console.error('Ошибка регистрации:', error.message);
      setError(`Ошибка регистрации: ${error.message}`);
    } else if (data.user && data.user.identities?.length === 0) {
        // Этот случай может произойти, если требуется подтверждение по электронной почте,
        // но пользователь уже существует без подтверждения.
        // Supabase может вернуть объект пользователя, но указать, что он не полностью подтвержден.
        console.log('Регистрация успешна, но требуется верификация или пользователь уже может существовать.');
        setMessage('Пожалуйста, проверьте свою электронную почту для подтверждения учетной записи или попробуйте войти, если у вас уже есть аккаунт.');
        // Подумайте, нужна ли здесь специальная обработка для data.session, равного null
    } else if (data.user) {
      console.log('Регистрация успешна:', data.user);
      setMessage('Регистрация успешна! Проверьте свою электронную почту для верификации, если она включена.');
      // Состояние пользователя будет обновлено слушателем AuthProvider
      setEmail(''); // Очистить форму
      setPassword('');
      setFullName(''); // Clear full name field
    } else {
        // Резервный случай, если нет пользователя и нет ошибки, хотя это менее распространено
        setError('Во время регистрации произошла непредвиденная ошибка.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4 p-4 border rounded shadow-md">
      <h2 className="text-xl font-semibold">Регистрация</h2>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Полное имя:</label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Электронная почта:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Пароль:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6} // Минимальная длина пароля по умолчанию в Supabase
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
};