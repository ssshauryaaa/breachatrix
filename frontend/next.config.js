/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    appDir: true,
  },

  images: {
    domains: [],
  },

  env: {
    NEXT_PUBLIC_API_URL: "http://localhost:5000/api",
  },
};

module.exports = nextConfig;
