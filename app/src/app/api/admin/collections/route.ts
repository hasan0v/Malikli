import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createServerClientWithToken } from '@/utils/supabaseServer';

// Define the expected shape of the collection data
interface NewCollectionData {
    name: string;
    description?: string;
    is_active?: boolean;
    is_featured?: boolean;
    cover_image_url?: string;
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
            console.error("API Auth Error (Create Collection):", authError);
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
            console.error("API Profile Error (Create Collection):", profileError);
            return NextResponse.json({ error: 'Failed to retrieve user profile or profile not found.' }, { status: 500 });
        }
        
        // Ensure consistent case for role check
        if (!profile?.role || !(profile.role.toUpperCase() === 'ADMIN' || profile.role === 'admin')) { 
            console.warn(`User ${user.id} with role "${profile.role}" attempted to create collection without admin privileges.`);
            return NextResponse.json({ error: 'Forbidden: Requires admin privileges.' }, { status: 403 });
        }

        // Parse request body and validate collection data
        let collectionData: NewCollectionData;
        try {
            collectionData = await req.json();

            // Basic data validation
            if (!collectionData.name) {
                throw new Error('Collection name is required');
            }
        } catch (err: any) {
            console.error("API Body Parse Error:", err);
            return NextResponse.json({ error: err.message || 'Invalid request data' }, { status: 400 });
        }

        // Generate a slug from the name
        const slug = collectionData.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '');

        // Insert the collection into database
        try {
            const { data: collection, error: collectionError } = await supabaseAdmin
                .from('collections')
                .insert({
                    name: collectionData.name,
                    slug: slug,
                    description: collectionData.description || null,
                    cover_image_url: collectionData.cover_image_url || null,
                    is_active: collectionData.is_active !== undefined ? collectionData.is_active : true,
                    is_featured: collectionData.is_featured !== undefined ? collectionData.is_featured : false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (collectionError) {
                console.error("API Collection Insertion Error:", collectionError);
                return NextResponse.json({ error: `Failed to create collection: ${collectionError.message}` }, { status: 500 });
            }

            // Return the created collection data
            return NextResponse.json(collection, { status: 201 });

        } catch (err: any) {
            console.error("API Collection Creation Error:", err);
            return NextResponse.json({ error: err.message || 'Failed to create collection.' }, { status: 500 });
        }
    } catch (error) {
        console.error('Unexpected error in collections API route:', error);
        return NextResponse.json({ error: 'An unexpected server error occurred' }, { status: 500 });
    }
}
