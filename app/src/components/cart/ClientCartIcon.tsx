'use client';

import dynamic from 'next/dynamic';

// Dynamically import CartIcon, disabling SSR
const ClientCartIcon = dynamic(() => import('./CartIcon'), {
  ssr: false,
  // Optional: Add a loading component if needed
  // loading: () => <p>Loading cart...</p>,
});

export default ClientCartIcon; // Directly export the dynamically loaded component
