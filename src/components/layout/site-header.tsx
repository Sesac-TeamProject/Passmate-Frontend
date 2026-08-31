import { BrandLogo } from "@/components/common/brand-logo";

/** 공통·학생 화면 상단 헤더. 선생님·관리자 화면은 사이드바 레이아웃을 쓰므로 렌더하지 않는다. */
export function SiteHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
        <BrandLogo />
      </div>
    </header>
  );
}
