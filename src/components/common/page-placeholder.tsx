import { Badge } from "@/components/ui/badge";
import { getRoute, AREA_LABEL } from "@/config/routes";

type Props = {
  /** routes.ts에 등록된 path. 예: "/host/dashboard" */
  path: string;
};

/** 깡통 단계의 모든 페이지가 렌더하는 공통 자리표시자. 실제 화면 구현 시 이 컴포넌트를 교체한다. */
export function PagePlaceholder({ path }: Props) {
  const route = getRoute(path);
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-8">
      <div>
        <Badge variant="outline">{AREA_LABEL[route.area]}</Badge>
      </div>
      <h1 className="text-heading-lg text-ink">{route.title}</h1>
      <p className="text-body-md text-muted-foreground">{route.description}</p>
      <p className="font-mono text-label-md text-muted-foreground">{route.path}</p>
      <div className="rounded-lg border border-dashed p-10 text-center text-body-md text-muted-foreground">
        구현 예정
      </div>
    </main>
  );
}
