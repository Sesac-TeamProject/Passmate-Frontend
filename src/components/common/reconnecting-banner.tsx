"use client";

type Props = {
  /** 자동 재연결(지수 백오프)을 기다리지 않고 지금 바로 붙는다. 없으면 문구만 보여준다 */
  onRetry?: () => void;
};

/**
 * 실시간 재연결 띠 (design.pen "07 · 로딩 · 스켈레톤" · pattern/실시간 재연결).
 *
 * 시안 규칙: "실시간 화면(대기실·풀이·프로젝터)은 스켈레톤 대신 얇은 띠 하나.
 * 풀던 문제를 가리지 않습니다."
 *
 * 화면을 덮지도, 갈아 끼우지도 않는다 — 학생이 쓰던 서술형 답안이 언마운트로 날아가지 않는 것이
 * 이 띠를 쓰는 실질적인 이유다.
 */
export function ReconnectingBanner({ onRetry }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-[34px] items-center gap-2.5 bg-warning-soft px-5"
    >
      <span
        aria-hidden
        className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-yellow/25 border-t-yellow"
      />
      <p className="text-label-lg text-warning-strong">연결이 끊겼어요 · 다시 연결하는 중…</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="ml-auto text-label-lg text-warning-strong underline underline-offset-2"
        >
          지금 다시 연결
        </button>
      ) : null}
    </div>
  );
}
