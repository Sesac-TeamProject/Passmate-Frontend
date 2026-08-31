import { RequireAuth } from "@/components/common/require-auth";
import { SidebarAccount } from "@/components/layout/sidebar-account";

/** 선생님(방 개설·운영) 화면 — 로그인 가드 + 사이드바 레이아웃 */
export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex flex-1">
        <SidebarAccount nav="host" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </RequireAuth>
  );
}
