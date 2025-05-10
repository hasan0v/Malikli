import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createServerClientWithToken } from '@/utils/supabaseServer';

// Define the expected shape of the color data
interface NewColorData {
    name: string;
    display_name: string;
    hex_code?: string;
    sort_order?: number;
}

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
            console.error("API Auth Error (Create Color):", authError);
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
            console.error("API Profile Error (Create Color):", profileError);
            return NextResponse.json({ error: 'Failed to retrieve user profile or profile not found.' }, { status: 500 });
        }
        
        // Ensure consistent case for role check
        if (!profile?.role || !(profile.role.toUpperCase() === 'ADMIN' || profile.role === 'admin')) { 
            console.warn(`User ${user.id} with role "${profile.role}" attempted to create color without admin privileges.`);
            return NextResponse.json({ error: 'Forbidden: Requires admin privileges.' }, { status: 403 });
        }

        // Parse request body and validate color data
        let colorData: NewColorData;
        try {
            colorData = await req.json();

            // Basic data validation
            if (!colorData.name) {
                throw new Error('Color name is required');
            }
            if (!colorData.display_name) {
                throw new Error('Display name is required');
            }
        } catch (err: any) {
            console.error("API Body Parse Error:", err);
            return NextResponse.json({ error: err.message || 'Invalid request data' }, { status: 400 });
        }

        // Insert the color into database
        try {
            // First get the highest sort_order to append new color at the end
            const { data: maxSortOrder } = await supabaseAdmin
                .from('product_colors')
                .select('sort_order')
                .order('sort_order', { ascending: false })
                .limit(1)
                .single();
                
            const newSortOrder = colorData.sort_order !== undefined 
                ? colorData.sort_order 
                : (maxSortOrder?.sort_order || 0) + 10;

            const { data: color, error: colorError } = await supabaseAdmin
                .from('product_colors')
                .insert({
                    name: colorData.name,
                    display_name: colorData.display_name,
                    hex_code: colorData.hex_code || null,
                    sort_order: newSortOrder,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (colorError) {
                console.error("API Color Insertion Error:", colorError);
                return NextResponse.json({ error: `Failed to create color: ${colorError.message}` }, { status: 500 });
            }

            // Return the created color data
            return NextResponse.json(color, { status: 201 });

        } catch (err: any) {
            console.error("API Color Creation Error:", err);
            return NextResponse.json({ error: err.message || 'Failed to create color.' }, { status: 500 });
        }
    } catch (error) {
        console.error('Unexpected error in colors API route:', error);
        return NextResponse.json({ error: 'An unexpected server error occurred' }, { status: 500 });
    }
}
