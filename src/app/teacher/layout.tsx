import { RoleSidebar } from "@/components/layout/role-sidebar";

export default function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  return (
    <div className="flex flex-1">
      <RoleSidebar role="teacher" user={{ name: "이한결", initial: "한" }} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
