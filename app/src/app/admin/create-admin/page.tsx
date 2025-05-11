'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function AdminUserCreationPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [showPromoteForm, setShowPromoteForm] = useState(false);

  const router = useRouter();

  // Проверка авторизации - разрешить только администраторам
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log('Пользователь не аутентифицирован, перенаправление');
        router.push('/signin?redirect=/admin/create-admin');
        return;
      }

      if (profile?.role !== 'ADMIN') {
        console.log('Пользователь не является администратором, перенаправление');
        router.push('/');
        return;
      }
    }
  }, [user, profile, authLoading, router]);

  // Показать состояние загрузки или пустое состояние во время проверки авторизации
  if (authLoading) {
    return <div className="p-8 text-center">Загрузка...</div>;
  }

  // Не отображать фактическое содержимое страницы для неадминистраторов
  if (!user || profile?.role !== 'ADMIN') {
    return null;
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Шаг 1: Регистрация пользователя
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error('Не удалось создать пользователя.');
      }

      // Сохранить ID пользователя для шага повышения прав
      setUserId(data.user.id);
      setMessage(`Пользователь создан с ID: ${data.user.id}. Теперь вы можете повысить его до администратора.`);
      setShowPromoteForm(true);

    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при создании пользователя';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handlePromoteToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError('ID пользователя отсутствует. Сначала создайте пользователя.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Получить текущую сессию для включения токена аутентификации
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Требуется аутентификация. Пожалуйста, войдите снова.');
      }

      console.log('Выполнение API-вызова с токеном:', session.access_token.substring(0, 10) + '...');

      // Нам нужно использовать серверное действие или API-маршрут для этого,
      // так как это требует ключа роли службы
      const response = await fetch('/api/admin/promote-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // Добавить заголовок Authorization
        },
        body: JSON.stringify({ userId }),
      });

      // Получить данные ответа
      let data;
      const responseText = await response.text();

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error('Не удалось разобрать ответ как JSON:', responseText);
        throw new Error(`Неверный формат ответа: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        console.error('Ответ с ошибкой:', response.status, data);
        throw new Error(data.error || `Не удалось повысить пользователя (Статус ${response.status})`);
      }

      setMessage('Пользователь успешно повышен до роли администратора!');

      // Необязательно: перенаправить на панель администратора или другую страницу
      setTimeout(() => {
        router.push('/admin/products/new');
      }, 2000);

    } catch (err: Error | unknown) {
      console.error('Ошибка повышения прав:', err);
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при повышении пользователя';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Создать пользователя-администратора</h1>

      {!showPromoteForm ? (
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Полное имя</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Электронная почта</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать пользователя'}
          </button>
        </form>
      ) : (
        <form onSubmit={handlePromoteToAdmin} className="space-y-4">
          <div className="bg-green-50 p-4 rounded-md mb-4">
            <p className="text-green-800">Пользователь создан! Теперь вы можете повысить его до администратора.</p>
            <p className="text-sm text-gray-600 mt-1">ID пользователя: {userId}</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Повышение...' : 'Повысить до администратора'}
          </button>
        </form>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {message && !showPromoteForm && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}