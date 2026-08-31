import type { NextConfig } from "next";
import { F1_REMOTE_IMAGE_HOSTS } from "./src/data/f1ImageHosts";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: F1_REMOTE_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
};

export default nextConfig;
