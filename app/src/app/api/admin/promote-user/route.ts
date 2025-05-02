import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createServerClientWithToken } from '@/utils/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    // Extract the authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Auth error in promote-user: No valid authorization header');
      return NextResponse.json({ error: 'Unauthorized: Invalid or missing auth token' }, { status: 401 });
    }
    
    // Get the token from the Authorization header
    const token = authHeader.split(' ')[1];
    
    // Create Supabase client with the auth token
    const supabase = createServerClientWithToken(token);
    
    // Get user from the token
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error in promote-user:', authError);
      return NextResponse.json({ error: 'Unauthorized: User not authenticated' }, { status: 401 });
    }    // Get the service role client for admin actions
    const supabaseAdminClient = createServiceRoleClient();

    // Check if the *requesting* user is an admin
    const { data: requestingUserProfile, error: profileError } = await supabaseAdminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id) // Check the role of the user making the request
      .single();
      
    if (profileError) {
      console.error('Error fetching requesting user profile:', profileError);
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }
    
    // Debug the actual role value to see what we're working with
    console.log('User role in database:', requestingUserProfile?.role);
    
    // Use case-insensitive comparison for role check
    if (!requestingUserProfile?.role || 
        !(requestingUserProfile.role.toUpperCase() === 'ADMIN' || 
          requestingUserProfile.role === 'admin')) {
      console.warn(`Non-admin user ${user.id} with role "${requestingUserProfile?.role}" attempted to promote user.`);
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Requesting user is an admin, proceed with promotion
    let userIdToPromote: string;
    try {
      const body = await req.json();
      userIdToPromote = body.userId;

      if (!userIdToPromote) {
        throw new Error('User ID to promote is required');
      }    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Invalid request body' }, { status: 400 });
    }
    
    // Use admin client to update the target user's role
    try {
      // Check the schema first - what role value is in the DB for the admin user?
      const { data: adminCheck } = await supabaseAdminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('Current admin user role format:', adminCheck?.role);
      
      // Use the same role format that's already working for the current admin
      const roleValue = adminCheck?.role || 'ADMIN';
      
      const { data: updatedProfile, error: updateError } = await supabaseAdminClient
        .from('profiles')
        .update({ role: roleValue }) // Use the same role format found in DB
        .eq('id', userIdToPromote)
        .select('id, role') // Select only necessary fields
        .single();

      if (updateError) {
        console.error('Error updating user role:', updateError);
        // Handle potential errors like user not found (PGRST116)
        if (updateError.code === 'PGRST116') {
           return NextResponse.json({ error: 'User profile to promote not found' }, { status: 404 });
        }
        return NextResponse.json({ error: `Failed to promote user: ${updateError.message}` }, { status: 500 });
      }

      // No need to check !updatedProfile if .single() didn't error and wasn't PGRST116

      return NextResponse.json({
        message: 'User promoted to admin successfully',
        user: updatedProfile
      });

    } catch (error: any) {
      console.error('Unexpected error promoting user:', error);
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in promote-user:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
