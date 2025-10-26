/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      // 👇 disable it by setting resolveAlias to an empty object
      resolveAlias: {},
    },
  },
  webpack: (config) => config, // leave webpack untouched
};

export default nextConfig;
