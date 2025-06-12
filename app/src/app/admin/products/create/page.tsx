'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function AdminProductsRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkAdminAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          // User is not logged in, redirect to login
          router.push('/signin?redirect=/admin/products');
          return;
        }
        
        // Check if user is admin
        const { data, error } = await supabase
          .from('admins')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (error || !data) {
          // User is not an admin, redirect to home page
          router.push('/');
          return;
        }
        
        // User is admin, redirect to the actual admin products page
        router.push('/admin/products');
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };
    
    checkAdminAndRedirect();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#76bfd4]"></div>
    </div>
  );
}
