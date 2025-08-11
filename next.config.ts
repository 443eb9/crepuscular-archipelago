import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://www.travellings.cn/assets/logo.gif"),
    ],
  },
};

export default nextConfig;
