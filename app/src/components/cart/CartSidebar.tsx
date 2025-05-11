'use client';

import React, { useState, useEffect,  } from 'react'; // useCallback
import { useCart,  } from '@/context/CartContext'; // Импортируйте типы CartContextType, CartItem
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Вспомогательная функция для получения сообщений об ошибках
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'Произошла неизвестная ошибка.';
};

const CartSidebar = () => {
  const router = useRouter();

  // Вызовите useCart на верхнем уровне
  // Это вызовет ошибку, если CartProvider не является предком.
  // Мы будем обрабатывать UI на основе isLoading и cartItems из контекста.
  const cartContext = useCart();

  // Деструктурируйте напрямую из cartContext, если гарантировано, что он определен,
  // так как useCart вызовет ошибку.
  // Если useCart может возвращать undefined или другую структуру, скорректируйте соответственно.
  const {
    isCartOpen,
    cartItems,
    cartTotal,
    isLoading: contextIsLoading,
    closeCart,
    removeFromCart,
    updateQuantity
  } = cartContext;

  const [componentError, setComponentError] = useState<string | null>(null);

  // Этот эффект в основном предназначен для перехвата ошибок, если сам контекст не предоставляет функции,
  // или если операция в боковой панели, зависящая от контекста, вызывает ошибку.
  // Большинство состояний загрузки данных (isLoading, cartItems) должны поступать непосредственно из контекста.
  useEffect(() => {
    // Пример: если cartContext не найден, useCart вызовет ошибку.
    // Этот компонент не будет отображаться дальше, если это произойдет.
    // Если useCart мог бы возвращать null/undefined, вы бы проверяли здесь:
    // if (!cartContext) {
    //   setComponentError('Не удалось загрузить контекст корзины.');
    //   return;
    // }
    // setComponentError(null); // Очистить предыдущие ошибки, если контекст теперь в порядке

    // Индивидуальные обновления состояния больше не нужны, так как мы используем значения контекста напрямую.
  }, [cartContext]); // Переоценивать, если сам объект cartContext изменяется (редко)


  const handleCheckout = () => {
    if (closeCart) {
      closeCart();
    }
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    if (closeCart) {
      closeCart();
    }
    router.push('/');
  };

  // Отображение ошибки из логики этого компонента или контекста (если у контекста есть свойство error)
  if (componentError && !isCartOpen) {
    console.error("Ошибка боковой панели корзины:", componentError);
    return null;
  }

  if (!isCartOpen) return null;

  return (
    <>
      {/* Фон */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Боковая панель */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col">
        {/* Заголовок */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Корзина</h2>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Закрыть корзину"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Содержимое корзины */}
        <div className="flex-1 overflow-y-auto p-4">
          {componentError && (
            <div className="text-center py-4 text-red-600 bg-red-100 border border-red-400 rounded p-2 mb-4">
              Ошибка: {componentError}
            </div>
          )}
          {contextIsLoading ? (
            <div className="flex justify-center items-center h-32">
              <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <p className="text-gray-500">Ваша корзина пуста.</p>
              <button
                onClick={handleContinueShopping}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Продолжить покупки
              </button>
            </div>
          ) : (
            <ul role="list" className="-my-6 divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id || item.product_id} className="flex py-6">                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    {item.product?.image_urls?.[0] ? (
                      <Image
                        src={item.product.image_urls[0]}
                        alt={item.product.name || 'Изображение товара'}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                        Нет изображения
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.product?.name || 'Неизвестный товар'}</h3>
                        <p className="ml-4">BYN {((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center">
                        <label htmlFor={`quantity-${item.id}`} className="sr-only">Количество</label>
                        <select
                          id={`quantity-${item.id}`}
                          name={`quantity-${item.id}`}
                          value={item.quantity}
                          onChange={(e) => {
                            if (updateQuantity) {
                              updateQuantity(item.product_id, parseInt(e.target.value))
                                .catch(err => {
                                  const message = getErrorMessage(err);
                                  console.error("Ошибка при обновлении количества:", message);
                                  setComponentError(`Не удалось обновить количество: ${message}`);
                                });
                            }
                          }}
                          className="h-8 w-16 border-gray-300 rounded text-base focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {[...Array(10).keys()].map(n => ( // Рассмотрите использование item.product.inventory_count для максимума
                            <option key={n + 1} value={n + 1}>{n + 1}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => {
                            if (removeFromCart) {
                              removeFromCart(item.product_id)
                                .catch(err => {
                                  const message = getErrorMessage(err);
                                  console.error("Ошибка при удалении товара:", message);
                                  setComponentError(`Не удалось удалить товар: ${message}`);
                                });
                            }
                          }}
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Подвал */}
        {!contextIsLoading && cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Подытог</p>
              <p>BYN {cartTotal.toFixed(2)}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">Доставка и налоги рассчитываются при оформлении заказа.</p>
            <div className="mt-6">
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Оформить заказ
              </button>
            </div>
            <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
              <p>
                или{' '}
                <button
                  type="button"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={handleContinueShopping}
                >
                  Продолжить покупки<span aria-hidden="true"> →</span>
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;