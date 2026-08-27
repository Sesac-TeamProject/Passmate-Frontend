import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/** 디자인 시스템 v5 글꼴 — Pretendard Variable (pretendard 패키지, 가변 45~920) */
const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920",
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
      <body className="flex min-h-full flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
