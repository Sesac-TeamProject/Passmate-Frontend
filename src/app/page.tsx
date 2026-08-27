import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { ROLE_LABEL, ROUTES, type Role } from "@/config/routes";

const ROLE_ORDER: Role[] = ["public", "student", "teacher", "admin"];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-8">
        <div>
          <h1 className="text-heading-lg text-ink">PassMate 화면 목록</h1>
          <p className="text-body-md text-muted-foreground">
            깡통 단계 사이트맵. 각 화면은 <code>src/config/routes.ts</code>에서 관리한다.
          </p>
        </div>
        {ROLE_ORDER.map((role) => (
          <section key={role} className="flex flex-col gap-2">
            <h2 className="text-heading-sm text-ink">{ROLE_LABEL[role]}</h2>
            <ul className="divide-y rounded-lg border">
              {ROUTES.filter((r) => r.role === role).map((r) => (
                <li key={r.path}>
                  <Link href={r.sample} className="flex flex-col gap-0.5 px-4 py-3 hover:bg-muted">
                    <span className="text-label-lg text-ink">{r.title}</span>
                    <span className="font-mono text-label-md text-muted-foreground">{r.path}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </>
  );
}
