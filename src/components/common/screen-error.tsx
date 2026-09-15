import Link from "next/link";
import { FailureScreen } from "@/components/common/failure-screen";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 폰 폭(768px 미만)에서 앱 상태 화면(05 · 상태 · 오류 — 앱, M-05e · M-06e)으로 보여 줄 때의 문구.
 * 04 보드 규칙대로 무엇이 잘못됐는지 → 지금 뭘 하면 되는지 두 줄.
 */
type MobileFailure = {
  /** 상단 줄 화면 이름 — "최종 결과" · "리포트" */
  screenTitle: string;
  backHref?: string;
  title: string;
  description: string;
  /** 아래 흐린 안내. 지키지 못할 약속(게스트에게 "마이에서 다시 보기")이면 넘기지 않는다 */
  footnote?: string;
  /** 두 번째 버튼 "홈으로"가 갈 곳 — 회원은 /home, 게스트는 / */
  homeHref: string;
};

type Props = {
  /** AppError.message처럼 사용자에게 보여도 안전한 문구만 넘긴다. */
  message: string;
  onRetry?: () => void;
  /** 재시도 대신·함께 놓을 액션. 예: 홈으로 가기 링크 */
  children?: React.ReactNode;
  /** 주면 폰 폭에서만 앱 상태 화면 배치로 그린다. PC는 아래 기본 배치 그대로다 */
  mobile?: MobileFailure;
};

/** 화면 단위 에러 상태 (규칙 문서 §10). 쿼리 실패·권한 거부에 쓴다. */
export function ScreenError({ message, onRetry, children, mobile }: Props) {
  const desktop = (
    <div
      role="alert"
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 p-10",
        mobile && "max-md:hidden",
      )}
    >
      <p className="text-label-lg text-foreground">{message}</p>
      <div className="flex items-center gap-2">
        {onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            다시 시도
          </Button>
        ) : null}
        {children}
      </div>
    </div>
  );

  if (!mobile) return desktop;

  return (
    <>
      {desktop}
      <div className="flex flex-1 flex-col md:hidden">
        <FailureScreen
          mobileHeader={{ title: mobile.screenTitle, backHref: mobile.backHref }}
          title={mobile.title}
          description={mobile.description}
          footnote={mobile.footnote}
          actions={
            <>
              {onRetry ? (
                <Button size="xl" className="h-[52px] rounded-[14px]" onClick={onRetry}>
                  다시 시도
                </Button>
              ) : null}
              <Button
                size="xl"
                variant="outline"
                className="h-[52px] rounded-[14px]"
                nativeButton={false}
                render={<Link href={mobile.homeHref} />}
              >
                홈으로
              </Button>
            </>
          }
        />
      </div>
    </>
  );
}
