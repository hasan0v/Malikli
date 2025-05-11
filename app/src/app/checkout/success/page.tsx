'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Определите более конкретный тип для позиций заказа
interface OrderItem {
  id: string; // Или product_id, в зависимости от структуры ваших данных
  quantity: number;
  product?: {
    name: string;
    price: number;
    image_urls: string[] | null;
  };
}

interface OrderConfirmation {
  orderNumber: string;
  orderDate: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingMethod: string;
  items: OrderItem[]; // Используйте конкретный тип OrderItem
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получить подтверждение заказа из sessionStorage
    const storedOrderDetails = sessionStorage.getItem('orderConfirmation');

    if (storedOrderDetails) {
      try {
        const parsedDetails = JSON.parse(storedOrderDetails) as OrderConfirmation; // Приведение к OrderConfirmation
        setOrderDetails(parsedDetails);
      } catch (error) {
        console.error('Ошибка при разборе деталей заказа:', error);
        // При желании перенаправить или показать ошибку, если разбор не удался
        // router.push('/');
      }
    } else {
      // Перенаправить на главную, если детали заказа не найдены (предотвращает прямой доступ к странице успеха)
      // Подождать немного, чтобы это не срабатывало во время начальной загрузки
      const timer = setTimeout(() => {
        // Проверить состояние orderDetails здесь, а не storedOrderDetails снова
        if (!orderDetails && !sessionStorage.getItem('orderConfirmation')) { // Двойная проверка во избежание гонки состояний
          router.push('/');
        }
      }, 1000);

      return () => clearTimeout(timer);
    }

    setLoading(false);
  }, [router, orderDetails]); // Добавили orderDetails в массив зависимостей

  // Форматировать дату в более читаемый формат
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Получить предполагаемую дату доставки на основе способа доставки
  const getEstimatedDelivery = (method: string, orderDate: string) => {
    const orderTime = new Date(orderDate);
    let daysToAdd = 0;

    switch (method) {
      case 'standard':
        daysToAdd = 5; // 3-5 рабочих дней, используем максимум
        break;
      case 'express':
        daysToAdd = 2; // 1-2 рабочих дня, используем максимум
        break;
      case 'overnight':
        daysToAdd = 1; // На следующий рабочий день
        break;
      default:
        daysToAdd = 7;
    }

    const deliveryDate = new Date(orderTime);
    let daysAdded = 0;

    while (daysAdded < daysToAdd) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      const dayOfWeek = deliveryDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Пропускать выходные (0 - воскресенье, 6 - суббота)
        daysAdded++;
      }
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };

    return deliveryDate.toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#76bfd4]"></div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#24225c] mb-4">Заказ не найден</h1>
        <p className="text-gray-600 mb-6">
          Мы не смогли найти детали вашего заказа. Пожалуйста, попробуйте разместить заказ сначала.
        </p>
        <Link href="/products" className="bg-[#76bfd4] hover:bg-[#5eabc6] text-white font-semibold py-3 px-6 rounded transition-colors duration-300">
          Просмотреть товары
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Баннер успеха */}
      <div className="mb-8 text-center">
        <div className="inline-block p-4 bg-green-100 rounded-full mb-3">
          <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#24225c] mb-2">Заказ успешно размещен!</h1>
        <p className="text-gray-600">
          Спасибо за покупку. Мы отправили подтверждение на ваш электронный адрес.
        </p>
      </div>

      {/* Информация о заказе */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-[#24225c] mb-3">Информация о заказе</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Номер заказа:</span>
                <span className="text-[#24225c] font-medium">{orderDetails.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Дата:</span>
                <span className="text-[#24225c]">{formatDate(orderDetails.orderDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Способ оплаты:</span>
                <span className="text-[#24225c]">Кредитная карта</span> {/* Предполагается, что это статично или приходит из другого места */}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Итого по заказу:</span>
                <span className="text-[#24225c] font-semibold">${orderDetails.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#24225c] mb-3">Информация о доставке</h2>
            <div className="mb-4">
              <p className="font-medium text-[#24225c]">{orderDetails.shippingAddress.name}</p>
              <p className="text-gray-600">{orderDetails.shippingAddress.address}</p>
              <p className="text-gray-600">
                {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
              </p>
              <p className="text-gray-600">{orderDetails.shippingAddress.country}</p>
            </div>
            <div className="mb-2">
              <span className="font-medium text-[#24225c]">Способ доставки:</span>
              <span className="text-gray-600 ml-1">
                {orderDetails.shippingMethod === 'standard' && 'Стандартная доставка (3-5 рабочих дней)'}
                {orderDetails.shippingMethod === 'express' && 'Экспресс-доставка (1-2 рабочих дня)'}
                {orderDetails.shippingMethod === 'overnight' && 'Доставка на следующий день (на следующий рабочий день)'}
                {orderDetails.shippingMethod !== 'standard' && orderDetails.shippingMethod !== 'express' && orderDetails.shippingMethod !== 'overnight' && 'Неизвестный способ'}
              </span>
            </div>
            <div>
              <span className="font-medium text-[#24225c]">Предполагаемая доставка:</span>
              <span className="text-gray-600 ml-1">
                {getEstimatedDelivery(orderDetails.shippingMethod, orderDetails.orderDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Позиции заказа */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#24225c] mb-6">Позиции заказа</h2>

        <div className="divide-y divide-gray-200">
          {orderDetails.items.map((item) => (
            <div key={item.id} className="py-4 flex items-start">
              <div className="relative h-20 w-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mr-4">
                {item.product?.image_urls && item.product.image_urls.length > 0 ? (
                  <Image
                    src={item.product.image_urls[0]}
                    alt={item.product?.name || 'Изображение товара'}
                    fill
                    sizes="80px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span>Нет изображения</span>
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <h3 className="text-[#24225c] font-medium">{item.product?.name || 'Неизвестный товар'}</h3>
                <p className="text-gray-500">Количество: {item.quantity}</p>
              </div>

              <div className="text-[#24225c] font-medium">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Итоги заказа */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Подытог:</span>
              <span className="text-[#24225c]">${orderDetails.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Доставка:</span>
              <span className="text-[#24225c]">${orderDetails.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Налог:</span>
              <span className="text-[#24225c]">${orderDetails.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span className="text-[#24225c]">Итого:</span>
              <span className="text-[#24225c]">${orderDetails.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Следующие действия */}
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Link href="/products" className="bg-[#b597ff] hover:bg-[#9f81ff] text-white font-semibold py-3 px-6 rounded-md transition-colors duration-300">
          Продолжить покупки
        </Link>
        <Link href="/profile" className="bg-white border border-gray-300 hover:bg-gray-50 text-[#24225c] font-semibold py-3 px-6 rounded-md transition-colors duration-300">
          Просмотреть мои заказы
        </Link>
      </div>
    </div>
  );
}