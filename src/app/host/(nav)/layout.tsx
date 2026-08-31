import { SidebarAccount } from "@/components/layout/sidebar-account";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1">
      <SidebarAccount nav="host" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
