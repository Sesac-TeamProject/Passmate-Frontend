import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo, BrandMark } from "@/components/common/brand-logo";
import { FitToViewport } from "@/components/common/fit-to-viewport";
import { Mascot } from "@/components/common/mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LEGAL_DOCUMENTS } from "@/features/legal/legal-documents";

/** 동의 안내 문장 안의 문서 링크. 문장과 같은 크기로 두고 밑줄로만 링크임을 알린다 */
const LEGAL_LINK = "underline underline-offset-2 hover:text-muted-foreground";

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
  /** "Google로 계속하기" 버튼. GIS 배선을 포함하므로 컨테이너가 GoogleLoginButton으로 넘긴다 */
  googleButton: ReactNode;
  devLogin?: DevLoginPanel;
};

/**
 * C-01 로그인 (웹) — 가운데 카드형. 렌더 전용, 상태는 app/(bare)/login/page.tsx가 소유.
 *
 * 이메일 로그인·회원가입·비밀번호 찾기는 **API 명세서 v2에서 "(보류) — Google 로그인으로 대체"**로
 * 확정돼 걷어냈다(우선순위 6). Google 로그인이 회원가입을 겸한다 — 미가입이면 서버가 자동 가입한다.
 *
 * 시안(b6JNW)은 1440×900에 상하 여백 74 — 뷰포트가 그보다 낮으면 FitToViewport가 전체를 비율 유지 축소해 스크롤을 없앤다.
 *
 * 폰 폭(768px 미만)은 앱 시안 C-01 로그인(349:9040)을 따른다 — 민트 바탕 위 마스코트 · 로고 · 두 줄 문구,
 * 그 아래 위 모서리가 둥근 흰 시트에 Google · 게스트 입장 · 약관 안내. 카드를 두 벌 그리지 않고 max-md 클래스로
 * 시트 모양만 입힌다 — Google 버튼은 GIS 버튼을 겹쳐 둔 부품이라 한 화면에 하나만 있어야 한다.
 * 시안의 "Apple로 계속하기"는 그리지 않는다 — 서버 로그인이 Google 하나뿐이다.
 */
export function LoginPage({ googleButton, devLogin }: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background max-md:min-h-dvh max-md:items-stretch max-md:justify-start max-md:bg-mint-bg">
      <FitToViewport className="flex flex-col items-center gap-5 py-[74px] max-md:flex-1 max-md:items-stretch max-md:gap-0 max-md:py-0">
        <p className="text-body-md text-muted-foreground max-md:hidden">
          혼자 시작한 공부, 함께하는 합격까지.
        </p>

        {/* 폰 폭 상단(앱 C-01) — 남는 높이를 이 칸이 가져가 시트를 화면 아래에 붙인다 */}
        <header className="flex flex-1 flex-col items-center gap-3.5 px-7 pt-[72px] pb-9 md:hidden">
          <Mascot variant="default" className="h-[132px] w-[120px]" />
          <span className="flex items-center gap-2">
            <BrandMark size={32} />
            <span className="text-display-sm text-ink">패스메이트</span>
          </span>
          <p className="text-center text-body-md text-muted-foreground">
            혼자 시작한 공부,
            <br />
            함께하는 합격까지.
          </p>
        </header>

        <div className="flex w-[420px] flex-col gap-6 rounded-[20px] border bg-card p-10 max-md:w-auto max-md:gap-5 max-md:rounded-t-[28px] max-md:rounded-b-none max-md:border-0 max-md:px-6 max-md:pt-12 max-md:pb-[max(77px,env(safe-area-inset-bottom))]">
          <BrandLogo size="lg" className="max-md:hidden" />

          {/* 폰 시안에는 "로그인" 제목이 없다 — 화면에서만 감추고 화면 낭독기에는 남긴다 */}
          <div className="flex flex-col gap-1.5 max-md:sr-only">
            <h1 className="text-heading-lg text-ink">로그인</h1>
            <p className="text-body-md text-muted-foreground">
              선생님 · 학생 모두 같은 계정으로 시작해요
            </p>
          </div>

          {googleButton}

          {/* 시안 C-01: 게스트 입장은 카드 밖 링크가 아니라 "또는" 아래의 두 번째 버튼이다 */}
          <div className="flex items-center gap-3 max-md:gap-2.5">
            <span aria-hidden className="h-px flex-1 bg-border" />
            <span className="text-label-md text-ink-disabled">또는</span>
            <span aria-hidden className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-3 max-md:gap-5">
            {/*
              시안 C-01: 연한 민트 판 위 진한 민트 글자(볼드). 규격(h48·r12)은 위 Google 버튼과 같아야 해서
              베끼지 않고 같은 size="xl" 을 쓴다 — 색만 시안 값으로 덮는다. 폰 시안은 두 버튼 모두 h56·r14에 label-lg 굵기.
            */}
            <Button
              size="xl"
              variant="secondary"
              className="w-full bg-mint-bg font-bold hover:bg-mint-tint max-md:h-14 max-md:rounded-[14px] max-md:font-semibold"
              nativeButton={false}
              render={<Link href="/join" />}
            >
              <span className="max-md:hidden">PIN으로 게스트 입장</span>
              <span className="md:hidden">PIN으로 바로 입장 (게스트)</span>
            </Button>
            <p className="text-center text-label-md text-ink-disabled">
              계속하면{" "}
              <Link href={LEGAL_DOCUMENTS.terms.path} className={LEGAL_LINK}>
                이용약관
              </Link>
              과{" "}
              <Link href={LEGAL_DOCUMENTS.privacy.path} className={LEGAL_LINK}>
                개인정보 처리방침
              </Link>
              에 동의한 것으로 봅니다
              <span className="block md:hidden">
                선생님·학생 공용 계정 · 게스트 기록은 세션 후 사라져요
              </span>
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
