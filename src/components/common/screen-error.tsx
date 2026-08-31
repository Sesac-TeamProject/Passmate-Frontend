import { Button } from "@/components/ui/button";

type Props = {
  /** AppError.message처럼 사용자에게 보여도 안전한 문구만 넘긴다. */
  message: string;
  onRetry?: () => void;
  /** 재시도 대신·함께 놓을 액션. 예: 홈으로 가기 링크 */
  children?: React.ReactNode;
};

/** 화면 단위 에러 상태 (규칙 문서 §10). 쿼리 실패·권한 거부에 쓴다. */
export function ScreenError({ message, onRetry, children }: Props) {
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-4 p-10">
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
}
