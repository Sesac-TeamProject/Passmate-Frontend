import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ServiceGate } from "@/components/common/service-gate";
import { SessionBootstrap } from "@/components/common/session-bootstrap";
import { QueryProvider } from "@/components/providers/query-provider";

/**
 * 디자인 시스템 v5 글꼴 — Pretendard (pretendard 패키지).
 *
 * 가변 폰트(PretendardVariable) 한 장이 아니라 **굵기별 정적 파일**을 쓴다. 가변 폰트는 WebKit에서 굵기축이
 * 적용되지 않아 아이폰에서 700(제목 · font-bold)까지 전부 400으로 보였다 — WebKit 렌더링으로 재현,
 * 정적 Bold 파일은 굵게 나온다(2026-09-17). 쓰는 굵기만 싣는다: 400 본문 · 500 heading-sm/label-lg · 600 · 700.
 * next/font 값은 빌드 때 읽으므로 경로를 변수로 빼지 않고 그대로 적는다.
 */
const pretendard = localFont({
  src: [
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2",
      weight: "400",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2",
      weight: "500",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-SemiBold.woff2",
      weight: "600",
    },
    {
      path: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Bold.woff2",
      weight: "700",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PassMate",
  description: "AI 기반 실전형 교육·문제풀이 플랫폼",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`h-full antialiased ${pretendard.variable}`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <QueryProvider>
          <SessionBootstrap />
          <ServiceGate>{children}</ServiceGate>
        </QueryProvider>
      </body>
    </html>
  );
}
