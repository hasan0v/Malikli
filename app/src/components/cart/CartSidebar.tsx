'use client';

import React, { useState, useEffect } from 'react';
import { useCart, CartContextType, CartItem } from '@/context/CartContext'; // Import types
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Removed duplicate type definitions for CartItem and Product, using imported CartItem

const CartSidebar = () => {
  // Local state mirroring context values
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Start as true until context loads
  const [error, setError] = useState<string | null>(null);

  // Functions derived from context - initialize with safe defaults
  const [closeCartHandler, setCloseCartHandler] = useState(() => () => {});
  const [removeFromCartHandler, setRemoveFromCartHandler] = useState<(id: string) => Promise<void>>(() => async () => {});
  const [updateQuantityHandler, setUpdateQuantityHandler] = useState<(id: string, qty: number) => Promise<void>>(() => async () => {});

  const router = useRouter();

  // Call useCart at the top level
  let cartContext: CartContextType | undefined;
  try {
    cartContext = useCart();
  } catch (err: any) {
    console.error('Error initializing cart context in CartSidebar:', err);
    // Set error state in useEffect to avoid issues during initial render
    useEffect(() => {
      setError('Failed to load cart context.');
      setIsLoading(false); // Stop loading if context fails
    }, []);
  }

  // Effect to synchronize local state with context values
  useEffect(() => {
    if (cartContext) {
      try {
        setIsCartOpen(cartContext.isCartOpen);
        setCartItems(cartContext.cartItems || []); // Ensure array
        setCartTotal(cartContext.cartTotal || 0);
        setIsLoading(cartContext.isLoading);
        // Update function handlers
        setCloseCartHandler(() => cartContext.closeCart);
        setRemoveFromCartHandler(() => cartContext.removeFromCart);
        setUpdateQuantityHandler(() => cartContext.updateQuantity);
        setError(null); // Clear error on successful update
      } catch (err) {
        console.error('Error updating cart state from context in CartSidebar:', err);
        setError('Error updating cart state.');
        setIsLoading(false);
      }
    } else if (!error) {
       // Context might not be ready yet, or an error occurred before this effect ran
       console.warn('Cart context not available in CartSidebar useEffect.');
       // Keep isLoading true until context is confirmed loaded or errored
    }
    // Dependencies: Update local state whenever these context values change.
  }, [
    cartContext,
    cartContext?.isCartOpen,
    cartContext?.cartItems,
    cartContext?.cartTotal,
    cartContext?.isLoading,
    cartContext?.closeCart,
    cartContext?.removeFromCart,
    cartContext?.updateQuantity,
    error // Re-run if error state changes
  ]);

  const handleCheckout = () => {
    closeCartHandler();
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    closeCartHandler();
    router.push('/');
  };

  // Render loading state or error message
   if (error && !isCartOpen) { // Show error only if cart isn't forced open somehow
     // Optionally render a small error indicator somewhere else or log it
     console.error("Cart Sidebar Error:", error);
     return null; // Don't render the sidebar if context failed and it's closed
   }

  // Don't render if not open
  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeCartHandler} // Use the state handler
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
          <button
            onClick={closeCartHandler} // Use the state handler
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close cart"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && ( // Display error message inside the cart if it's open
            <div className="text-center py-4 text-red-600 bg-red-100 border border-red-400 rounded p-2 mb-4">
              Error: {error}
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <p className="text-gray-500">Your cart is empty.</p>
              <button
                onClick={handleContinueShopping}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul role="list" className="-my-6 divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id || item.product_id} className="flex py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <Image
                      src={item.product?.image_urls?.[0] || '/placeholder-image.png'} // Use placeholder
                      alt={item.product?.name || 'Product image'}
                      width={96} // Corresponds to w-24
                      height={96} // Corresponds to h-24
                      className="h-full w-full object-cover object-center"
                      onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }} // Fallback on error
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.product?.name || 'Unknown Product'}</h3>
                        <p className="ml-4">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                      </div>
                      {/* Optional: Add product variant info here if available */}
                      {/* <p className="mt-1 text-sm text-gray-500">{item.color}</p> */}
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center">
                        <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity</label>
                        <select
                          id={`quantity-${item.id}`}
                          name={`quantity-${item.id}`}
                          value={item.quantity}
                          onChange={(e) => updateQuantityHandler(item.product_id, parseInt(e.target.value))} // Use handler
                          className="h-8 w-16 border-gray-300 rounded text-base focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {[...Array(10).keys()].map(n => (
                            <option key={n + 1} value={n + 1}>{n + 1}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => removeFromCartHandler(item.product_id)} // Use handler
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {!isLoading && cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p>${cartTotal.toFixed(2)}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
            <div className="mt-6">
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Checkout
              </button>
            </div>
            <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
              <p>
                or{' '}
                <button
                  type="button"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={handleContinueShopping}
                >
                  Continue Shopping<span aria-hidden="true"> &rarr;</span>
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;