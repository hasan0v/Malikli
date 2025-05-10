'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the cart sidebar component with SSR disabled
// This ensures it only renders on the client side, avoiding hydration issues
const CartSidebar = dynamic(() => import('./CartSidebar'), {
  ssr: false
});

export default function ClientCartSidebar() {
  return <CartSidebar />;
}
