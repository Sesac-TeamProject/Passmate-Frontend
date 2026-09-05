import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { FitToViewport } from "@/components/common/fit-to-viewport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * 개발용 로그인(`POST /auth/dev-login`) 패널. 로컬·dev 백엔드에만 있는 API라
 * 컨테이너가 넘기지 않으면 아예 그리지 않는다.
 */
export type DevLoginPanel = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  pending: boolean;
  /** 실패 문구. 운영 서버면 404라 "이 서버에는 없는 기능"으로 안내한다 */
  errorMessage: string | null;
};

type Props = {
  onGoogleClick?: () => void;
  devLogin?: DevLoginPanel;
};

/**
 * C-01 로그인 (웹) — 가운데 카드형. 렌더 전용, 상태는 app/(bare)/login/page.tsx가 소유.
 *
 * 이메일 로그인·회원가입·비밀번호 찾기는 **API 명세서 v2에서 "(보류) — Google 로그인으로 대체"**로
 * 확정돼 걷어냈다(우선순위 6). Google 로그인이 회원가입을 겸한다 — 미가입이면 서버가 자동 가입한다.
 *
 * 시안(b6JNW)은 1440×900에 상하 여백 74 — 뷰포트가 그보다 낮으면 FitToViewport가 전체를 비율 유지 축소해 스크롤을 없앤다.
 */
export function LoginPage({ onGoogleClick, devLogin }: Props) {
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

          {/* 시안 C-01: 게스트 입장은 카드 밖 링크가 아니라 "또는" 아래의 두 번째 버튼이다 */}
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px flex-1 bg-border" />
            <span className="text-label-md text-muted-foreground">또는</span>
            <span aria-hidden className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/join"
              className="flex h-13 items-center justify-center rounded-[14px] bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark"
            >
              PIN으로 게스트 입장
            </Link>
            {/*
              약관·개인정보처리방침 문서가 아직 없다 — 페이지를 만들기 전에 링크를 걸면 404다.
              문서가 생기면 이 문장의 두 이름에 링크를 건다.
            */}
            <p className="text-center text-label-md text-muted-foreground">
              계속하면 이용약관과 개인정보처리방침에 동의하는 것으로 봐요
            </p>
          </div>

          {devLogin ? (
            <form
              className="flex flex-col gap-2 border-t pt-5"
              onSubmit={(event) => {
                event.preventDefault();
                devLogin.onSubmit();
              }}
            >
              <label htmlFor="dev-login-key" className="text-label-md text-muted-foreground">
                개발용 로그인 — 같은 key면 같은 계정으로 들어가요
              </label>
              <div className="flex gap-2">
                <Input
                  id="dev-login-key"
                  value={devLogin.value}
                  onChange={(event) => devLogin.onChange(event.target.value)}
                  placeholder="host1"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={devLogin.pending || devLogin.value.trim() === ""}
                >
                  {devLogin.pending ? "들어가는 중" : "입장"}
                </Button>
              </div>
              {devLogin.errorMessage ? (
                <p className="text-label-md text-destructive">{devLogin.errorMessage}</p>
              ) : null}
            </form>
          ) : null}
        </div>
      </FitToViewport>
    </main>
  );
}
