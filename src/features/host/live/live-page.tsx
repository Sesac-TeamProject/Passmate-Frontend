"use client";

import { PttButton } from "@/components/common/ptt-button";
import { QUESTION_TYPE_LABEL } from "@/features/host/editor/question-type-chip";
import type { LiveQuestion } from "@/features/host/types";
import { cn } from "@/lib/utils";
import { ChoiceRow, type ChoiceRowState } from "./choice-row";
import { LiveRail, LiveRailMini, type SolvingStudent } from "./live-rail";
import { ProjectorShell } from "./projector-shell";
import { QuestionRail } from "./question-rail";
import { Timer } from "./timer";

type Props = {
  question: LiveQuestion;
  /** 보기별 실시간 응답 수. 계약이 보기 순서대로 준다 */
  counts: number[];
  /** 제출 여부가 붙은 참가자 목록 */
  students: SolvingStudent[];
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

const CONTROL = "flex h-13 items-center rounded-2xl text-heading-sm font-bold transition-colors";

/**
 * W-05 진행 (프로젝터) — 헤더에 문항 레일과 타이머, 본문에 문항과 실시간 응답 분포,
 * 오른쪽 레일에 제출 현황.
 */
export function LivePage({
  question: q,
  counts,
  students,
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
  const maxCount = Math.max(...counts, 0);
  // 정답을 공개하기 전이라 "정답"이 아니라 "지금 가장 많이 고른 보기"를 강조한다
  const leadingIndex = maxCount > 0 ? counts.indexOf(maxCount) : -1;

  return (
    <ProjectorShell
      rail={<LiveRail students={students} />}
      railCollapsed={<LiveRailMini students={students} />}
      top={
        <>
          <div className="flex items-center gap-6">
            <QuestionRail current={q.index} total={q.total} />
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
          {/* key: 문항이 바뀌면 새 남은 시간에서 다시 시작한다 */}
          <Timer key={q.index} remaining={q.remaining} total={q.seconds} paused={frozen} />
        </>
      }
      bottom={
        <>
          {errorMessage ? (
            <p role="alert" className="text-body-md text-negative">
              {errorMessage}
            </p>
          ) : (
            <p className="text-body-md text-muted-foreground">
              제출한 학생만 다음 문항으로 넘어가요
            </p>
          )}
          <div className="flex items-center gap-5">
            {/* TODO(design): 새 시안 하단바는 "정답 공개 / 다음 문항" 2개뿐이고 PTT·화면 잠금이 없다.
                프로젝터 규칙 카드는 "프로젝터는 아무도 안 만짐"이라 앱 리모컨(M-T2)으로 옮긴 것으로 읽히는데,
                PTT 플로우 시트는 "선생님 웹 · W-05"에서 누른다고 못박아 서로 어긋난다.
                디자이너 확인 전까지 두 조작을 남겨 둔다 — HANDOVER.md 결정 1번. */}
            <PttButton
              onRecorded={onHint}
              onError={onHintError}
              uploading={hintUploading}
              disabled={frozen}
            />
            <button
              type="button"
              onClick={onToggleLock}
              disabled={pending}
              aria-pressed={isLocked}
              className={cn(
                CONTROL,
                "border-[1.5px] px-5 disabled:opacity-60",
                isLocked ? "border-mint bg-mint-tint text-mint-dark" : "hover:bg-muted",
              )}
            >
              {isLocked ? "잠금 해제" : "화면 잠금"}
            </button>
            <button
              type="button"
              onClick={onEndCurrent}
              disabled={pending}
              className={cn(
                CONTROL,
                "w-39 justify-center border-[1.5px] hover:bg-muted disabled:opacity-60",
              )}
            >
              정답 공개
            </button>
            <button
              type="button"
              onClick={isLastQuestion ? onEndSession : onNext}
              disabled={pending}
              className={cn(
                CONTROL,
                "w-44 justify-center bg-mint text-white hover:bg-mint-dark disabled:opacity-60",
              )}
            >
              {isLastQuestion ? "세션 종료" : "다음 문항"}
            </button>
          </div>
        </>
      }
    >
      <div className="mt-8 flex items-center gap-4 text-body-md text-muted-foreground">
        <span className="text-label-md font-bold tracking-[0.08em]">
          {QUESTION_TYPE_LABEL[q.type]}
        </span>
        <span aria-hidden className="h-4 w-px bg-line-soft" />
        <span>1점</span>
        <span aria-hidden className="h-4 w-px bg-line-soft" />
        <span>
          {q.total}문항 중 {q.index}번째
        </span>
      </div>

      <h1 className="mt-4 text-display-lg">{q.prompt}</h1>

      <div className="mt-8 border-t pt-4">
        <ul className="flex flex-col gap-2">
          {q.choices.map((c, i) => {
            const state: ChoiceRowState = i === leadingIndex ? "leading" : "default";
            return (
              <ChoiceRow
                key={c.key}
                no={i + 1}
                text={c.text}
                count={counts[i] ?? 0}
                maxCount={maxCount}
                state={state}
                variant="live"
              />
            );
          })}
        </ul>
      </div>
    </ProjectorShell>
  );
}
