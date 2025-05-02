import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createServerClientWithToken } from '@/utils/supabaseServer';

// Define the expected shape of the product data from the request body
interface NewProductData {
    name: string;
    description?: string;
    price: number;
    inventory_count: number;
    image_urls?: string[]; // Expecting an array containing the public URL from R2
    is_active?: boolean;
    drop_scheduled_time?: string | null; // ISO 8601 format or null
}

export async function POST(req: NextRequest) {
    try {
        // Extract the authorization header
        const authHeader = req.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error('Auth error in products API: No valid authorization header');
            return NextResponse.json({ error: 'Unauthorized: Invalid or missing auth token' }, { status: 401 });
        }
        
        // Get the token from the Authorization header
        const token = authHeader.split(' ')[1];
        
        // Create Supabase client with the auth token
        const supabase = createServerClientWithToken(token);

        // 1. Check Authentication & Authorization
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            console.error("API Auth Error (Create Product):", authError);
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
            console.error("API Profile Error (Create Product):", profileError);
            return NextResponse.json({ error: 'Failed to retrieve user profile or profile not found.' }, { status: 500 });
        }
        
        // Debug the actual role value
        console.log('User role in database (products API):', profile?.role);
        
        // Ensure consistent case for role check - use case-insensitive comparison
        if (!profile?.role || 
            !(profile.role.toUpperCase() === 'ADMIN' || 
              profile.role === 'admin')) { 
            console.warn(`User ${user.id} with role "${profile.role}" attempted to create product without admin privileges.`);
            return NextResponse.json({ error: 'Forbidden: Requires admin privileges.' }, { status: 403 });
        }

        // 2. Parse request body and validate product data
        let productData: NewProductData;
        try {
            productData = await req.json();

            // Basic data validation
            if (!productData.name) {
                throw new Error('Product name is required');
            }

            // Ensure numeric fields are numbers (might come as strings from frontend form)
            if (typeof productData.price === 'string') {
                productData.price = parseFloat(productData.price);
            }
            if (typeof productData.inventory_count === 'string') {
                productData.inventory_count = parseInt(productData.inventory_count, 10);
            }

            // Further validation
            if (isNaN(productData.price) || productData.price < 0) {
                throw new Error('Invalid price value');
            }
            if (isNaN(productData.inventory_count) || productData.inventory_count < 0) {
                throw new Error('Invalid inventory count');
            }

        } catch (err: any) {
            console.error("API Body Parse Error:", err);
            return NextResponse.json({ error: err.message || 'Invalid request data' }, { status: 400 });
        }

        // 3. Insert the product into database using service role client (admin permissions)
        try {            const { data, error } = await supabaseAdmin
                .from('products')
                .insert([{
                    ...productData,
                    // Enforce certain default values
                    created_at: new Date().toISOString(),
                    // Removed user_id as it doesn't exist in the products table
                }])
                .select() // Return the inserted data
                .limit(1); // Select only the first row

            if (error) {
                console.error("API Database Insertion Error:", error);
                return NextResponse.json({ error: `Failed to create product: ${error.message}` }, { status: 500 });
            }

            // Return the created product data
            return NextResponse.json(data ? data[0] : { success: true }, { status: 201 });

        } catch (err: any) {
            console.error("API Product Creation Error:", err);
            return NextResponse.json({ error: err.message || 'Failed to create product.' }, { status: 500 });
        }
    } catch (error) {
        console.error('Unexpected error in products API route:', error);
        return NextResponse.json({ error: 'An unexpected server error occurred' }, { status: 500 });
    }
}