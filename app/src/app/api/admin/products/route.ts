import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createServerClientWithToken } from '@/utils/supabaseServer';

// Define the expected shape of the product data from the request body
interface NewProductData {
    name: string;
    description?: string;
    price: number | string; // Allow string initially for parsing
    inventory_count: number | string; // Allow string initially for parsing
    image_urls?: string[]; // Expecting an array containing the public URLs
    is_active?: boolean;
    drop_scheduled_time?: string | null; // ISO 8601 format or null
    categories?: string[];  // Array of category IDs
    collections?: string[]; // Array of collection IDs
    sizes?: string[];       // Array of size IDs
    colors?: string[];      // Array of color IDs
    variants?: {
        sizeId: string;
        colorId: string;
        inventory: number;
        price: string; // Keep as string for potential parsing, though API might expect number
    }[];
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
        let parsedPrice: number;
        let parsedInventoryCount: number;

        try {
            productData = await req.json() as NewProductData;

            // Basic data validation
            if (!productData.name) {
                throw new Error('Product name is required');
            }

            // Ensure numeric fields are numbers
            parsedPrice = parseFloat(String(productData.price));
            parsedInventoryCount = parseInt(String(productData.inventory_count), 10);


            // Further validation
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                throw new Error('Invalid price value');
            }
            if (isNaN(parsedInventoryCount) || parsedInventoryCount < 0) {
                throw new Error('Invalid inventory count');
            }

        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error("API Body Parse Error:", err);
            return NextResponse.json({ error: message || 'Invalid request data' }, { status: 400 });
        }

        // 3. Insert the product into database using service role client (admin permissions)
        try {
            // Start a transaction to ensure all operations succeed or fail together
            const { data: product, error: productError } = await supabaseAdmin
                .from('products')
                .insert({
                    name: productData.name,
                    description: productData.description,
                    price: parsedPrice,
                    inventory_count: parsedInventoryCount,
                    image_urls: productData.image_urls,
                    is_active: productData.is_active,
                    drop_scheduled_time: productData.drop_scheduled_time,
                    created_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (productError) {
                console.error("API Product Insertion Error:", productError);
                return NextResponse.json({ error: `Failed to create product: ${productError.message}` }, { status: 500 });
            }

            // Process categories if provided
            if (productData.categories && productData.categories.length > 0) {
                const categoryInserts = productData.categories.map(categoryId => ({
                    product_id: product.id,
                    category_id: categoryId,
                    is_primary: productData.categories?.[0] === categoryId // First category is primary
                }));

                const { error: categoriesError } = await supabaseAdmin
                    .from('product_categories')
                    .insert(categoryInserts);

                if (categoriesError) {
                    console.error("API Categories Insertion Error:", categoriesError);
                    // Continue with product creation even if categories fail
                }
            }

            // Process collections if provided
            if (productData.collections && productData.collections.length > 0) {
                const collectionInserts = productData.collections.map(collectionId => ({
                    product_id: product.id,
                    collection_id: collectionId
                }));

                const { error: collectionsError } = await supabaseAdmin
                    .from('product_collections')
                    .insert(collectionInserts);

                if (collectionsError) {
                    console.error("API Collections Insertion Error:", collectionsError);
                    // Continue with product creation even if collections fail
                }
            }

            // Process images if provided (for the new product_images table)
            if (productData.image_urls && productData.image_urls.length > 0) {
                const imageInserts = productData.image_urls.map((url, index) => ({
                    product_id: product.id,
                    url: url,
                    is_primary: index === 0, // First image is primary
                    sort_order: index * 10 // Sort order increments by 10
                }));

                const { error: imagesError } = await supabaseAdmin
                    .from('product_images')
                    .insert(imageInserts);

                if (imagesError) {
                    console.error("API Images Insertion Error:", imagesError);
                    // Continue with product creation even if image metadata fails
                }
            }

            // Process variants if provided
            if (productData.variants && productData.variants.length > 0) {
                // Handle size-color variant combinations
                const variantInserts = productData.variants.map(variant => ({
                    product_id: product.id,
                    size_id: variant.sizeId,
                    color_id: variant.colorId,
                    inventory_count: variant.inventory,
                    price_adjustment: parseFloat(variant.price) - parsedPrice, // Store price difference
                }));

                const { error: variantsError } = await supabaseAdmin
                    .from('product_variants')
                    .insert(variantInserts);

                if (variantsError) {
                    console.error("API Variants Insertion Error:", variantsError);
                    // Continue with product creation even if variants fail
                }
            }
            // Handle size associations without variants
            else if (productData.sizes && productData.sizes.length > 0) {
                const sizeInserts = productData.sizes.map(sizeId => ({
                    product_id: product.id,
                    size_id: sizeId
                }));

                const { error: sizesError } = await supabaseAdmin
                    .from('product_size_variants')
                    .insert(sizeInserts);

                if (sizesError) {
                    console.error("API Sizes Insertion Error:", sizesError);
                    // Continue with product creation even if sizes fail
                }
            }

            // Handle color associations without variants
            if (!productData.variants && productData.colors && productData.colors.length > 0) {
                const colorInserts = productData.colors.map(colorId => ({
                    product_id: product.id,
                    color_id: colorId
                }));

                const { error: colorsError } = await supabaseAdmin
                    .from('product_color_variants')
                    .insert(colorInserts);

                if (colorsError) {
                    console.error("API Colors Insertion Error:", colorsError);
                    // Continue with product creation even if colors fail
                }
            }

            // Return the created product data
            return NextResponse.json(product, { status: 201 });

        } catch (err: unknown) {
            const message = getErrorMessage(err);
            console.error("API Product Creation Error:", err);
            return NextResponse.json({ error: message || 'Failed to create product.' }, { status: 500 });
        }
    } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error('Unexpected error in products API route:', error);
        return NextResponse.json({ error: message || 'An unexpected server error occurred' }, { status: 500 });
    }
}