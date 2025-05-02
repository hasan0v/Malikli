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
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
}

module.exports = nextConfig