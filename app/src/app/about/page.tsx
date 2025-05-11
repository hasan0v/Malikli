'use client';

import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#24225c] mb-3">О MALIKLI1992</h1>
        <p className="text-lg text-gray-600">Эксклюзивные дропы, лимитированные серии и уникальные дизайны</p>
      </div>

      {/* Brand Story */}
      <div className="mb-16 bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-[#76bfd4] mb-6">Наша история</h2>
        <div className="prose prose-lg max-w-none text-[#24225c]">
          <p>
            Основанный в 2025 году, MALIKLI1992 появился из страсти к уникальному дизайну и лимитированным продуктам.
            Наш основатель, вдохновлённый пересечением искусства, моды и технологий, создал платформу,
            где покупатели могут находить эксклюзивные товары, доступные только на ограниченное время.
          </p>
          <p>
            Нас отличает модель дропов — тщательно подобранные товары выпускаются небольшими партиями
            в заранее назначенное время. Каждый дроп отражает нашу приверженность качеству, уникальности и креативности.
          </p>
          <p>
            Мы сотрудничаем с дизайнерами, художниками и создателями со всего мира, чтобы предложить вам
            продукты, которые вы не найдете больше нигде. Каждый товар рассказывает историю и отражает
            нашу преданность идее предложить нечто действительно особенное.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-[#b597ff] mb-4">Наша миссия</h2>
          <p className="text-[#24225c]">
            Создать сообщество энтузиастов, ценящих лимитированные товары, уникальные дизайны и азарт
            от получения эксклюзивных дропов до того, как они исчезнут. Мы верим в качество, а не количество,
            эксклюзивность, а не массовое производство, и в эмоциональную связь между людьми и любимыми вещами.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-[#b597ff] mb-4">Наше видение</h2>
          <p className="text-[#24225c]">
            Стать ведущей платформой для лимитированных товаров, которые выходят за рамки традиционного дизайна
            и креативности, формируя при этом страстное сообщество вокруг наших дропов. Мы видим мир, где каждая покупка — это событие,
            а каждый клиент чувствует себя частью чего-то особенного.
          </p>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-[#ced1ff] bg-opacity-20 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-semibold text-[#24225c] mb-8 text-center">Наши ценности</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-full mb-4 shadow-sm">
              <svg className="w-10 h-10 text-[#76bfd4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#24225c] mb-2">Эксклюзивность</h3>
            <p className="text-[#24225c]">Мы создаем товары в ограниченном количестве, чтобы сохранить их уникальность и ценность.</p>
          </div>

          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-full mb-4 shadow-sm">
              <svg className="w-10 h-10 text-[#76bfd4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#24225c] mb-2">Качество</h3>
            <p className="text-[#24225c]">Мы не идем на компромиссы в материалах, мастерстве или внимании к деталям.</p>
          </div>

          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-full mb-4 shadow-sm">
              <svg className="w-10 h-10 text-[#76bfd4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#24225c] mb-2">Сообщество</h3>
            <p className="text-[#24225c]">Мы развиваем страстное сообщество единомышленников, которые разделяют нашу любовь к уникальным вещам.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
