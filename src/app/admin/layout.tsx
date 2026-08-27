import { RequireAuth } from "@/components/common/require-auth";
import { AdminSidebar } from "@/features/admin/layout/admin-sidebar";

/** 관리자 셸. 로그인 + role=ADMIN 가드를 통과해야 사이드바·화면이 보인다 (규칙 문서 §2-1). */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <RequireAuth role="ADMIN">
      <div className="flex flex-1 bg-canvas">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </RequireAuth>
  );
}
