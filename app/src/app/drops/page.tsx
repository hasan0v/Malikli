'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabaseClient';
import ClientOnly from '@/components/ui/ClientOnly';
import { CountdownTimer, NotificationForm } from './DropsContent'; // Предполагается, что эти компоненты существуют и переведены

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
  collection: string | null; // Предполагается, что это упрощенные поля
  category: string | null;  // Если это ID, типизируйте их как string
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


export default function DropsPage() {
  const [upcomingDrops, setUpcomingDrops] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailNotification, setEmailNotification] = useState('');
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    const fetchUpcomingDrops = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date().toISOString();
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*') // Рассмотрите выбор только необходимых полей для производительности
          .eq('is_active', true)
          .gt('drop_scheduled_time', now)
          .order('drop_scheduled_time', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }
        setUpcomingDrops((data as Product[]) || []); // Приведение типа data к Product[]
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        console.error("Ошибка при загрузке предстоящих дропов:", err);
        setError(`Не удалось загрузить предстоящие дропы: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingDrops();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Дата не назначена';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', { // Используем русский формат
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false // 24-часовой формат для России
    }).format(date);
  };

  const handleNotificationSignup = (productId: string) => {
    if (!emailNotification.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNotification)) {
      alert('Пожалуйста, введите действительный адрес электронной почты');
      return;
    }

    setNotificationLoading(true);

    setTimeout(() => {
      console.log(`Уведомление установлено для товара ${productId} с email: ${emailNotification}`);
      setShowNotificationSuccess(true);
      setEmailNotification(''); // Очистить после "отправки"
      setNotificationLoading(false);

      setTimeout(() => {
        setShowNotificationSuccess(false);
      }, 5000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#76bfd4]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Ошибка загрузки дропов: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#76bfd4] hover:bg-[#5eabc6] text-white font-semibold py-2 px-6 rounded-md transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Секция Hero */}
      <div className="relative mb-16 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#24225c] to-[#b597ff] h-64 md:h-80">
          {/* Визуальные элементы */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-20">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-[#a0fff8]"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-[#76bfd4]"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/2 opacity-20">
            <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-[#ced1ff]"></div>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Предстоящие дропы</h1>
          <p className="text-xl md:text-2xl text-center max-w-2xl">
            Будьте первыми, кто получит доступ к нашим эксклюзивным лимитированным релизам
          </p>
          <div className="mt-8 w-full max-w-md">
            <NotificationForm
              onSubmit={() => {
                // setEmailNotification(email); // Не нужно, если NotificationForm обрабатывает свой собственный ввод
                handleNotificationSignup('all'); // 'all' может быть общим уведомлением о дропе
              }}
              loading={notificationLoading}
              showSuccess={showNotificationSuccess}
              buttonText="Уведомить меня"
              placeholderText="Введите ваш email для уведомлений о дропах"
              // Передайте emailNotification и setEmailNotification, если NotificationForm является управляемым компонентом
              // email={emailNotification}
              // onEmailChange={setEmailNotification}
            />
          </div>
        </div>
      </div>

      {upcomingDrops.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-b from-[#ced1ff]/20 to-white rounded-xl">
          <div className="mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-[#76bfd4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#24225c] mb-3">Предстоящих дропов не запланировано</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Мы работаем над захватывающими новыми релизами. Заходите позже или подпишитесь на уведомления выше.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-[#b597ff] hover:bg-[#a076ff] text-white font-semibold rounded-md transition-colors"
          >
            Посмотреть текущую коллекцию
          </Link>
        </div>
      ) : (
        <div className="space-y-16">
          {upcomingDrops.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-[#ced1ff]/30"
            >
              <div className="md:grid md:grid-cols-5 items-stretch">
                <div className="md:col-span-2 relative h-60 sm:h-72 md:h-full bg-gray-50 overflow-hidden">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <Image
                      src={product.image_urls[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover h-full w-full transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#ced1ff]/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#76bfd4]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {product.collection && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
                        Коллекция {product.collection}
                      </span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                  <div>
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#24225c]">{product.name}</h2>
                        {product.category && (
                          <p className="text-[#b597ff] mt-1 font-medium">{product.category}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#24225c]">BYN {product.price.toFixed(2)}</span>
                        {product.inventory_count > 0 && (
                          <div className="mt-1 text-sm text-[#76bfd4] font-medium">
                            Ограниченная серия · {product.inventory_count} шт.
                          </div>
                        )}
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-gray-600 mb-6 line-clamp-3">{product.description}</p>
                    )}
                  </div>

                  <div className="mt-auto">
                    <ClientOnly>
                      {() => { // Стрелочная функция здесь является дочерним рендер-пропом для ClientOnly
                        if (!product.drop_scheduled_time) return null;

                        return (
                          <div className="mb-6">
                            <div className="text-[#76bfd4] font-medium mb-2">
                              Дроп: {formatDate(product.drop_scheduled_time)}
                            </div>
                              <CountdownTimer
                              dropDate={product.drop_scheduled_time}
                              onComplete={() => window.location.reload()} // Рассмотрите менее разрушительное обновление
                            />
                          </div>
                        );
                      }}
                    </ClientOnly>

                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        className="px-5 py-2.5 bg-[#b597ff] hover:bg-[#a076ff] text-white font-medium rounded-md transition-colors flex items-center"
                        onClick={() => {
                          // Предполагается, что форма NotificationForm в секции hero - та, на которую нужно сфокусироваться
                          // Для уведомлений по конкретным товарам вам понадобится форма для каждого товара или передача product.id
                          const heroEmailInput = document.querySelector('.container > div:nth-of-type(1) input[type="email"]') as HTMLInputElement;
                          if (heroEmailInput) {
                            heroEmailInput.focus();
                            heroEmailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Установить напоминание
                      </button>
                      <Link href={`/products/${product.id}`} className="px-5 py-2.5 border border-[#76bfd4] text-[#76bfd4] hover:bg-[#76bfd4] hover:text-white font-medium rounded-md transition-colors flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Просмотреть детали
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-20 p-8 sm:p-12 rounded-xl bg-gradient-to-br from-[#24225c] to-[#404099] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Никогда не пропускайте дроп</h2>
          <p className="mb-8 text-lg opacity-90">
            Присоединяйтесь к нашему эксклюзивному кругу коллекционеров, чтобы получать ранний доступ к предстоящим дропам и лимитированным сериям.
          </p>
            <div className="max-w-md mx-auto">
            <NotificationForm
              onSubmit={() => {
                // setEmailNotification(email); // Позвольте NotificationForm управлять своим собственным состоянием
                handleNotificationSignup('newsletter'); // 'newsletter' может быть общей подпиской
              }}
              loading={notificationLoading}
              showSuccess={showNotificationSuccess}
              buttonText="Подписаться"
              placeholderText="Ваш адрес электронной почты"
              className="flex gap-2"
              // Передайте emailNotification и setEmailNotification, если NotificationForm управляется этой страницей
              // email={emailNotification}
              // onEmailChange={setEmailNotification}
            />
          </div>
        </div>
      </div>
    </div>
  );
}