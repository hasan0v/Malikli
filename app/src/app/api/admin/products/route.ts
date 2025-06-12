import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createServerClientWithToken } from '@/utils/supabaseServer';

// Define product interface
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  inventory_count?: number;
  is_active: boolean;
  drop_scheduled_time?: string | null;
  created_at?: string;
}

// Helper to check if user is admin
const isAdmin = async (req: NextRequest) => {
  // Extract the authorization header
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Auth error in products: No valid authorization header');
    return false;
  }
  
  // Get the token from the Authorization header
  const token = authHeader.split(' ')[1];
  
  // Create Supabase client with the auth token
  const supabase = createServerClientWithToken(token);
  
  // Get user data
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("API Auth Error (Products):", authError);
    return false;
  }

  // Use service role client to check if user is admin
  const supabaseAdmin = createServiceRoleClient();
  
  // Check if user has admin role in profiles table
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error("API Profile Error (Products):", profileError);
    return false;
  }
  
  // Ensure consistent case for role check
  if (profile?.role && (profile.role.toUpperCase() === 'ADMIN' || profile.role === 'admin')) {
    return true;
  }
  
  console.error("User not an admin:", user.id, "Role:", profile?.role);
  return false;
};

// GET handler - List all products with filtering, pagination
export async function GET(req: NextRequest) {
  // Check admin access
  if (!await isAdmin(req)) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 403 }
    );
  }
  const supabase = createServiceRoleClient();
  const searchParams = req.nextUrl.searchParams;
    // Parse query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const searchQuery = searchParams.get('search') || '';
  // const category = searchParams.get('category') || null; // Reserved for future use
  // const collection = searchParams.get('collection') || null; // Reserved for future use
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  
  // Calculate pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  // Build query
  let query = supabase
    .from('products')
    .select(`
      *,
      product_categories (
        category:categories(id, name)
      ),
      product_collections (
        collection:collections(id, name)
      ),
      product_images (
        id, url, is_primary, sort_order
      )
    `, { count: 'exact' })
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);
  
  // Apply filters
  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }
  
  // Execute query
  const { data, error, count } = await query;
  
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit)
    }
  });
}

// POST handler - Create a new product
export async function POST(req: NextRequest) {
  try {
    // Check admin access
    const isAdminUser = await isAdmin(req);
    if (!isAdminUser) {
      console.error("API Auth Error (Products POST): User is not authorized as admin");
      return NextResponse.json(
        { error: 'Unauthorized access - admin role required' },
        { status: 403 }
      );
    }

    const supabase = createServiceRoleClient();
    
    // Parse request body
    const body = await req.json();
    const {
      name,
      description,
      price,
      inventory_count,
      categories = [],
      collections = [],
      images = [],
      is_active = true,
      drop_scheduled_time = null,
      sizes = [],
      colors = [],
      variants = []
    } = body;
          // Validate required fields
    if (!name || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }    // Create product by directly inserting into the products table    // Handle image URLs - they can come as either direct URLs or objects with URL property
    let imageUrlsArray: string[] = [];
    if (images && images.length > 0) {
      imageUrlsArray = images.map((img: string | { url: string }) => {
        if (typeof img === 'string') {
          return img;
        }
        return img.url || img;
      });
    } else if (body.image_urls && Array.isArray(body.image_urls)) {
      // Handle direct image_urls array from client
      imageUrlsArray = body.image_urls.filter((url: unknown) => typeof url === 'string');
    }

    const { data, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        inventory_count: inventory_count || 0,
        is_active,
        drop_scheduled_time,
        image_urls: imageUrlsArray.length > 0 ? imageUrlsArray : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (productError) {
      console.error('Error creating product:', productError);
      return NextResponse.json(
        { error: productError.message },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Failed to create product: No data returned' },
        { status: 500 }
      );
    }
    
    // Type assertion to ensure TypeScript knows the structure
    const product = data as Product;
    const productId = product.id;
    
    // Add categories if provided
    if (categories.length > 0) {
      const categoryLinks = categories.map((categoryId: string) => ({
        product_id: productId,
        category_id: categoryId
      }));
      
      const { error: categoryError } = await supabase
        .from('product_categories')
        .insert(categoryLinks);
        
      if (categoryError) {
        console.error('Error adding categories:', categoryError);
      }
    }
    
    // Add collections if provided
    if (collections.length > 0) {
      const collectionLinks = collections.map((collectionId: string) => ({
        product_id: productId,
        collection_id: collectionId
      }));
      
      const { error: collectionError } = await supabase
        .from('product_collections')
        .insert(collectionLinks);
        
      if (collectionError) {
        console.error('Error adding collections:', collectionError);
      }
    }
      // Add images if provided
    if (images.length > 0) {
      const imageRecords = images.map((image: { url: string; is_primary?: boolean; sort_order?: number }, index: number) => ({
        product_id: productId,
        url: image.url,
        is_primary: image.is_primary || index === 0,
        sort_order: image.sort_order || index
      }));
      
      const { error: imageError } = await supabase
        .from('product_images')
        .insert(imageRecords);
        
      if (imageError) {
        console.error('Error adding images:', imageError);
      }
    }
    
    // Add sizes if provided
    if (sizes.length > 0) {
      const sizeLinks = sizes.map((sizeId: string) => ({
        product_id: productId,
        size_id: sizeId
      }));
      
      const { error: sizeError } = await supabase
        .from('product_size_variants')
        .insert(sizeLinks);
        
      if (sizeError) {
        console.error('Error adding sizes:', sizeError);
      }
    }
    
    // Add colors if provided
    if (colors.length > 0) {
      const colorLinks = colors.map((colorId: string) => ({
        product_id: productId,
        color_id: colorId
      }));
      
      const { error: colorError } = await supabase
        .from('product_color_variants')
        .insert(colorLinks);
        
      if (colorError) {
        console.error('Error adding colors:', colorError);
      }
    }
      // Add variants if provided
    if (variants.length > 0) {
      const variantRecords = variants.map((variant: { 
        size_id: number; 
        color_id: number; 
        inventory_count?: number; 
        price_adjustment?: number 
      }) => ({
        product_id: productId,
        size_id: variant.size_id,
        color_id: variant.color_id,
        inventory_count: variant.inventory_count || 0,
        price_adjustment: variant.price_adjustment || 0
      }));
      
      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantRecords);
        
      if (variantError) {
        console.error('Error adding variants:', variantError);
      }
    }    // Return the created product with its ID
    return NextResponse.json({
      data: {
        id: productId,
        name,
        description,
        price,
        inventory_count,
        is_active,
        drop_scheduled_time,
        created_at: new Date().toISOString()
      },
      message: 'Product created successfully'
    });
      } catch (error: unknown) {
    console.error('Server error creating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
