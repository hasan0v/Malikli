// app/src/app/returns-exchanges/page.tsx
import React from 'react';

const ReturnsExchangesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Возврат и обмен</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Возврат товара</h2>
          <p>
            Возврат денежных средств осуществляется на карту, с которой ранее была
            произведена оплата. Срок поступления денежных средств на карту от 3 до 30
            дней с момента осуществления возврата Продавцом.
          </p>
        </section>
        
        <section>
          <p>
            Вернуть товар надлежащего качества можно, если сохранены его товарный вид,
            фабричные ярлыки, этикетки, потребительские свойства, а также приложен документ,
            подтверждающий факт покупки указанного товара. Нельзя вернуть товар, бывший в употреблении.
          </p>
          <p className="mt-4">
            Согласно статье 28 Закона Республики Беларусь от 9 января 2002 года «О защите прав потребителей»
            (далее – Закон), регулирующей вопросы возврата и обмена товаров надлежащего качества,
            потребитель вправе возвратить товар надлежащего качества или обменять его на аналогичный
            товар в течение четырнадцати дней.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReturnsExchangesPage;
