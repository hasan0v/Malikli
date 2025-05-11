// app/src/app/payment-options/page.tsx
import React from 'react';

const PaymentOptionsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Оплата товара</h1>
      <div className="space-y-4">
        <p>Мы принимаем следующие способы оплаты:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Банковские карты (Visa, Mastercard, БЕЛКАРТ)</li>
          <li>Наличными</li>
          <li>Наложенный платеж («Белпочта»)</li>
        </ul>
        {/* Existing content can be kept below if any, or integrated above */}
      </div>
    </div>
  );
};

export default PaymentOptionsPage;

