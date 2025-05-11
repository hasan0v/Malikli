'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface FAQ {
  question: string;
  answer: string;
}

export default function DeliveryPage() {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const faqs: FAQ[] = [
    {
      question: "Как долго осуществляется доставка?",
      answer: "Доставка по Беларуси почтой занимает в среднем от двух до пяти рабочих дней."
    },
    {
      question: "Можно ли изменить адрес доставки после оформления заказа?",
      answer: "Да, если заказ ещё не был отправлен. Пожалуйста, свяжитесь с нашей службой поддержки как можно скорее."
    },
    {
      question: "Как отследить мой заказ?",
      answer: "После отправки вы получите письмо с номером отслеживания. Вы также можете отследить заказ через личный кабинет."
    },
    {
      question: "Что делать, если посылка утеряна или повреждена?",
      answer: "Свяжитесь с нашей службой поддержки в течение 48 часов. Мы оперативно решим проблему с перевозчиком."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#24225c] mb-3">Информация о доставке</h1>
        <p className="text-lg text-gray-600">Условия и сроки доставки по Беларуси</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm mb-10">
        <h2 className="text-2xl font-semibold text-[#76bfd4] mb-6">Способы доставки</h2>
        <p className="text-[#24225c] mb-4">
          Доставка осуществляется по всей территории Республики Беларусь.
          Средний срок доставки почтой составляет от двух до пяти рабочих дней.
        </p>
        <p className="text-[#24225c]">
          Стоимость доставки определяется в соответствии с тарифами РУП «Белпочта».
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm mb-10">
        <h2 className="text-2xl font-semibold text-[#76bfd4] mb-6">Часто задаваемые вопросы</h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button 
                className="flex justify-between items-center w-full px-6 py-4 text-left font-medium text-[#24225c] hover:bg-gray-50 focus:outline-none"
                onClick={() => toggleQuestion(index)}
              >
                <span>{faq.question}</span>
                <svg 
                  className={`w-5 h-5 transition-transform ${activeQuestion === index ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeQuestion === index && (
                <div className="px-6 pb-4 text-[#24225c]">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#24225c] to-[#b597ff] rounded-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Нужна помощь?</h2>
        <p className="mb-6">
          Наша служба поддержки всегда готова ответить на ваши вопросы о доставке.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="#" className="bg-white text-[#24225c] font-semibold px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors duration-300">
            Связаться с поддержкой
          </Link>
          <Link href="#" className="border border-white text-white font-semibold px-6 py-3 rounded-md hover:bg-white hover:text-[#24225c] transition-colors duration-300">
            Онлайн-чат
          </Link>
        </div>
      </div>
    </div>
  );
}
