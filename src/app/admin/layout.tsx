import { RoleSidebar } from "@/components/layout/role-sidebar";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1">
      <RoleSidebar role="admin" user={{ name: "관리자", initial: "관" }} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
