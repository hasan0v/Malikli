'use client';

import React from 'react';
import NavigationHeader from '@/components/header/NavigationHeader';

// This component ensures NavigationHeader is treated as a client boundary
export default function ClientNavigation() {
  return <NavigationHeader />;
}