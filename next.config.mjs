/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/historia", destination: "/empresa", permanent: true },
    ];
  },
};

export default nextConfig;
