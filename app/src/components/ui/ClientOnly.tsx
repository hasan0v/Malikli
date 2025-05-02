'use client';

import React, { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyProps {
  children: () => ReactNode;
  fallback?: ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // During server-side rendering and initial client render (before hydration completes),
  // we return the fallback to ensure it matches what was rendered on the server
  if (!hasMounted) {
    return <>{fallback}</>;
  }
  
  // After hydration, we can safely render the client-side content
  return <>{children()}</>;
}
