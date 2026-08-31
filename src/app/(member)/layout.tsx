import { SidebarAccount } from "@/components/layout/sidebar-account";

/** 회원 전용 화면(마이페이지) — 사이드바 레이아웃 */
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <SidebarAccount nav="member" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
