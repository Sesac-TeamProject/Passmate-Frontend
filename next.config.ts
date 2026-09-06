import type { NextConfig } from "next";
import { REDIRECTS } from "./src/config/routes";

const nextConfig: NextConfig = {
  // Docker 배포용 — 서버와 실제로 쓰는 node_modules 만 .next/standalone 에 모아 준다.
  // 이게 없으면 이미지에 node_modules 전체(1GB 대)를 넣어야 한다.
  output: "standalone",

  logging: {
    // 브라우저 console.warn/error를 터미널로 넘기지 않는다 (dev 전용 기능).
    // 넘길 때 Next가 소스 코드프레임을 그리는데, 그 Rust 코드가 한글(멀티바이트) 줄을
    // 터미널 너비 기준 바이트로 잘라 패닉하고 dev 서버가 통째로 죽는다.
    // 예: `/`를 열 때마다 세션 복원 실패 경고 → client.ts:168 "나간다"에서 abort.
    // 수정되면 되돌린다: https://github.com/vercel/next.js/issues/92641
    browserToTerminal: false,
  },

  async redirects() {
    return REDIRECTS.map((r) => ({
      source: r.from,
      destination: r.to,
      permanent: false,
    }));
  },
};

export default nextConfig;
