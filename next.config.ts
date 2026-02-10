import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xc4tl31o6c.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
