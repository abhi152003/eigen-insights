/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all external domains
      },
    ],
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
