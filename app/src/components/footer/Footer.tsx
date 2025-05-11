import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerGrid}>
        {/* Колонка 1: Поддержка клиентов */}
        <div className={styles.footerColumn}>
          <h3 className={styles.columnTitle}>Поддержка клиентов</h3>
          <ul>
            <li><Link href="/delivery">Информация о доставке</Link></li>
            <li><Link href="/returns-exchanges">Возврат и обмен</Link></li>
            <li><Link href="/payment-options">Способы оплаты</Link></li>
          </ul>
        </div>

        {/* Колонка 2: О компании */}
        <div className={styles.footerColumn}>
          <h3 className={styles.columnTitle}>О компании</h3>
          <ul>
            <li><Link href="/about">О нас</Link></li>
            <li><Link href="/privacy-policy">Политика конфиденциальности</Link></li>
            <li><Link href="/terms-conditions">Правила и условия</Link></li>
          </ul>
        </div>

        {/* Колонка 3: Контакты */}
        <div className={styles.footerColumn}>
          <h3 className={styles.columnTitle}>Связаться с нами</h3>
          <p>+375 44 537 1787</p>
          <p>melikliemin7@gmail.com</p>
          <p>Режим работы: 24/7</p>
          {/* <p>Пн–Пт: 9:00 – 18:00 (по восточному времени)</p> */}
        </div>
      </div>

      {/* Нижняя панель */}
      <div className={styles.bottomBar}>
        <div className={styles.legalInfo}>
          <p>© {currentYear} ООО «МАЛИКЛИ 1992». Все права защищены.</p>
          <p>Общество с ограниченной ответственностью «МАЛИКЛИ 1992»</p>
          <p>Свидетельство о гос. регистрации №193863901, выдано 21.04.2025 Минским горисполкомом</p>
          <p>220005, Минск, ул. Веры Хоружей, 6А, пом. 94И</p>
          <p>Регистрация в торговом реестре</p>
        </div>
        <div className={styles.paymentIcons}>
          <Image src="/images/visa-logo.png" alt="Visa" width={50} height={32} />
          <Image src="/images/mastercard-logo.png" alt="Mastercard" width={50} height={32} />
          <Image src="/images/belkart-logo.png" alt="Belkart" width={50} height={32} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
