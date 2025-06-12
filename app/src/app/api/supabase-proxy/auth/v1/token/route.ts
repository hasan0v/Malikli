import { NextRequest, NextResponse } from 'next/server';

// This proxy endpoint handles Supabase auth token refreshing
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',  // In production, set this to your specific domains
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
  }

  try {
    // Forward the request to Supabase
    const searchParams = req.nextUrl.searchParams;
    const grantType = searchParams.get('grant_type');
    
    if (!grantType) {
      return NextResponse.json({ error: 'Missing grant_type parameter' }, { status: 400 });
    }

    // Get the same URL path and query from the original request
    const tokenEndpoint = `${supabaseUrl}/auth/v1/token?grant_type=${grantType}`;

    // Forward headers and body
    const headers = new Headers(req.headers);
    headers.set('apikey', supabaseAnonKey);
    
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${supabaseAnonKey}`);
    }

    // Clone the request body
    const body = await req.text();
    
    // Make request to Supabase
    const supabaseResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers,
      body
    });

    // Get response data
    const data = await supabaseResponse.json();
    
    // Copy status and headers from Supabase response
    const response = NextResponse.json(data, { status: supabaseResponse.status });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');  // In production, set to specific domains
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info');
    
    return response;
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
