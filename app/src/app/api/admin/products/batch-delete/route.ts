// app/src/app/api/admin/products/batch-delete/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabaseAdmin'; // Ensure you have a supabase admin client for privileged operations

export async function POST(request: Request) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error('Error getting session:', sessionError);
            return NextResponse.json({ error: 'Failed to authenticate session' }, { status: 500 });
        }

        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Check for admin role (using a separate query to user_profiles or similar table)
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profileError) {
            console.error('Error fetching user profile:', profileError);
            return NextResponse.json({ error: 'Error fetching user profile' }, { status: 500 });
        }

        if (profile?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        const { productIds } = await request.json();

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 });
        }

        // Use supabaseAdmin for delete operations to bypass RLS if necessary,
        // or ensure your RLS policies allow admins to delete.
        // Note: This is a simplified deletion. In a real app, you'd need to handle:
        // 1. Deleting related images from storage.
        // 2. Deleting related records in join tables (product_categories, product_collections, product_variants, product_images) 
        //    if not handled by CASCADE delete in your database schema.
        // For this example, we assume `products` table deletion might cascade or these are handled elsewhere/not critical for this step.

        // Attempt to delete product variants first if they exist and are not cascaded
        const { error: variantError } = await supabaseAdmin
            .from('product_variants')
            .delete()
            .in('product_id', productIds);

        if (variantError) {
            console.error('Error deleting product variants:', variantError);
            // Decide if this is a critical error. For now, we'll log and continue to product deletion.
            // return NextResponse.json({ error: `Failed to delete product variants: ${variantError.message}` }, { status: 500 });
        }
        
        // Delete from product_categories
        const { error: prodCatError } = await supabaseAdmin
            .from('product_categories')
            .delete()
            .in('product_id', productIds);
        if (prodCatError) console.error('Error deleting product_categories entries:', prodCatError);

        // Delete from product_collections
        const { error: prodColError } = await supabaseAdmin
            .from('product_collections')
            .delete()
            .in('product_id', productIds);
        if (prodColError) console.error('Error deleting product_collections entries:', prodColError);

        // Delete from product_images (if this table stores relations to image URLs and product IDs)
        // This step depends on how product_images are structured. If image_urls on products table is just an array of URLs,
        // then actual image file deletion from storage is a separate, more complex task.
        const { error: prodImgError } = await supabaseAdmin
            .from('product_images') // Assuming a join table like this
            .delete()
            .in('product_id', productIds);
        if (prodImgError) console.error('Error deleting product_images entries:', prodImgError);

        // TODO: Add logic here to delete actual image files from Supabase Storage if image_urls are stored and managed by your app.
        // This would involve: 
        // 1. Fetching the product records to get their image_urls.
        // 2. Parsing the URLs to get the file paths.
        // 3. Calling supabase.storage.from('your-bucket').remove([paths]).

        const { error: deleteError } = await supabaseAdmin
            .from('products')
            .delete()
            .in('id', productIds);

        if (deleteError) {
            console.error('Error deleting products:', deleteError);
            return NextResponse.json({ error: `Failed to delete products: ${deleteError.message}` }, { status: 500 });
        }

        return NextResponse.json({ message: 'Products deleted successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('Batch delete error:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
    }
}
