import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PassMate",
  description: "AI 기반 실전형 교육·문제풀이 플랫폼",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
