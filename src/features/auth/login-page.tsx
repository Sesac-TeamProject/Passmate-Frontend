import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { FitToViewport } from "@/components/common/fit-to-viewport";
import { Button } from "@/components/ui/button";

type Props = {
  onGoogleClick?: () => void;
};

/**
 * C-01 로그인 (웹) — 가운데 카드형. 렌더 전용, 상태는 app/(bare)/login/page.tsx가 소유.
 *
 * 이메일 로그인·회원가입·비밀번호 찾기는 **API 명세서 v2에서 "(보류) — Google 로그인으로 대체"**로
 * 확정돼 걷어냈다(우선순위 6). Google 로그인이 회원가입을 겸한다 — 미가입이면 서버가 자동 가입한다.
 *
 * 시안(b6JNW)은 1440×900에 상하 여백 74 — 뷰포트가 그보다 낮으면 FitToViewport가 전체를 비율 유지 축소해 스크롤을 없앤다.
 */
export function LoginPage({ onGoogleClick }: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <FitToViewport className="flex flex-col items-center gap-5 py-[74px]">
        <p className="text-body-md text-muted-foreground">혼자 시작한 공부, 함께하는 합격까지.</p>

        <div className="flex w-[420px] flex-col gap-6 rounded-[20px] border bg-card p-10">
          <BrandLogo size="lg" />

          <div className="flex flex-col gap-1.5">
            <h1 className="text-heading-lg text-ink">로그인</h1>
            <p className="text-body-md text-muted-foreground">
              선생님 · 학생 모두 같은 계정으로 시작해요
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="xl"
            className="w-full gap-2 bg-card"
            onClick={onGoogleClick}
          >
            <span aria-hidden className="text-label-lg text-blue">
              G
            </span>
            <span className="text-label-lg text-foreground">Google로 계속하기</span>
          </Button>
        </div>

        <p className="flex items-center gap-1">
          <span className="text-body-md text-muted-foreground">방 코드만 있다면</span>
          <Link href="/join" className="text-label-lg text-mint">
            PIN으로 게스트 입장 →
          </Link>
        </p>
      </FitToViewport>
    </main>
  );
}
