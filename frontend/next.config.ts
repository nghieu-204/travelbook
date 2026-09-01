import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.169', 'localhost', '127.0.0.1'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'travel.com.vn' },
      { protocol: 'https', hostname: 'loremflickr.com' }
    ]
  }
};

export default nextConfig;
