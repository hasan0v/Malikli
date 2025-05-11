// app/src/app/delivery-information/page.tsx
import React from 'react';

const DeliveryInformationPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Доставка</h1>
      <div className="space-y-4">
        <p>
          Доставка товара осуществляется по территории Республики Беларусь.
        </p>
        <p>
          Доставка почтой занимает в среднем от двух до пяти рабочих дней.
        </p>
        <p>
          Стоимость доставки почты в соответствии с тарифами РУП «Белпочта».
        </p>
        {/* Existing content can be kept below if any, or integrated above */}
      </div>
    </div>
  );
};

export default DeliveryInformationPage;
