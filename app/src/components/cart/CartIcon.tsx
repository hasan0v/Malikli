'use client';

// import React, { useState, useEffect } from 'react'; // useEffect might not be needed anymore
import { useCart } from '@/context/CartContext'; 

// Helper function to get error messages - define or import this
// const getErrorMessage = (error: unknown): string => {
//   if (error instanceof Error) return error.message;
//   if (typeof error === 'string') return error;
//   if (error && typeof (error as { message?: unknown }).message === 'string') {
//     return (error as { message: string }).message;
//   }
//   return 'An unknown error occurred.';
// };

const CartIcon = () => {
  // Call useCart at the top level.
  // This hook will throw an error if CartProvider is not an ancestor,
  // which should be caught by an Error Boundary.
  // Or, if useCart is designed to return an error state, we can check that.
  const { cartCount, openCart, isLoading } = useCart();
  
  // Local error state for issues specific to this component's interactions, if any.
  // For context loading issues, rely on isLoading from context or Error Boundaries.
  // const [componentError, setComponentError] = useState<string | null>(null);


  // The useEffect to sync from context to local state is no longer needed
  // as we are using context values directly.

  // If an error occurs because CartProvider is missing, useCart() will throw.
  // The component rendering will stop, and an Error Boundary should display an error.
  // If you want to handle it locally (though not standard for missing provider):
  /*
  let cartData;
  let cartError = null;
  try {
    cartData = useCart();
  } catch (err: unknown) {
    console.error('Error initializing cart context in CartIcon:', err);
    cartError = getErrorMessage(err); // Use your error message helper
  }

  if (cartError) {
    return (
      <div className="relative p-2 text-gray-400" title={cartError}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7 inline-block">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
    );
  }
  
  // Then destructure from cartData if no error
  // const { cartCount, openCart, isLoading } = cartData || { cartCount: 0, openCart: () => {}, isLoading: true };
  */


  // Handle click should directly use openCart from context.
  const handleClick = () => {
    if (openCart) {
      openCart();
    } else {
      // This case should ideally not happen if useCart guarantees openCart is defined
      // or throws an error if context is not set up correctly.
      console.warn('openCart function is not available from CartContext.');
    }
  };

  // Optional: Show a loading state or a disabled icon if context is loading
  // This depends on how `isLoading` is handled in your CartContext.
  // If `isLoading` is true, you might want to render a different state.
  // For simplicity, we'll assume `cartCount` and `openCart` are usable even during loading,
  // or that `isLoading` primarily affects display within `CartSidebar`.

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
      aria-label="Shopping cart"
      disabled={isLoading} // Optionally disable while context is loading
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