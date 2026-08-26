import { RoleSidebar } from "@/components/layout/role-sidebar";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1">
      <RoleSidebar role="admin" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
