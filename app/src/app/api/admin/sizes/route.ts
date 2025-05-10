import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createServerClientWithToken } from '@/utils/supabaseServer';

// Define the expected shape of the size data
interface NewSizeData {
    name: string;
    display_name: string;
    sort_order?: number;
}

// Helper function to get error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'An unexpected error occurred.';
};

export async function POST(req: NextRequest) {
    try {
        // Extract the authorization header
        const authHeader = req.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Invalid or missing auth token' }, { status: 401 });
        }
        
        // Get the token from the Authorization header
        const token = authHeader.split(' ')[1];
        
        // Create Supabase client with the auth token
        const supabase = createServerClientWithToken(token);

        // Check Authentication & Authorization
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.error("API Auth Error (Create Size):", authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use the service role client for checking profile and inserting data
        const supabaseAdmin = createServiceRoleClient();

        // Fetch user profile to check role using the admin client
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            console.error("API Profile Error (Create Size):", profileError);
            return NextResponse.json({ error: 'Failed to retrieve user profile or profile not found.' }, { status: 500 });
        }
        
        // Ensure consistent case for role check
        if (!profile?.role || !(profile.role.toUpperCase() === 'ADMIN' || profile.role === 'admin')) { 
            console.warn(`User ${user.id} with role "${profile.role}" attempted to create size without admin privileges.`);
            return NextResponse.json({ error: 'Forbidden: Requires admin privileges.' }, { status: 403 });
        }

        // Parse request body and validate size data
        let sizeData: NewSizeData;
        try {
            sizeData = await req.json() as NewSizeData;

            // Basic data validation
            if (!sizeData.name) {
                throw new Error('Size name is required');
            }
            if (!sizeData.display_name) {
                throw new Error('Display name is required');
            }
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error("API Body Parse Error:", err);
            return NextResponse.json({ error: message || 'Invalid request data' }, { status: 400 });
        }

        // Insert the size into database
        try {
            // First get the highest sort_order to append new size at the end
            const { data: maxSortOrderData } = await supabaseAdmin
                .from('product_sizes')
                .select('sort_order')
                .order('sort_order', { ascending: false })
                .limit(1)
                .single();

            const maxSortOrder = maxSortOrderData as { sort_order: number | null } | null;
                
            const newSortOrder = sizeData.sort_order !== undefined 
                ? sizeData.sort_order 
                : (maxSortOrder?.sort_order || 0) + 10;

            const { data: size, error: sizeError } = await supabaseAdmin
                .from('product_sizes')
                .insert({
                    name: sizeData.name,
                    display_name: sizeData.display_name,
                    sort_order: newSortOrder,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (sizeError) {
                console.error("API Size Insertion Error:", sizeError);
                return NextResponse.json({ error: `Failed to create size: ${sizeError.message}` }, { status: 500 });
            }

            // Return the created size data
            return NextResponse.json(size, { status: 201 });

        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error("API Size Creation Error:", err);
            return NextResponse.json({ error: message || 'Failed to create size.' }, { status: 500 });
        }
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('Unexpected error in sizes API route:', error);
        return NextResponse.json({ error: message || 'An unexpected server error occurred' }, { status: 500 });
    }
}