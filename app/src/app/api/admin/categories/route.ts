import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createServerClientWithToken } from '@/utils/supabaseServer';

// Define the expected shape of the category data
interface NewCategoryData {
    name: string;
    description?: string;
    parent_id?: string | null;
    is_active?: boolean;
    image_url?: string;
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
            console.error("API Auth Error (Create Category):", authError);
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
            console.error("API Profile Error (Create Category):", profileError);
            return NextResponse.json({ error: 'Failed to retrieve user profile or profile not found.' }, { status: 500 });
        }
        
        // Ensure consistent case for role check
        if (!profile?.role || !(profile.role.toUpperCase() === 'ADMIN' || profile.role === 'admin')) { 
            console.warn(`User ${user.id} with role "${profile.role}" attempted to create category without admin privileges.`);
            return NextResponse.json({ error: 'Forbidden: Requires admin privileges.' }, { status: 403 });
        }

        // Parse request body and validate category data
        let categoryData: NewCategoryData;
        try {
            categoryData = await req.json() as NewCategoryData;

            // Basic data validation
            if (!categoryData.name) {
                throw new Error('Category name is required');
            }
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error("API Body Parse Error:", err);
            return NextResponse.json({ error: message || 'Invalid request data' }, { status: 400 });
        }

        // Generate a slug from the name
        const slug = categoryData.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '');

        // Insert the category into database
        try {
            const { data: category, error: categoryError } = await supabaseAdmin
                .from('categories')
                .insert({
                    name: categoryData.name,
                    slug: slug,
                    description: categoryData.description || null,
                    parent_id: categoryData.parent_id || null,
                    image_url: categoryData.image_url || null,
                    is_active: categoryData.is_active !== undefined ? categoryData.is_active : true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (categoryError) {
                console.error("API Category Insertion Error:", categoryError);
                return NextResponse.json({ error: `Failed to create category: ${categoryError.message}` }, { status: 500 });
            }

            // Return the created category data
            return NextResponse.json(category, { status: 201 });

        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error("API Category Creation Error:", err);
            return NextResponse.json({ error: message || 'Failed to create category.' }, { status: 500 });
        }
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('Unexpected error in categories API route:', error);
        return NextResponse.json({ error: message || 'An unexpected server error occurred' }, { status: 500 });
    }
}