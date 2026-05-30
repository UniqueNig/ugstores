import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow next/image to optimise images from these external hosts.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" }, // product uploads
      { protocol: "https", hostname: "images.unsplash.com" }, // demo imagery
    ],
  },
};

export default nextConfig;
