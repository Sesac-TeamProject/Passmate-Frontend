import { RequireAuth } from "@/components/common/require-auth";
import { MobileTabBar, MobileTabBarInset } from "@/components/layout/mobile-tab-bar";
import { SidebarAccount } from "@/components/layout/sidebar-account";

/** 회원 전용 화면(마이페이지) — 로그인 가드 + 사이드바(PC) · 하단 탭바(폰) 레이아웃 */
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex flex-1">
        <SidebarAccount nav="member" />
        <MobileTabBarInset className="min-w-0 flex-1">{children}</MobileTabBarInset>
        <MobileTabBar />
      </div>
    </RequireAuth>
  );
}
