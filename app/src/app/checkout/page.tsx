'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface CheckoutFormData {
  // Информация о доставке
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  shippingMethod: 'standard' | 'express' | 'overnight';

  // Платежная информация
  paymentMethod: 'credit' | 'paypal';
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  billingAddressSame: boolean;

  // Адрес для выставления счета (если отличается)
  billingFirstName: string;
  billingLastName: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
  billingCountry: string;

  // Условия
  agreeToTerms: boolean;
}

// Расчет стоимости доставки
const SHIPPING_COSTS: Record<'standard' | 'express' | 'overnight', number> = {
  standard: 7.99,
  express: 14.99,
  overnight: 19.99
};

// Пороги для бесплатной доставки
const FREE_SHIPPING_THRESHOLDS: Partial<Record<'standard' | 'express' | 'overnight', number>> = {
  standard: 75,
  express: 150
  // доставка на следующий день никогда не бывает бесплатной
};

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { profile } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Состояние формы
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: profile?.name?.split(' ')[0] || '',
    lastName: profile?.name?.split(' ')[1] || '',
    email: profile?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States', // США по умолчанию
    shippingMethod: 'standard',

    paymentMethod: 'credit',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    billingAddressSame: true,

    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'United States', // США по умолчанию

    agreeToTerms: false
  });

  // Если корзина пуста, перенаправить на страницу корзины
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems, router]);

  // Обработка изменений ввода в форме
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Очистить любую ошибку для этого поля
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  // Расчет стоимости доставки на основе метода и общей суммы корзины
  const calculateShippingCost = () => {
    const method = formData.shippingMethod;
    const threshold = FREE_SHIPPING_THRESHOLDS[method];
    if (threshold !== undefined && cartTotal >= threshold) {
      return 0; // Бесплатная доставка
    }
    return SHIPPING_COSTS[method];
  };

  // Расчет предполагаемого налога (упрощенно как 8.25% от общей суммы корзины)
  const calculateTax = () => {
    return cartTotal * 0.0825;
  };

  // Расчет общей суммы заказа
  const calculateTotal = () => {
    return cartTotal + calculateShippingCost() + calculateTax();
  };

  // Валидация текущего шага формы
  const validateStep = (step: 'shipping' | 'payment' | 'review'): boolean => {
    const errors: Record<string, string> = {};

    if (step === 'shipping') {
      if (!formData.firstName) errors.firstName = 'Имя обязательно для заполнения';
      if (!formData.lastName) errors.lastName = 'Фамилия обязательна для заполнения';
      if (!formData.email) errors.email = 'Email обязателен для заполнения';
      if (!formData.phone) errors.phone = 'Номер телефона обязателен для заполнения';
      if (!formData.address) errors.address = 'Адрес обязателен для заполнения';
      if (!formData.city) errors.city = 'Город обязателен для заполнения';
      if (!formData.state) errors.state = 'Штат/Регион обязателен для заполнения';
      if (!formData.zipCode) errors.zipCode = 'Почтовый индекс обязателен для заполнения';
      if (!formData.country) errors.country = 'Страна обязательна для заполнения';
    }

    if (step === 'payment') {
      if (formData.paymentMethod === 'credit') {
        if (!formData.cardName) errors.cardName = 'Имя на карте обязательно для заполнения';
        if (!formData.cardNumber) errors.cardNumber = 'Номер карты обязателен для заполнения';
        if (!formData.cardExpiry) errors.cardExpiry = 'Срок действия обязателен для заполнения';
        if (!formData.cardCvc) errors.cardCvc = 'CVC код обязателен для заполнения';
      }

      if (!formData.billingAddressSame) {
        if (!formData.billingFirstName) errors.billingFirstName = 'Имя (для счета) обязательно для заполнения';
        if (!formData.billingLastName) errors.billingLastName = 'Фамилия (для счета) обязательна для заполнения';
        if (!formData.billingAddress) errors.billingAddress = 'Адрес (для счета) обязателен для заполнения';
        if (!formData.billingCity) errors.billingCity = 'Город (для счета) обязателен для заполнения';
        if (!formData.billingState) errors.billingState = 'Штат/Регион (для счета) обязателен для заполнения';
        if (!formData.billingZipCode) errors.billingZipCode = 'Почтовый индекс (для счета) обязателен для заполнения';
        if (!formData.billingCountry) errors.billingCountry = 'Страна (для счета) обязательна для заполнения';
      }
    }

    if (step === 'review') {
      if (!formData.agreeToTerms) errors.agreeToTerms = 'Вы должны согласиться с условиями и положениями';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Переход к следующему шагу оформления заказа
  const handleNextStep = () => {
    if (currentStep === 'shipping') {
      if (validateStep('shipping')) setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      if (validateStep('payment')) setCurrentStep('review');
    }
  };

  // Вернуться к предыдущему шагу
  const handlePreviousStep = () => {
    if (currentStep === 'payment') setCurrentStep('shipping');
    if (currentStep === 'review') setCurrentStep('payment');
  };

  // Отправка заказа
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep('review')) return;

    setIsSubmitting(true);

    try {
      // Здесь должна быть интеграция с платежным процессором, например Stripe
      // Пока что мы просто симулируем успешный заказ
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Генерация случайного номера заказа
      const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();

      // Сохранение деталей подтверждения заказа в sessionStorage для страницы успеха
      sessionStorage.setItem('orderConfirmation', JSON.stringify({
        orderNumber,
        orderDate: new Date().toISOString(),
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        shippingMethod: formData.shippingMethod,
        items: cartItems,
        subtotal: cartTotal,
        shipping: calculateShippingCost(),
        tax: calculateTax(),
        total: calculateTotal()
      }));

      // Очистка корзины после успешного оформления заказа
      clearCart();

      // Перенаправление на страницу подтверждения заказа
      router.push('/checkout/success');
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      alert('Во время оформления заказа произошла ошибка. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Индикатор прогресса
  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep === 'shipping' || currentStep === 'payment' || currentStep === 'review'
              ? 'bg-[#76bfd4] text-white'
              : 'bg-[#ced1ff] text-gray-500'
          }`}>
            1
          </div>
          <span className="text-xs mt-1 text-[#24225c]">Доставка</span>
        </div>
        <div className={`h-1 w-16 ${
          currentStep === 'payment' || currentStep === 'review' ? 'bg-[#76bfd4]' : 'bg-[#ced1ff]'
        }`}></div>
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep === 'payment' || currentStep === 'review'
              ? 'bg-[#76bfd4] text-white'
              : 'bg-[#ced1ff] text-gray-500'
          }`}>
            2
          </div>
          <span className="text-xs mt-1 text-[#24225c]">Оплата</span>
        </div>
        <div className={`h-1 w-16 ${
          currentStep === 'review' ? 'bg-[#76bfd4]' : 'bg-[#ced1ff]'
        }`}></div>
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep === 'review'
              ? 'bg-[#76bfd4] text-white'
              : 'bg-[#ced1ff] text-gray-500'
          }`}>
            3
          </div>
          <span className="text-xs mt-1 text-[#24225c]">Обзор</span>
        </div>
      </div>
    </div>
  );

  // Компонент сводки заказа
  const OrderSummary = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-[#24225c] mb-4">Сводка заказа</h3>

      {/* Количество товаров */}
      <div className="text-sm text-gray-600 mb-6">
        {cartItems.length} {cartItems.length === 1 ? 'товар' : (cartItems.length > 1 && cartItems.length < 5 ? 'товара' : 'товаров')} в вашей корзине
      </div>

      {/* Краткий список товаров (ограничение до 3 с "и еще X") */}
      <div className="mb-6 space-y-4">
        {cartItems.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center">
            <div className="relative h-12 w-12 rounded bg-gray-100 mr-3 overflow-hidden">
              {item.product?.image_urls && item.product.image_urls.length > 0 ? (
                <Image
                  src={item.product.image_urls[0]}
                  alt={item.product?.name || 'Изображение товара'}
                  fill
                  sizes="48px"
                  style={{ objectFit: 'cover' }}
                />
              ) : null}
            </div>
            <div className="flex-grow">
              <div className="text-sm text-[#24225c] truncate">{item.product?.name}</div>
              <div className="text-xs text-gray-500">Кол-во: {item.quantity}</div>
            </div>
            <div className="text-sm font-medium text-[#24225c]">
              ${((item.product?.price || 0) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
        {cartItems.length > 3 && (
          <div className="text-sm text-[#b597ff]">
            и еще {cartItems.length - 3} {cartItems.length - 3 === 1 ? 'товар' : (cartItems.length - 3 > 1 && cartItems.length - 3 < 5 ? 'товара' : 'товаров')}
          </div>
        )}
      </div>

      {/* Разбивка стоимости */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Подытог</span>
          <span className="text-[#24225c]">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Доставка</span>
          {currentStep === 'shipping' ? (
            <span className="text-gray-600">Рассчитается далее</span>
          ) : (
            <span className="text-[#24225c]">BYN {calculateShippingCost().toFixed(2)}</span>
          )}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Предполагаемый налог</span>
          {currentStep === 'shipping' ? (
            <span className="text-gray-600">Рассчитается далее</span>
          ) : (
            <span className="text-[#24225c]">BYN {calculateTax().toFixed(2)}</span>
          )}
        </div>
      </div>

      {/* Итого */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="flex justify-between">
          <span className="font-semibold text-[#24225c]">Итого</span>
          <span className="font-semibold text-[#24225c]">
            {currentStep === 'shipping'
              ? `BYN ${cartTotal.toFixed(2)}`
              : `BYN ${calculateTotal().toFixed(2)}`
            }
          </span>
        </div>
      </div>

      {/* Ссылка "Назад в корзину" */}
      <div className="mt-6">
        <Link href="/cart" className="text-sm text-[#76bfd4] hover:underline inline-flex items-center">
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Назад в корзину
        </Link>
      </div>
    </div>
  );

  // Форма шага доставки
  const renderShippingForm = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-[#24225c] mb-6">Информация о доставке</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        {/* Имя */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">Имя*</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
        </div>

        {/* Фамилия */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">Фамилия*</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">Email*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
        </div>

        {/* Телефон */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">Телефон*</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
        </div>

        {/* Адрес */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#24225c] mb-1">Адрес*</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
        </div>

        {/* Город */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">Город*</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
        </div>

        {/* Штат/Регион */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">Штат/Регион*</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.state ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
        </div>

        {/* Почтовый индекс */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">Почтовый индекс*</label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          />
          {formErrors.zipCode && <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>}
        </div>

        {/* Страна */}
        <div>
          <label className="block text-sm font-medium text-[#24225c] mb-1">Страна*</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className={`w-full border ${formErrors.country ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
          >
            <option value="Belarussia">Беларусь</option>
            <option value="Russia">Россия</option>
            <option value="Azerbaijan">Азербайджан</option>
            <option value="United States">США</option>
            <option value="Canada">Канада</option>
            <option value="United Kingdom">Великобритания</option>
            <option value="Australia">Австралия</option>
            <option value="Germany">Германия</option>
            <option value="France">Франция</option>
            {/* Добавьте другие страны по мере необходимости */}
          </select>
          {formErrors.country && <p className="text-red-500 text-xs mt-1">{formErrors.country}</p>}
        </div>
      </div>

      {/* Способы доставки */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-[#24225c] mb-4">Способ доставки</h3>

        <div className="space-y-3">
          {/* Стандартная доставка */}
          <label className={`block border rounded-md p-4 cursor-pointer ${
            formData.shippingMethod === 'standard' ? 'border-[#76bfd4] bg-[#a0fff8] bg-opacity-10' : 'border-gray-300'
          }`}>
            <input
              type="radio"
              name="shippingMethod"
              value="standard"
              checked={formData.shippingMethod === 'standard'}
              onChange={handleInputChange}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-medium text-[#24225c]">Стандартная доставка</span>
                <span className="text-sm text-gray-600">3-5 рабочих дней</span>
              </div>              <div>
                {FREE_SHIPPING_THRESHOLDS.standard && cartTotal >= FREE_SHIPPING_THRESHOLDS.standard ? (
                  <span className="text-green-500 font-medium">БЕСПЛАТНО</span>
                ) : (
                  <span className="font-medium text-[#24225c]">BYN {SHIPPING_COSTS.standard.toFixed(2)}</span>
                )}
              </div>
            </div>
          </label>

          {/* Экспресс-доставка */}
          <label className={`block border rounded-md p-4 cursor-pointer ${
            formData.shippingMethod === 'express' ? 'border-[#76bfd4] bg-[#a0fff8] bg-opacity-10' : 'border-gray-300'
          }`}>
            <input
              type="radio"
              name="shippingMethod"
              value="express"
              checked={formData.shippingMethod === 'express'}
              onChange={handleInputChange}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-medium text-[#24225c]">Экспресс-доставка</span>
                <span className="text-sm text-gray-600">1-2 рабочих дня</span>
              </div>              <div>
                {FREE_SHIPPING_THRESHOLDS.express && cartTotal >= FREE_SHIPPING_THRESHOLDS.express ? (
                  <span className="text-green-500 font-medium">БЕСПЛАТНО</span>
                ) : (
                  <span className="font-medium text-[#24225c]">BYN {SHIPPING_COSTS.express.toFixed(2)}</span>
                )}
              </div>
            </div>
          </label>

          {/* Доставка на следующий день */}
          <label className={`block border rounded-md p-4 cursor-pointer ${
            formData.shippingMethod === 'overnight' ? 'border-[#76bfd4] bg-[#a0fff8] bg-opacity-10' : 'border-gray-300'
          }`}>
            <input
              type="radio"
              name="shippingMethod"
              value="overnight"
              checked={formData.shippingMethod === 'overnight'}
              onChange={handleInputChange}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-medium text-[#24225c]">Доставка на следующий день</span>
                <span className="text-sm text-gray-600">На следующий рабочий день</span>
              </div>
              <div>
                <span className="font-medium text-[#24225c]">BYN {SHIPPING_COSTS.overnight.toFixed(2)}</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Кнопка "Продолжить" */}
      <div className="mt-8">
        <button
          type="button"
          onClick={handleNextStep}
          className="w-full bg-[#b597ff] hover:bg-[#9f81ff] text-white font-semibold py-3 px-4 rounded transition-colors duration-300"
        >
          Перейти к оплате
        </button>
      </div>
    </div>
  );

  // Форма шага оплаты
  const renderPaymentForm = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-[#24225c] mb-6">Платежная информация</h2>

      {/* Выбор способа оплаты */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[#24225c] mb-3">Способ оплаты</h3>

        <div className="space-y-3">
          {/* Кредитная карта */}
          <label className={`block border rounded-md p-4 cursor-pointer ${
            formData.paymentMethod === 'credit' ? 'border-[#76bfd4] bg-[#a0fff8] bg-opacity-10' : 'border-gray-300'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="credit"
              checked={formData.paymentMethod === 'credit'}
              onChange={handleInputChange}
              className="sr-only"
            />
            <div className="flex items-center">
              <div className="flex-grow">
                <span className="block font-medium text-[#24225c]">Кредитная / Дебетовая карта</span>
                <span className="text-sm text-gray-600">Visa, Mastercard, Amex, Discover</span>
              </div>
              <div className="flex space-x-2">
                {/* Иконки карт можно заменить на настоящие SVG или изображения */}
                <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">Visa</div>
                <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">MC</div>
                <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">Amex</div>
              </div>
            </div>
          </label>

          {/* PayPal */}
          <label className={`block border rounded-md p-4 cursor-pointer ${
            formData.paymentMethod === 'paypal' ? 'border-[#76bfd4] bg-[#a0fff8] bg-opacity-10' : 'border-gray-300'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={formData.paymentMethod === 'paypal'}
              onChange={handleInputChange}
              className="sr-only"
            />
            <div className="flex items-center">
              <div className="flex-grow">
                <span className="block font-medium text-[#24225c]">PayPal</span>
                <span className="text-sm text-gray-600">Оплатить через ваш аккаунт PayPal</span>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">PayPal</div>
            </div>
          </label>
        </div>
      </div>

      {/* Детали кредитной карты (отображаются, только если выбрана кредитная карта) */}
      {formData.paymentMethod === 'credit' && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-[#24225c] mb-3">Данные карты</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            {/* Имя на карте */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Имя на карте*</label>
              <input
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.cardName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.cardName && <p className="text-red-500 text-xs mt-1">{formErrors.cardName}</p>}
            </div>

            {/* Номер карты */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Номер карты*</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className={`w-full border ${formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>}
            </div>

            {/* Срок действия */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">Срок действия*</label>
              <input
                type="text"
                name="cardExpiry"
                value={formData.cardExpiry}
                onChange={handleInputChange}
                placeholder="ММ/ГГ"
                className={`w-full border ${formErrors.cardExpiry ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.cardExpiry && <p className="text-red-500 text-xs mt-1">{formErrors.cardExpiry}</p>}
            </div>

            {/* CVC */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">CVC*</label>
              <input
                type="text"
                name="cardCvc"
                value={formData.cardCvc}
                onChange={handleInputChange}
                placeholder="123"
                className={`w-full border ${formErrors.cardCvc ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.cardCvc && <p className="text-red-500 text-xs mt-1">{formErrors.cardCvc}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Адрес для выставления счета (с опцией использования адреса доставки) */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            name="billingAddressSame"
            id="billingAddressSame"
            checked={formData.billingAddressSame}
            onChange={handleInputChange}
            className="h-4 w-4 text-[#76bfd4] border-gray-300 rounded focus:ring-[#76bfd4]"
          />
          <label htmlFor="billingAddressSame" className="ml-2 text-sm font-medium text-[#24225c]">
            Адрес для выставления счета совпадает с адресом доставки
          </label>
        </div>

        {/* Отображение формы адреса для выставления счета, если флажок снят */}
        {!formData.billingAddressSame && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            {/* Имя (для счета) */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">Имя*</label>
              <input
                type="text"
                name="billingFirstName"
                value={formData.billingFirstName}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingFirstName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.billingFirstName && <p className="text-red-500 text-xs mt-1">{formErrors.billingFirstName}</p>}
            </div>

            {/* Фамилия (для счета) */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">Фамилия*</label>
              <input
                type="text"
                name="billingLastName"
                value={formData.billingLastName}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingLastName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.billingLastName && <p className="text-red-500 text-xs mt-1">{formErrors.billingLastName}</p>}
            </div>

            {/* Адрес (для счета) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#24225c] mb-1">Адрес*</label>
              <input
                type="text"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingAddress ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.billingAddress && <p className="text-red-500 text-xs mt-1">{formErrors.billingAddress}</p>}
            </div>

            {/* Город (для счета) */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">Город*</label>
              <input
                type="text"
                name="billingCity"
                value={formData.billingCity}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingCity ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.billingCity && <p className="text-red-500 text-xs mt-1">{formErrors.billingCity}</p>}
            </div>

            {/* Штат/Регион (для счета) */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">Штат/Регион*</label>
              <input
                type="text"
                name="billingState"
                value={formData.billingState}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingState ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.billingState && <p className="text-red-500 text-xs mt-1">{formErrors.billingState}</p>}
            </div>

            {/* Почтовый индекс (для счета) */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">Почтовый индекс*</label>
              <input
                type="text"
                name="billingZipCode"
                value={formData.billingZipCode}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingZipCode ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              />
              {formErrors.billingZipCode && <p className="text-red-500 text-xs mt-1">{formErrors.billingZipCode}</p>}
            </div>

            {/* Страна (для счета) */}
            <div>
              <label className="block text-sm font-medium text-[#24225c] mb-1">Страна*</label>
              <select
                name="billingCountry"
                value={formData.billingCountry}
                onChange={handleInputChange}
                className={`w-full border ${formErrors.billingCountry ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#76bfd4]`}
              >
                <option value="Belarussia">Беларусь</option>
                <option value="Russia">Россия</option>
                <option value="Azerbaijan">Азербайджан</option>
                <option value="United States">США</option>
                <option value="Canada">Канада</option>
                <option value="United Kingdom">Великобритания</option>
                <option value="Australia">Австралия</option>
                <option value="Germany">Германия</option>
                <option value="France">Франция</option>
                {/* Добавьте другие страны по мере необходимости */}
              </select>
              {formErrors.billingCountry && <p className="text-red-500 text-xs mt-1">{formErrors.billingCountry}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Кнопки навигации */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="w-full bg-gray-200 hover:bg-gray-300 text-[#24225c] font-semibold py-3 px-4 rounded transition-colors duration-300"
        >
          Назад
        </button>

        <button
          type="button"
          onClick={handleNextStep}
          className="w-full bg-[#b597ff] hover:bg-[#9f81ff] text-white font-semibold py-3 px-4 rounded transition-colors duration-300"
        >
          Перейти к обзору
        </button>
      </div>
    </div>
  );

  // Шаг обзора
  const renderReviewForm = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-[#24225c] mb-6">Обзор заказа</h2>

      {/* Сводка информации о доставке */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-[#24225c]">Информация о доставке</h3>
          <button
            onClick={() => setCurrentStep('shipping')}
            className="text-sm text-[#76bfd4] hover:underline"
          >
            Изменить
          </button>
        </div>

        <div className="bg-gray-50 rounded-md p-4">
          <p className="font-medium text-[#24225c]">{formData.firstName} {formData.lastName}</p>
          <p className="text-gray-700">{formData.address}</p>
          <p className="text-gray-700">
            {formData.city}, {formData.state} {formData.zipCode}
          </p>
          <p className="text-gray-700">{formData.country}</p>
          <p className="text-gray-700">{formData.email}</p>
          <p className="text-gray-700">{formData.phone}</p>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="font-medium text-[#24225c]">
              {formData.shippingMethod === 'standard' && 'Стандартная доставка (3-5 рабочих дней)'}
              {formData.shippingMethod === 'express' && 'Экспресс-доставка (1-2 рабочих дня)'}
              {formData.shippingMethod === 'overnight' && 'Доставка на следующий день (На следующий рабочий день)'}
            </p>
          </div>
        </div>
      </div>

      {/* Сводка платежной информации */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-[#24225c]">Платежная информация</h3>
          <button
            onClick={() => setCurrentStep('payment')}
            className="text-sm text-[#76bfd4] hover:underline"
          >
            Изменить
          </button>
        </div>

        <div className="bg-gray-50 rounded-md p-4">
          {formData.paymentMethod === 'credit' ? (
            <div>
              <p className="font-medium text-[#24225c]">Кредитная карта</p>
              <p className="text-gray-700">
                {formData.cardNumber
                  ? `**** **** **** ${formData.cardNumber.slice(-4)}`
                  : 'Номер карты не указан'}
              </p>
              <p className="text-gray-700">
                {formData.cardName || 'Имя владельца карты не указано'}
              </p>
            </div>
          ) : (
            <p className="font-medium text-[#24225c]">PayPal</p>
          )}

          {/* Адрес для выставления счета */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="font-medium text-[#24225c] mb-1">Адрес для выставления счета</p>

            {formData.billingAddressSame ? (
              <p className="text-gray-700">Совпадает с адресом доставки</p>
            ) : (
              <>
                <p className="text-gray-700">
                  {formData.billingFirstName} {formData.billingLastName}
                </p>
                <p className="text-gray-700">{formData.billingAddress}</p>
                <p className="text-gray-700">
                  {formData.billingCity}, {formData.billingState} {formData.billingZipCode}
                </p>
                <p className="text-gray-700">{formData.billingCountry}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Позиции заказа */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[#24225c] mb-3">Позиции заказа</h3>

        <div className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <div key={item.id} className="py-3 flex items-center">
              <div className="relative h-16 w-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-4">
                {item.product?.image_urls && item.product.image_urls.length > 0 ? (
                  <Image
                    src={item.product.image_urls[0]}
                    alt={item.product?.name || 'Изображение товара'}
                    fill
                    sizes="64px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : null}
              </div>
              <div className="flex-grow">
                <p className="text-base font-medium text-[#24225c]">{item.product?.name || 'Неизвестный товар'}</p>
                <p className="text-sm text-gray-600">Кол-во: {item.quantity}</p>
              </div>
              <div className="text-sm font-medium text-[#24225c]">
                BYN {((item.product?.price || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Сводка цен */}
      <div className="mb-6 bg-gray-50 rounded-md p-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Подытог</span>
            <span className="text-[#24225c]">BYN {cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Доставка</span>
            <span className="text-[#24225c]">BYN {calculateShippingCost().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Предполагаемый налог</span>
            <span className="text-[#24225c]">BYN {calculateTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-3 border-t border-gray-200">
            <span className="text-[#24225c]">Итого</span>
            <span className="text-[#24225c]">BYN {calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Условия и положения */}
      <div className="mb-6">
        <div className="flex items-start">
          <input
            type="checkbox"
            name="agreeToTerms"
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="h-4 w-4 mt-1 text-[#76bfd4] border-gray-300 rounded focus:ring-[#76bfd4]"
          />
          <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
            Я согласен с <a href="#" className="text-[#76bfd4] hover:underline">Условиями и положениями</a> и <a href="#" className="text-[#76bfd4] hover:underline">Политикой конфиденциальности</a>
          </label>
        </div>
        {formErrors.agreeToTerms && <p className="text-red-500 text-xs mt-1">{formErrors.agreeToTerms}</p>}
      </div>

      {/* Кнопки навигации */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="w-full bg-gray-200 hover:bg-gray-300 text-[#24225c] font-semibold py-3 px-4 rounded transition-colors duration-300"
        >
          Назад
        </button>

        <button
          type="submit"
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className={`w-full font-semibold py-3 px-4 rounded text-white ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#b597ff] hover:bg-[#9f81ff] transition-colors duration-300'
          }`}
        >
          {isSubmitting ? 'Обработка...' : 'Разместить заказ'}
        </button>
      </div>

    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#24225c] mb-6">Оформление заказа</h1>

      <ProgressIndicator />

      <form className="grid md:grid-cols-3 gap-8">
        {/* Основное содержимое (меняется в зависимости от шага) */}
        <div className="md:col-span-2">
          {currentStep === 'shipping' && renderShippingForm()}
          {currentStep === 'payment' && renderPaymentForm()}
          {currentStep === 'review' && renderReviewForm()}
        </div>

        {/* Сводка заказа (фиксированная) */}
        <div className="md:col-span-1">
          <OrderSummary />
        </div>
      </form>
    </div>
  );
}