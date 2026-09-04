"use client";

import { PttButton } from "@/components/common/ptt-button";
import { ReconnectingBanner } from "@/components/common/reconnecting-banner";
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
    <>
      {/* 07 보드 "실시간 재연결" — 진행 중인 문항을 가리지 않도록 화면 맨 위 얇은 띠로만 알린다 */}
      {reconnecting && (
        <div className="fixed inset-x-0 top-0 z-50">
          <ReconnectingBanner />
        </div>
      )}
      <ProjectorShell
        rail={<LiveRail students={students} submittedCount={q.submitted} />}
        railCollapsed={<LiveRailMini students={students} submittedCount={q.submitted} />}
        top={
          <>
            <QuestionRail current={q.index} total={q.total} />
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
              {/*
                음성 힌트(PTT). 예전에는 `IS_MOCK`일 때만 보여 줬는데, 그 이유(백엔드에 `voicehint`
                패키지가 없어 실서버 404)가 사라졌다 — 백엔드에 구현됐고 업로드 시그니처도 맞췄다
                (파트 이름 `file`, `durationMs`는 쿼리). 게이트를 닫아 두면 고친 경로를 아무도 못 탄다.

                TODO(design): 새 시안 하단바는 "정답 공개 / 다음 문항" 2개뿐이고 PTT·화면 잠금이 없다.
                PTT 플로우 시트는 "선생님 웹 · W-05"에서 누른다고 못박아 서로 어긋난다 —
                디자이너 확인 전까지 두 조작을 남겨 둔다(HANDOVER 결정 1번).
              */}
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
          <span>{q.points}점</span>
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
    </>
  );
}
