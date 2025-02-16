import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, {}) => {
    config.resolve.symlinks = false;
    return config;
  }
};

export default nextConfig;
