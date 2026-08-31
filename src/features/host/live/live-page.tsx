"use client";

import { PttButton } from "@/components/common/ptt-button";
import { QUESTION_TYPE_LABEL } from "@/features/host/editor/question-type-chip";
import type { LiveQuestion } from "@/features/host/types";
import { cn } from "@/lib/utils";
import { ChoiceLetter } from "./choice-letter";
import { Countdown } from "./countdown";
import { ProjectorShell } from "./projector-shell";

type Props = {
  question: LiveQuestion;
  /** 제출 현황의 분모 — 방에 들어와 있는 학생 수 */
  totalCount: number;
  isLocked: boolean;
  /** 마지막 문항이면 "다음 문항" 자리에 "세션 종료"를 놓는다 */
  isLastQuestion: boolean;
  onNext: () => void;
  onEndCurrent: () => void;
  onEndSession: () => void;
  onToggleLock: () => void;
  onHint: (clip: Blob, durationMs: number) => void;
  onHintError?: (message: string) => void;
  hintUploading?: boolean;
  /** 진행 제어 요청 중 — 버튼을 잠근다 */
  pending?: boolean;
  /** 실시간 연결이 끊겨 다시 붙는 중 */
  reconnecting?: boolean;
  /** 힌트 업로드 실패 등 하단 안내 문구 */
  errorMessage?: string | null;
  /** 타이머를 시안 숫자에서 멈춘다 — 랜딩 목업용 */
  frozen?: boolean;
};

const CONTROL = "flex h-[46px] items-center rounded-xl text-label-lg transition-colors";

/** W-05 진행 (프로젝터 · 기본형) — 민트 배경, 문항·선택지·타이머·제출 현황·PTT */
export function LivePage({
  question: q,
  totalCount,
  isLocked,
  isLastQuestion,
  onNext,
  onEndCurrent,
  onEndSession,
  onToggleLock,
  onHint,
  onHintError,
  hintUploading = false,
  pending = false,
  reconnecting = false,
  errorMessage = null,
  frozen = false,
}: Props) {
  return (
    <ProjectorShell
      top={
        <>
          <div className="flex items-center gap-3">
            <span className="text-heading-lg">
              Q{q.index} / {q.total}
            </span>
            <span className="rounded-full bg-mint-tint px-3 py-[5px] text-label-lg text-mint-dark">
              {QUESTION_TYPE_LABEL[q.type]}
            </span>
            {reconnecting && (
              // TODO(design): DESIGN_GAPS W-05 — 연결 상태 배지는 시안에 없어 임시 스타일
              <span
                role="status"
                className="rounded-full bg-warning-soft px-3 py-[5px] text-label-lg text-warning"
              >
                연결 다시 맞추는 중…
              </span>
            )}
          </div>
          <ol className="flex items-center gap-[5px]" aria-label="진행도">
            {Array.from({ length: q.total }, (_, i) => (
              <li
                key={i}
                className={cn("h-2 rounded", i < q.index ? "w-[22px] bg-yellow" : "w-2.5 bg-mint")}
              />
            ))}
          </ol>
        </>
      }
      bottom={
        /* 3열 그리드: PTT 버튼을 좌우 요소 폭과 무관하게 화면 정중앙에 */
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
          <p className="flex items-center gap-2">
            <span className="text-heading-sm text-muted-foreground">제출</span>
            <span className="text-heading-md">
              {q.submitted} / {totalCount}
            </span>
          </p>
          <div className="flex flex-col items-center gap-1">
            <PttButton
              onRecorded={onHint}
              onError={onHintError}
              uploading={hintUploading}
              disabled={frozen}
            />
            {errorMessage && (
              <p role="alert" className="text-label-md text-negative">
                {errorMessage}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2.5 justify-self-end">
            <button
              type="button"
              onClick={onToggleLock}
              disabled={pending}
              aria-pressed={isLocked}
              className={cn(
                CONTROL,
                "border-[1.5px] px-[18px] disabled:opacity-60",
                isLocked ? "border-mint bg-mint-tint text-mint-dark" : "hover:bg-muted",
              )}
            >
              {isLocked ? "잠금 해제" : "화면 잠금"}
            </button>
            <button
              type="button"
              onClick={onEndCurrent}
              disabled={pending}
              className={cn(CONTROL, "border-[1.5px] px-[18px] hover:bg-muted disabled:opacity-60")}
            >
              문항 마감
            </button>
            <button
              type="button"
              onClick={isLastQuestion ? onEndSession : onNext}
              disabled={pending}
              className={cn(
                CONTROL,
                "bg-mint px-6 text-white hover:bg-mint-dark disabled:opacity-60",
              )}
            >
              {isLastQuestion ? "세션 종료" : "다음 문항"}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-1 items-center">
        <section className="relative flex w-[1080px] flex-col gap-7 rounded-[28px] border bg-card px-14 pt-16 pb-11">
          <div className="absolute -top-[38px] left-1/2 flex size-[76px] -translate-x-1/2 items-center justify-center rounded-full border-[7px] border-yellow bg-card">
            {/* key: 문항이 바뀌면 표시용 카운트다운을 새 남은 시간에서 다시 시작한다 */}
            <Countdown
              key={q.index}
              from={q.remaining}
              paused={frozen}
              className="text-display-sm text-mint-dark"
            />
          </div>
          <h1 className="text-center text-display-md text-ink">{q.prompt}</h1>
          <ol className="grid grid-cols-2 gap-3.5">
            {q.choices.map((c) => (
              <li
                key={c.key}
                className="flex h-[72px] items-center gap-4 rounded-2xl bg-muted px-5 text-heading-md text-ink"
              >
                <ChoiceLetter choice={c.key} />
                {c.text}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </ProjectorShell>
  );
}
