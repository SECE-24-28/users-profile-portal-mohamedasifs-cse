/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from any hostname (for uploaded profile images)
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
