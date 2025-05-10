'use client';

import React, { useState, useEffect } from 'react';
import { useCart, CartContextType } from '@/context/CartContext'; // Import CartContextType

const CartIcon = () => {
  // State to store cart data
  const [cartCount, setCartCount] = useState(0);
  const [handleClick, setHandleClick] = useState(() => () => {});
  const [error, setError] = useState<string | null>(null);

  // Call useCart at the top level and provide explicit type
  let cartContext: CartContextType | undefined;
  try {
    cartContext = useCart();
  } catch (err: any) {
    console.error('Error initializing cart context in CartIcon:', err);
    // Set error state in useEffect to avoid issues during initial render
    useEffect(() => {
      setError('Failed to load cart context.');
    }, []);
  }

  // Only access the context values after component has mounted on client
  useEffect(() => {
    if (cartContext) {
      try {
        // Use the context values obtained outside useEffect
        setCartCount(cartContext.cartCount || 0);
        setHandleClick(() => cartContext.openCart);
        setError(null); // Clear error if context is accessed successfully
      } catch (err) {
        console.error('Error using cart context values in CartIcon useEffect:', err);
        setError('Error updating cart state.');
      }
    } else if (!error) {
      // Handle case where context might still be undefined but no error was caught initially
      console.warn('Cart context not available in CartIcon useEffect.');
      // setError('Cart context unavailable.'); // Optionally set error
    }
    // Dependencies: cartContext object, specific values, and error state
  }, [cartContext, cartContext?.cartCount, cartContext?.openCart, error]);

  if (error) {
    // Optionally render an error state or a disabled icon
    return (
      <div className="relative p-2 text-gray-400" title={error}>
        {/* Simplified SVG or error indicator */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7 inline-block">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
      aria-label="Shopping cart"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="w-7 h-7 inline-block"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full ring-2 ring-white">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;