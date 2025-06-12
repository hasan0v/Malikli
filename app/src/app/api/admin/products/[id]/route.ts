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
    console.error('Auth error in products/[id]: No valid authorization header');
    return false;
  }
  
  // Get the token from the Authorization header
  const token = authHeader.split(' ')[1];
  
  // Create Supabase client with the auth token
  const supabase = createServerClientWithToken(token);
  
  // Get user data
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("API Auth Error (Products/[id]):", authError);
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
    console.error("API Profile Error (Products/[id]):", profileError);
    return false;
  }
  
  // Ensure consistent case for role check
  if (profile?.role && (profile.role.toUpperCase() === 'ADMIN' || profile.role === 'admin')) {
    return true;
  }
  
  console.error("User not an admin:", user.id, "Role:", profile?.role);
  return false;
};

// GET handler - Get a single product by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin access
  if (!await isAdmin(req)) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 403 }
    );
  }

  const supabase = createServiceRoleClient();
  const productId = params.id;
  
  // Query product with all related data
  const { data, error } = await supabase
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
      ),
      product_size_variants (
        size:product_sizes(id, name, display_name)
      ),
      product_color_variants (
        color:product_colors(id, name, display_name, hex_code)
      ),
      product_variants (
        id, size_id, color_id, inventory_count, price_adjustment
      )
    `)
    .eq('id', productId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ data });
}

// PATCH handler - Update a product
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin access
  if (!await isAdmin(req)) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 403 }
    );
  }

  const supabase = createServiceRoleClient();
  const productId = params.id;
  
  try {
    // Check if product exists
    const { data: existingProduct, error: existingError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();
      
    if (existingError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const {
      name,
      description,
      price,
      inventory_count,
      is_active,
      drop_scheduled_time,
      categories,
      collections,
      images,
      sizes,
      colors,
      variants
    } = body;
      // Update basic product information
    const productUpdateData: any = {};
    
    if (name !== undefined) productUpdateData.name = name;
    if (description !== undefined) productUpdateData.description = description;
    if (price !== undefined) productUpdateData.price = price;
    if (inventory_count !== undefined) productUpdateData.inventory_count = inventory_count;
    if (is_active !== undefined) productUpdateData.is_active = is_active;
    if (drop_scheduled_time !== undefined) productUpdateData.drop_scheduled_time = drop_scheduled_time;
    
    // Handle image_urls if provided in the body directly
    if (body.image_urls !== undefined) {
      productUpdateData.image_urls = Array.isArray(body.image_urls) ? body.image_urls : null;
    }
    
    if (Object.keys(productUpdateData).length > 0) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productUpdateData)
        .eq('id', productId);
        
      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    }
    
    // Update categories if provided
    if (categories !== undefined) {
      // First delete existing categories
      await supabase
        .from('product_categories')
        .delete()
        .eq('product_id', productId);
        
      // Then insert new ones
      if (categories.length > 0) {
        const categoryLinks = categories.map((categoryId: string) => ({
          product_id: productId,
          category_id: categoryId
        }));
        
        await supabase
          .from('product_categories')
          .insert(categoryLinks);
      }
    }
    
    // Update collections if provided
    if (collections !== undefined) {
      // First delete existing collections
      await supabase
        .from('product_collections')
        .delete()
        .eq('product_id', productId);
        
      // Then insert new ones
      if (collections.length > 0) {
        const collectionLinks = collections.map((collectionId: string) => ({
          product_id: productId,
          collection_id: collectionId
        }));
        
        await supabase
          .from('product_collections')
          .insert(collectionLinks);
      }
    }
    
    // Update images if provided
    if (images !== undefined) {
      // First delete existing images
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);
        
      // Then insert new ones
      if (images.length > 0) {
        const imageRecords = images.map((image: any, index: number) => ({
          product_id: productId,
          url: image.url,
          is_primary: image.is_primary || index === 0,
          sort_order: image.sort_order || index
        }));
        
        await supabase
          .from('product_images')
          .insert(imageRecords);
      }
    }
    
    // Update sizes if provided
    if (sizes !== undefined) {
      // First delete existing sizes
      await supabase
        .from('product_size_variants')
        .delete()
        .eq('product_id', productId);
        
      // Then insert new ones
      if (sizes.length > 0) {
        const sizeLinks = sizes.map((sizeId: string) => ({
          product_id: productId,
          size_id: sizeId
        }));
        
        await supabase
          .from('product_size_variants')
          .insert(sizeLinks);
      }
    }
    
    // Update colors if provided
    if (colors !== undefined) {
      // First delete existing colors
      await supabase
        .from('product_color_variants')
        .delete()
        .eq('product_id', productId);
        
      // Then insert new ones
      if (colors.length > 0) {
        const colorLinks = colors.map((colorId: string) => ({
          product_id: productId,
          color_id: colorId
        }));
        
        await supabase
          .from('product_color_variants')
          .insert(colorLinks);
      }
    }
    
    // Update variants if provided
    if (variants !== undefined) {
      // First delete existing variants
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId);
        
      // Then insert new ones
      if (variants.length > 0) {
        const variantRecords = variants.map((variant: any) => ({
          product_id: productId,
          size_id: variant.size_id,
          color_id: variant.color_id,
          inventory_count: variant.inventory_count || 0,
          price_adjustment: variant.price_adjustment || 0
        }));
        
        await supabase
          .from('product_variants')
          .insert(variantRecords);
      }
    }
    
    return NextResponse.json({
      data: { id: productId },
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    console.error('Server error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete a product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin access
  if (!await isAdmin(req)) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 403 }
    );
  }

  const supabase = createServiceRoleClient();
  const productId = params.id;
  
  try {
    // Check if product exists
    const { data: existingProduct, error: existingError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();
      
    if (existingError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete product - This should cascade delete related records if set up properly in the database
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
      
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Server error deleting product:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
