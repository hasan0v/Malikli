'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  dropDate: string;
  className?: string;
  onComplete?: () => void;
}

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  dropDate,
  className = '',
  onComplete
}) => {
  const [countdown, setCountdown] = useState<CountdownValues>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const drop = new Date(dropDate);
      const diff = Math.max(0, drop.getTime() - now.getTime());
      
      if (diff === 0 && onComplete) {
        onComplete();
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [dropDate, onComplete]);
  
  return (
    <div className={`grid grid-cols-4 gap-2 ${className}`}>
      <div className="flex flex-col items-center p-2 bg-[#ced1ff]/30 rounded-lg">
        <span className="text-xl font-bold text-[#24225c]">{countdown.days}</span>
        <span className="text-xs text-gray-600">Days</span>
      </div>
      <div className="flex flex-col items-center p-2 bg-[#ced1ff]/30 rounded-lg">
        <span className="text-xl font-bold text-[#24225c]">{countdown.hours}</span>
        <span className="text-xs text-gray-600">Hours</span>
      </div>
      <div className="flex flex-col items-center p-2 bg-[#ced1ff]/30 rounded-lg">
        <span className="text-xl font-bold text-[#24225c]">{countdown.minutes}</span>
        <span className="text-xs text-gray-600">Minutes</span>
      </div>
      <div className="flex flex-col items-center p-2 bg-[#ced1ff]/30 rounded-lg">
        <span className="text-xl font-bold text-[#24225c]">{countdown.seconds}</span>
        <span className="text-xs text-gray-600">Seconds</span>
      </div>
    </div>
  );
};

interface NotificationFormProps {
  onSubmit: (email: string) => void;
  loading: boolean;
  showSuccess: boolean;
  buttonText?: string;
  placeholderText?: string;
  className?: string;
}

export const NotificationForm: React.FC<NotificationFormProps> = ({
  onSubmit,
  loading,
  showSuccess,
  buttonText = 'Notify Me',
  placeholderText = 'Enter your email for drop notifications',
  className = '',
}) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      onSubmit(email);
      // setEmail(''); // Optionally clear email after submission, depends on parent logic
    } else {
      // Optionally provide feedback for invalid email
      alert('Please enter a valid email address.');
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholderText}
          className="w-full px-4 py-3 pr-28 rounded-lg border-2 border-[#ced1ff] bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:ring-2 focus:ring-[#b597ff] outline-none"
          required
        />
        <button 
          type="submit"
          disabled={loading}
          className="absolute right-1 top-1 bottom-1 px-4 bg-[#b597ff] hover:bg-[#a076ff] text-white rounded-md transition-colors flex items-center justify-center disabled:opacity-70"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            buttonText
          )}
        </button>
      </form>
      
      {showSuccess && (
        <div className="mt-2 text-sm font-medium text-[#a0fff8]">
          ✓ You&apos;ve been added to our notification list!
        </div>
      )}
    </div>
  );
};

// Define a basic product type for the ProductCard props
// interface ProductSummary { // Commented out as ProductCard is commented out
//   id: string;
//   name: string;
//   // Add other fields relevant to a product card summary
//   image_urls?: string[] | null; 
//   price?: number;
// }

// interface ProductCardProps { // Commented out as ProductCard is commented out
//   product: ProductSummary; 
//   onSetReminder: (productId: string) => void; 
// }

/* // ProductCard component is commented out as it's not implemented
export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSetReminder 
}) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-[#ced1ff]/30">
      {/* Example Usage of props:
      <h2>{product.name}</h2>
      {product.image_urls && product.image_urls[0] && (
        <img src={product.image_urls[0]} alt={product.name} />
      )}
      <p>Price: ${product.price}</p>
      <button onClick={() => onSetReminder(product.id)}>Set Reminder</button>
      * /
      {/* Card content would go here - extracted to make it reusable * /
    </div>
  );
};
// */