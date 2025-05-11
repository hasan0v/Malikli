// app/src/app/about-us/page.tsx
import React from 'react';

const AboutUsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">О нас</h1>
      <div className="space-y-4">
        <p>
          Наша компания стремится предложить вам лучшие товары и сервис.
        </p>
        <div className="mt-8 pt-6 border-t">
          <h2 className="text-2xl font-semibold mb-3">Информация о производителе:</h2>
          <p><strong>Производитель:</strong> ООО «МАЛИКЛИ 1992»</p>
          <p><strong>Адрес:</strong> 220005, Минск, ул. Веры Хоружей, 6А, пом. 94И</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;

