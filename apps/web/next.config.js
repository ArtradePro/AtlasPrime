/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@atlas/shared"],
  images: {
    domains: ["localhost"],
  },
};

module.exports = nextConfig;
