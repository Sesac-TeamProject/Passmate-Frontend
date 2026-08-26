import { RoleSidebar } from "@/components/layout/role-sidebar";
import { MEMBER } from "@/features/student/mock";

/** 회원 전용 화면(마이페이지) — 사이드바 레이아웃 */
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <RoleSidebar nav="member" user={MEMBER} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
