import { RoleSidebar } from "@/components/layout/role-sidebar";
import { TEACHER } from "@/features/teacher/mock";

export default function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  return (
    <div className="flex flex-1">
      <RoleSidebar role="teacher" user={TEACHER} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
