import Link from "next/link";
import { ROLE_LABEL, routesByRole, type Role } from "@/config/routes";

type Props = { role: Role };

/** 선생님·관리자 레이아웃 좌측 내비게이션. routes.ts에서 해당 역할 라우트를 읽어 그린다. */
export function RoleSidebar({ role }: Props) {
  return (
    <aside className="w-56 shrink-0 border-r p-4">
      <p className="mb-3 text-xs font-semibold text-muted-foreground">{ROLE_LABEL[role]}</p>
      <nav className="flex flex-col gap-1">
        {routesByRole(role).map((r) => (
          <Link
            key={r.path}
            href={r.sample}
            className="rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          >
            {r.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
