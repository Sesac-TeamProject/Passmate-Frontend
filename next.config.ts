import type { NextConfig } from "next";
import { REDIRECTS } from "./src/config/routes";

const nextConfig: NextConfig = {
  // Docker 배포용 — 서버와 실제로 쓰는 node_modules 만 .next/standalone 에 모아 준다.
  // 이게 없으면 이미지에 node_modules 전체(1GB 대)를 넣어야 한다.
  output: "standalone",

  async redirects() {
    return REDIRECTS.map((r) => ({
      source: r.from,
      destination: r.to,
      permanent: false,
    }));
  },
};

export default nextConfig;
