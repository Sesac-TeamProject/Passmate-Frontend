import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";

/**
 * E-404 없는 페이지 (design.pen "04 · 상태 · 오류 — 웹" 프레임 snt8i).
 *
 * 시안 규칙: 브랜드는 유지하되 사용자가 돌아갈 길을 반드시 둔다.
 * 문구는 04 보드의 "세 줄 규칙" — 무엇이 잘못됐는지 → 지금 뭘 하면 되는지 → 끝.
 * 사과·오류코드·전문용어를 쓰지 않으므로 "404 Not Found" 같은 말은 넣지 않는다
 * (숫자 404는 글이 아니라 배경 장식이라 aria-hidden으로 읽히지 않게 뺀다).
 */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="px-20 py-5">
        <BrandLogo />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-24 text-center">
        {/* 시안은 96px이지만 타이포 10종에 그 크기가 없어 가장 큰 display-2xl(64px)로 맞췄다 */}
        <p aria-hidden className="text-display-2xl leading-none text-mint-tint">
          404
        </p>

        <h1 className="text-display-md text-ink">이 주소에는 아무것도 없어요</h1>
        <p className="text-body-lg text-muted-foreground">
          주소가 바뀌었거나 방이 이미 지워졌을 수 있어요.
        </p>

        <div className="mt-3 flex items-center gap-3">
          <Button size="xl" nativeButton={false} render={<Link href="/" />}>
            홈으로
          </Button>
          <Button size="xl" variant="outline" nativeButton={false} render={<Link href="/join" />}>
            PIN으로 입장
          </Button>
        </div>
      </div>
    </main>
  );
}
