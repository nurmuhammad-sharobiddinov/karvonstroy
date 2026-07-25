/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
