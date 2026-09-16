import { SiteHeader } from "@/components/layout/site-header";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 폰 폭(768px 미만)은 앱 시안처럼 화면마다 자기 머리(← 제목)를 그린다 — 웹 상단바를 걷는다 */}
      <SiteHeader className="max-md:hidden" />
      {children}
    </>
  );
}
