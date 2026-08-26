import { RoleSidebar } from "@/components/layout/role-sidebar";

export default function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  return (
    <div className="flex flex-1">
      <RoleSidebar role="teacher" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
