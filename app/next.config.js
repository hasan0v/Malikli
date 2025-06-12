// @ts-check
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-35550ce72242479c94b89ac1b31a6f3f.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', 'ali-hasanov.com', '*.ali-hasanov.com', 'vercel.com', '*.vercel.com', '185-237-14-81.cloud-xip.com', '*.185-237-14-81.cloud-xip.com', 'iris-rose.online', '*.iris-rose.online', 'malikli1992.com', '*.malikli1992.com'],
  
  // Add async headers configuration to handle CORS
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Adjust this in production to be more specific
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Client-Info',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig