import { RoleSidebar } from "@/components/layout/role-sidebar";
import { ACCOUNT } from "@/features/me/mock";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <RoleSidebar nav="host" user={ACCOUNT} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
