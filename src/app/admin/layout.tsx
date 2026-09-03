import { RequireAuth } from "@/components/common/require-auth";
import { AdminSidebar } from "@/features/admin/layout/admin-sidebar";

/**
 * 관리자 셸. 로그인 + isAdmin 가드를 통과해야 사이드바·화면이 보인다 (규칙 문서 §2-1).
 * `theme-admin`: 관리자 시안 팔레트(어두운 사이드바·흰 배경 등)를 /admin 하위에만 적용한다 (globals.css).
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <RequireAuth adminOnly>
      <div className="theme-admin flex flex-1 bg-canvas text-foreground">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </RequireAuth>
  );
}
