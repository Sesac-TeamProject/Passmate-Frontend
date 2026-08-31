import type { NextConfig } from "next";
import { REDIRECTS } from "./src/config/routes";

const nextConfig: NextConfig = {
  async redirects() {
    return REDIRECTS.map((r) => ({
      source: r.from,
      destination: r.to,
      permanent: false,
    }));
  },
};

export default nextConfig;
