import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createStandardClient } from '@supabase/supabase-js'; // Import standard client
import { cookies } from 'next/headers';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'; // Import the type

// Function for standard user operations (uses cookies via @supabase/ssr)
export async function createServerSupabaseClient() { // Renamed from createClient for clarity
  const cookieStore: ReadonlyRequestCookies = await cookies();

  // Ensure environment variables are defined
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabaseAnonKey) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }


  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          // Access the resolved cookieStore directly
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Access the resolved cookieStore directly
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignore errors in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Access the resolved cookieStore directly
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignore errors in Server Components
          }
        },
      },
    }
  );
}

// Function for admin/service-role operations (should NOT use cookies for auth) - Revert to sync standard client
export function createServiceRoleClient() {
  // Use standard client with service role key
  return createStandardClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key directly
  );
}

// Function to create a server client with auth token from the request header
export function createServerClientWithToken(authToken: string) {
  return createStandardClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    }
  );
}
