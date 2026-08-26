import { RoleSidebar } from "@/components/layout/role-sidebar";
import { TEACHER } from "@/features/teacher/mock";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <RoleSidebar nav="teacher" user={TEACHER} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
