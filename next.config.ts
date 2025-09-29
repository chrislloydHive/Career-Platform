import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['src/app', 'src/components', 'src/lib', 'src/types'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
