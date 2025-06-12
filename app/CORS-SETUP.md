# Supabase Authentication Configuration

This file provides instructions for fixing CORS issues with Supabase authentication in your development environment.

## Current Issue

You are experiencing CORS errors when the application tries to refresh authentication tokens with Supabase. This happens because Supabase's authentication API doesn't have the correct CORS settings for your local development environment.

## How to Fix It

### Option 1: Apply CORS Settings in Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard: https://app.supabase.com/
2. Navigate to your project: Malikli
3. Go to Project Settings → API
4. Scroll down to the "CORS" section
5. Add the following origins to the allowed list:
   - http://localhost:3000
   - http://localhost:3001
   - http://127.0.0.1:3000
   - http://127.0.0.1:3001
   - https://malikli1992.com (for production)
6. Make sure "Authorization" is included in the allowed headers
7. Save the changes
8. Restart your Next.js development server

### Option 2: Use the API Proxy (Already Implemented)

We've created a proxy endpoint in your application that forwards authentication requests to Supabase. This helps bypass CORS restrictions.

The proxy is located at:
- `/api/supabase-proxy/auth/v1/token`

To use it, you would need to modify the Supabase client initialization to use this endpoint for token refreshing, but this would require more advanced changes to the library configuration.

### Option 3: Use CORS Browser Extensions During Development

As a temporary solution, you can use browser extensions that disable CORS restrictions:
- For Chrome: "CORS Unblock" or "Allow CORS: Access-Control-Allow-Origin"
- For Firefox: "CORS Everywhere"

⚠️ **Important:** Only use these extensions during development. Disable them when browsing other websites.

## Troubleshooting

If you continue to experience issues:

1. Clear browser cookies and local storage
2. Try using an incognito/private browser window
3. Check the network tab in developer tools to see the exact CORS errors
4. Verify that the CORS settings in Supabase match your development environment
