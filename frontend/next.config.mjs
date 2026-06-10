/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.overtimemarkets.xyz' },
    ],
  },
};

export default nextConfig;
