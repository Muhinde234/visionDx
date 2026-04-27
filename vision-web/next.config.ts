import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vision-bn.onrender.com",
      },
    ],
  },

  // Silence the "image used with unoptimized blob URL" warning globally
  // (local previews use plain <img> instead, so this only applies to remote images)
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
};

export default nextConfig;
