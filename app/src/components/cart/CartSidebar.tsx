'use client';

import React, { useState, useEffect,  } from 'react'; // useCallback
import { useCart,  } from '@/context/CartContext'; // Import types CartContextType, CartItem
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Helper function to get error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'An unknown error occurred.';
};

const CartSidebar = () => {
  const router = useRouter();
  
  // Call useCart at the top level
  // This will throw if CartProvider is not an ancestor.
  // We'll handle the UI based on isLoading and cartItems from the context.
  const cartContext = useCart(); 

  // Destructure directly from cartContext if it's guaranteed to be defined by useCart throwing.
  // If useCart can return undefined or a different shape, adjust accordingly.
  const { 
    isCartOpen, 
    cartItems, 
    cartTotal, 
    isLoading: contextIsLoading, 
    closeCart, 
    removeFromCart, 
    updateQuantity 
  } = cartContext;

  const [componentError, setComponentError] = useState<string | null>(null);

  // This effect is primarily to catch errors if the context itself fails to provide functions,
  // or if an operation within the sidebar that relies on the context throws an error.
  // Most data loading states (isLoading, cartItems) should come directly from context.
  useEffect(() => {
    // Example: if cartContext was not found, useCart would throw an error.
    // This component wouldn't render further if that happens.
    // If useCart could return null/undefined, you'd check here:
    // if (!cartContext) {
    //   setComponentError('Failed to load cart context.');
    //   return;
    // }
    // setComponentError(null); // Clear previous errors if context is now fine

    // The individual state updates are no longer needed as we use context values directly.
  }, [cartContext]); // Re-evaluate if cartContext object itself changes (rare)


  const handleCheckout = () => {
    if (closeCart) {
      closeCart();
    }
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    if (closeCart) {
      closeCart();
    }
    router.push('/');
  };

  // Render error from this component's logic or context (if context had an error prop)
  if (componentError && !isCartOpen) {
    console.error("Cart Sidebar Error:", componentError);
    return null; 
  }

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
          <button
            onClick={closeCart}
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
          {componentError && ( 
            <div className="text-center py-4 text-red-600 bg-red-100 border border-red-400 rounded p-2 mb-4">
              Error: {componentError}
            </div>
          )}
          {contextIsLoading ? (
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
                <li key={item.id || item.product_id} className="flex py-6">                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    {item.product?.image_urls?.[0] ? (
                      <Image
                        src={item.product.image_urls[0]} 
                        alt={item.product.name || 'Product image'}
                        width={96} 
                        height={96}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.product?.name || 'Unknown Product'}</h3>
                        <p className="ml-4">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center">
                        <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity</label>
                        <select
                          id={`quantity-${item.id}`}
                          name={`quantity-${item.id}`}
                          value={item.quantity}
                          onChange={(e) => {
                            if (updateQuantity) {
                              updateQuantity(item.product_id, parseInt(e.target.value))
                                .catch(err => {
                                  const message = getErrorMessage(err);
                                  console.error("Error updating quantity:", message);
                                  setComponentError(`Failed to update quantity: ${message}`);
                                });
                            }
                          }}
                          className="h-8 w-16 border-gray-300 rounded text-base focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {[...Array(10).keys()].map(n => ( // Consider using item.product.inventory_count for max
                            <option key={n + 1} value={n + 1}>{n + 1}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => {
                            if (removeFromCart) {
                              removeFromCart(item.product_id)
                                .catch(err => {
                                  const message = getErrorMessage(err);
                                  console.error("Error removing item:", message);
                                  setComponentError(`Failed to remove item: ${message}`);
                                });
                            }
                          }}
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
        {!contextIsLoading && cartItems.length > 0 && (
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
                  Continue Shopping<span aria-hidden="true"> →</span>
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