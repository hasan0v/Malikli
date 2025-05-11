'use client'; // Сделать этот компонент клиентским для загрузки данных на стороне клиента

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';
// import { useAuth } from '@/context/AuthContext'; // user и profile не используются
import { useRouter } from 'next/navigation';

// Определите структуру Product на основе вашей схемы
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_urls: string[] | null;
  inventory_count: number;
  is_active: boolean;
  drop_scheduled_time: string | null;
  created_at: string;
  updated_at: string;
}

interface NextDrop {
  id: string;
  name: string;
  drop_scheduled_time: string;
}

// Вспомогательная функция для получения сообщений об ошибках
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'Произошла неизвестная ошибка.';
};

export default function HomePage() {
  // const { user, profile } = useAuth(); // user и profile не используются в логике этого компонента
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [nextDrop, setNextDrop] = useState<NextDrop | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  // Состояние формы для регистрации
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date().toISOString();

        const { data: upcomingDropsData, error: dropError } = await supabase // Переименовали data в upcomingDropsData
          .from('products')
          .select('id, name, drop_scheduled_time')
          .eq('is_active', true)
          .gt('drop_scheduled_time', now)
          .order('drop_scheduled_time', { ascending: true })
          .limit(1);

        if (dropError) throw dropError;

        const upcomingDrops = upcomingDropsData as NextDrop[] | null; // Приведение типа
        if (upcomingDrops && upcomingDrops.length > 0) {
          setNextDrop(upcomingDrops[0]);
        }

        const { data: availableProductsData, error: productsError } = await supabase // Переименовали data
          .from('products')
          .select('*')
          .eq('is_active', true)
          .gt('inventory_count', 0)
          .or(`drop_scheduled_time.is.null,drop_scheduled_time.lte.${now}`)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;

        setProducts((availableProductsData as Product[]) || []); // Приведение типа data
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        console.error("Ошибка при загрузке данных:", err);
        setError(`Не удалось загрузить данные: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!nextDrop?.drop_scheduled_time) return;

    const calculateTimeRemaining = () => {
      const dropTime = new Date(nextDrop.drop_scheduled_time).getTime();
      const currentTime = new Date().getTime();
      const timeDiff = dropTime - currentTime;

      if (timeDiff <= 0) {
        // Вместо перезагрузки, возможно, просто очистить nextDrop и снова загрузить товары или установить флаг
        setNextDrop(null); // Это вызовет другой вид
        // При желании, здесь можно снова вызвать fetchData(), если станут доступны новые товары
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [nextDrop]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    if (!firstName || !lastName || !email || !password) {
      setFormError('Все поля обязательны для заполнения');
      setIsSubmitting(false);
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Пароли не совпадают');
      setIsSubmitting(false);
      return;
    }
    if (password.length < 8) {
      setFormError('Пароль должен содержать не менее 8 символов');
      setIsSubmitting(false);
      return;
    }

    try {
      // Регистрация с помощью email и пароля
      // const { data, error } = await supabase.auth.signUp({ // 'data' присвоено значение, но никогда не используется.
      const { error: signUpError } = await supabase.auth.signUp({ // Деструктурируем только error, если data не используется
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            // Supabase автоматически создает профиль через триггер, или вам нужно будет вставить данные в таблицу 'profiles' здесь
            // если ваш AuthContext не обрабатывает это.
          }
        }
      });

      if (signUpError) throw signUpError;

      setFormSuccess("Успешно! Вы зарегистрированы и получите уведомление.");

      setTimeout(() => {
        const dropIsActive = nextDrop && new Date(nextDrop.drop_scheduled_time) <= new Date();
        if (dropIsActive) {
          router.push('/products');
        } else {
          setShowSignUpModal(false);
          setFormSuccess('');
          // Очистить поля формы
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
      }, 2000);

    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error('Ошибка регистрации:', err);
      setFormError(message || 'Не удалось зарегистрироваться. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (nextDrop && new Date(nextDrop.drop_scheduled_time) > new Date()) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#24225c] mb-6">
            {nextDrop.name}
          </h1>

          <p className="text-xl md:text-2xl text-[#24225c] mb-10 max-w-2xl">
            Эксклюзивный отбор. Скоро в продаже.
          </p>

          <div className="mb-12">
            <h2 className="text-xl mb-4 font-semibold text-[#76bfd4]">Следующий дроп через:</h2>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-[#ced1ff] rounded-lg">
                <span className="block text-3xl md:text-4xl font-bold text-[#24225c]">{timeRemaining.days}</span>
                <span className="text-gray-600">Дней</span>
              </div>
              <div className="p-4 bg-[#ced1ff] rounded-lg">
                <span className="block text-3xl md:text-4xl font-bold text-[#24225c]">{timeRemaining.hours}</span>
                <span className="text-gray-600">Часов</span>
              </div>
              <div className="p-4 bg-[#ced1ff] rounded-lg">
                <span className="block text-3xl md:text-4xl font-bold text-[#24225c]">{timeRemaining.minutes}</span>
                <span className="text-gray-600">Минут</span>
              </div>
              <div className="p-4 bg-[#ced1ff] rounded-lg">
                <span className="block text-3xl md:text-4xl font-bold text-[#24225c]">{timeRemaining.seconds}</span>
                <span className="text-gray-600">Секунд</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSignUpModal(true)}
            className="bg-[#b597ff] hover:bg-[#9f81ff] transition-colors duration-300 text-white font-semibold py-3 px-8 rounded-md text-lg"
          >
            Зарегистрироваться для доступа к дропу
          </button>
        </div>

        {showSignUpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
              <button
                onClick={() => setShowSignUpModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-2xl font-bold text-[#24225c] mb-6">Регистрация для доступа к дропу</h2>

              {formSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  {formSuccess}
                </div>
              ) : (
                <form onSubmit={handleSignUp}>
                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Адрес электронной почты</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">Не менее 8 символов</p>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Подтвердите пароль</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#76bfd4] hover:bg-[#5eabc6] text-white font-semibold py-2.5 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-10">Загрузка товаров...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="mb-8 relative rounded-lg overflow-hidden">
        <div className="h-64 bg-gradient-to-r from-[#24225c] to-[#b597ff]">
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center p-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Исследуйте коллекцию</h1>
            <p className="text-lg md:text-xl">Создано для ценителей. Покупайте новинки.</p>
          </div>
        </div>
      </div>

      <div className="mb-8 text-center max-w-3xl mx-auto">
        <p className="text-lg text-[#24225c]">
          Неподвластные времени силуэты, переосмысленные для современного законодателя вкусов, созданные в ограниченном количестве для тех, кто коллекционирует, а не потребляет.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">Товары в данный момент отсутствуют.</p>
          <p className="text-[#b597ff]">Заходите позже, чтобы узнать о предстоящих дропах!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
              <div className="relative w-full h-48 bg-gray-200">
                {product.image_urls && product.image_urls.length > 0 ? (
                  <Image
                    src={product.image_urls[0]}
                    alt={product.name} // Предполагается, что product.name может быть на русском или это название бренда/товара
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">Нет изображения</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold truncate group-hover:text-[#76bfd4]">{product.name}</h2>
                <p className="text-gray-700 mt-1">BYN {product.price.toFixed(2)}</p>
                {product.inventory_count > 0 && product.inventory_count <= 5 && ( // Показывать только если товар в наличии > 0
                  <p className="text-xs text-red-600 mt-1">Осталось {product.inventory_count} шт.!</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}