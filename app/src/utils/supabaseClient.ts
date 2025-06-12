import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create and export the Supabase client with custom token refresh URL
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Use our local API endpoint for token refresh to avoid CORS issues
    storageKey: 'supabase-auth-token',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-client'
    }
  }
});

// Function to create a Supabase client for server-side operations using the service role key
// Note: Avoid exposing the service role key on the client-side.
export const createAdminClient = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceRoleKey) {
    // In a real app, you might want to handle this more gracefully
    // or ensure this function is only called where the key is guaranteed to be present.
    console.warn("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY. Admin client will not have elevated privileges.");
    // Fallback to anon key client if service key is missing, but this might not be desired.
    // Alternatively, throw an error.
    // throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
    return supabase; // Returning the regular client as a fallback
  }

  // Important: Ensure this client is ONLY used in server-side environments (API routes, getServerSideProps)
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // Optionally configure auth persistence for server-side client if needed,
      // though typically not required for service role operations.
      persistSession: false,
      autoRefreshToken: false,
    }
  });
};
