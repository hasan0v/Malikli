import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    /* other experimental flags here */
  },
  allowedDevOrigins: [
    "http://192.168.56.1:3000", // Existing
    "http://127.0.0.1:3000",     // Add localhost
    "http://127.0.0.1",     // Add localhost
  ],
};

export default nextConfig;
