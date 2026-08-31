"use client";

type Props = {
  onRetry: () => void;
};

/**
 * M-07 연결 끊김·재접속 (앱 시안 → 데스크톱 웹 이식).
 *
 * 시안은 전체 화면이지만 여기서는 풀이 화면 위에 겹친다 — 화면을 통째로 갈아 끼우면
 * 학생이 쓰던 서술형 답안이 언마운트로 날아간다. 잠깐 끊겼다 붙는 경우가 더 흔하다.
 */
export function DisconnectedOverlay({ onRetry }: Props) {
  return (
    <div
      role="alertdialog"
      aria-labelledby="disconnected-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-5 backdrop-blur-sm"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-[28px] border bg-card px-7 pt-9 pb-8">
        <span
          aria-hidden
          className="flex size-20 items-center justify-center rounded-full bg-muted text-display-md text-mint-dark"
        >
          !
        </span>

        <h1 id="disconnected-title" className="text-heading-lg">
          연결이 끊겼어요
        </h1>
        <p className="text-center text-body-md text-muted-foreground">
          네트워크를 확인하고 있어요.
          <br />
          다시 연결되면 진행 중인 문항으로 돌아가요.
        </p>

        <span aria-hidden className="flex items-center gap-1.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-[7px] animate-pulse rounded-full bg-mint"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>

        <button
          type="button"
          onClick={onRetry}
          className="mt-2 h-[50px] w-full rounded-[14px] bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark"
        >
          지금 다시 연결
        </button>
      </div>
    </div>
  );
}
