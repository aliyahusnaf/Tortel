import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.thetarotlady.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "i0.wp.com",
        pathname: "/www.thetarotlady.com/**",
      },
    ],
  },
};

export default nextConfig;
