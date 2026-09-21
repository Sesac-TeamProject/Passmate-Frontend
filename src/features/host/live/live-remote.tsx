import { Clock } from "lucide-react";
import { PttButton } from "@/components/common/ptt-button";
import { StudentAvatar } from "@/components/common/student-avatar";
import type { LiveQuestion } from "@/features/host/types";
import { formatPin } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CHOICE_CLASS } from "./choice-letter";
import type { SolvingStudent } from "./live-rail";

/** 문항 유형 칩 — 웹 진행 화면과 같은 말 */
const TYPE_LABEL: Record<LiveQuestion["type"], string> = {
  multiple: "객관식",
  ox: "OX",
  essay: "서술형",
};

/** 아바타 줄에 세우는 최대 인원 — 폰 한 줄에 들어가는 만큼만 세운다 */
const AVATAR_LIMIT = 6;

type Props = {
  question: LiveQuestion;
  counts: number[];
  students: SolvingStudent[];
  isLocked: boolean;
  isLastQuestion: boolean;
  onNext: () => void;
  onEndCurrent: () => void;
  onEndSession: () => void;
  onToggleLock: () => void;
  onHint: (clip: Blob, durationMs: number) => void;
  onHintError?: (message: string) => void;
  hintUploading: boolean;
  pending: boolean;
  reconnecting: boolean;
  errorMessage: string | null;
  /** 방 PIN — 머리글 오른쪽 */
  pin?: string;
  /** 방 제목. 아직 못 불러왔으면 비운다 */
  roomTitle?: string;
};

/**
 * M-T2 진행 리모컨 (앱) — 시안 v6 `03 · 앱` 349:10123. 렌더 전용.
 *
 * "프로젝터는 벽, 폰은 조작" — 웹 진행 화면을 폰에 줄여 넣지 않는다. 벽 화면은 프로젝터가 띄우고
 * 선생님 폰은 교실을 돌며 누르는 리모컨이라, 지문·보기 본문보다 **지금 몇 명이 냈고 무엇을 골랐는지**와
 * **조작 버튼**을 앞에 둔다. 데이터와 조작은 웹 LivePage 와 같은 props 를 그대로 받는다.
 */
export function LiveRemote({
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
  hintUploading,
  pending,
  reconnecting,
  errorMessage,
  pin,
  roomTitle,
}: Props) {
  const total = Math.max(students.length, q.submitted);
  // 학생별 제출 여부는 서버가 주지 않는다(toSolvingStudents 가 전원 false 로 채운다).
  // 시안은 아바타마다 제출 점을 찍지만 그러면 "아무도 안 냈다"는 거짓이 된다 — 합계로만 센다.
  const unsubmittedCount = Math.max(0, total - q.submitted);
  const shown = students.slice(0, AVATAR_LIMIT);
  const maxCount = Math.max(...counts, 0);
  const ratio = q.seconds > 0 ? Math.min(1, Math.max(0, q.remaining / q.seconds)) : 0;

  return (
    <main className="flex min-h-dvh flex-col bg-card md:hidden">
      <header className="flex flex-col gap-2 px-5 pt-14 pb-3">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-heading-sm text-ink">{roomTitle ?? ""}</p>
          {pin && <p className="shrink-0 text-label-lg text-mint-dark">PIN {formatPin(pin)}</p>}
        </div>
        {/*
          시안 문구는 "프로젝터 연결됨 · 벽 화면과 동기화 중"이지만, 앱은 프로젝터가 붙었는지 알 길이 없다.
          아는 것은 실시간 연결뿐이라 그것만 말한다 — 없는 사실을 만들지 않는다.
        */}
        <p
          role="status"
          className={cn(
            "flex items-center gap-1.5 self-start rounded-full py-[5px] pr-3 pl-2.5 text-label-lg",
            reconnecting ? "bg-yellow-soft text-choice-c-foreground" : "bg-mint-bg text-mint-deep",
          )}
        >
          <span
            aria-hidden
            className={cn("size-2 rounded-full", reconnecting ? "bg-yellow" : "bg-mint")}
          />
          {reconnecting ? "다시 연결하는 중…" : "실시간 연결됨 · 벽 화면과 동기화 중"}
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-5 pt-2 pb-6">
        {/* 현재 문항 */}
        <section className="flex flex-col gap-2.5 rounded-[20px] border px-[18px] pt-4 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-heading-sm text-ink">
              Q{q.index} / {q.total}
            </span>
            <span className="rounded-full bg-mint-tint px-2 py-[3px] text-label-lg text-mint-deep">
              {TYPE_LABEL[q.type]}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex h-6 items-center gap-2">
              <Clock size={16} strokeWidth={2} aria-hidden className="text-yellow" />
              <span className="text-heading-sm font-bold text-ink tabular-nums">
                {formatClock(q.remaining)}
              </span>
              <span className="ml-auto text-label-md text-muted-foreground">남은 시간</span>
            </div>
            <div className="h-2 overflow-hidden rounded-[4px] bg-yellow-soft">
              <div
                className="h-full rounded-[4px] bg-yellow transition-[width] duration-1000 ease-linear"
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
          </div>

          <p className="text-label-lg text-ink">{q.prompt}</p>

          <p className="text-label-lg text-ink tabular-nums">
            제출&nbsp;&nbsp;{q.submitted} / {total}
          </p>

          {shown.length > 0 && (
            <div className="flex items-center gap-1.5">
              {shown.map((s) => (
                <StudentAvatar key={s.id} avatar={s.avatar} size={30} className="shrink-0" />
              ))}
              {unsubmittedCount > 0 && (
                <span className="text-label-md text-ink-disabled">미제출 {unsubmittedCount}명</span>
              )}
            </div>
          )}

          {q.type !== "essay" && counts.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {counts.map((n, i) => {
                const choice = q.choices[i];
                if (!choice) return null;

                return (
                  <li key={choice.key} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-md text-label-lg",
                        CHOICE_CLASS[choice.key].solid,
                      )}
                    >
                      {choice.key}
                    </span>
                    <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className={cn("block h-full rounded-full", CHOICE_CLASS[choice.key].bar)}
                        style={{ width: `${maxCount > 0 ? (n / maxCount) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right text-label-lg text-muted-foreground tabular-nums">
                      {n}명
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <PttButton
          onRecorded={onHint}
          onError={onHintError}
          uploading={hintUploading}
          className="h-14 w-full rounded-2xl border-[1.5px] border-mint text-label-lg text-mint-dark"
        />

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onEndCurrent}
            disabled={pending}
            className="h-[52px] flex-1 rounded-2xl border text-label-lg text-ink transition-colors hover:bg-muted disabled:opacity-60"
          >
            바로 마감
          </button>
          <button
            type="button"
            onClick={isLastQuestion ? onEndSession : onNext}
            disabled={pending}
            className="h-[52px] flex-1 rounded-2xl bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
          >
            {isLastQuestion ? "세션 종료" : "다음 문항 →"}
          </button>
        </div>

        {errorMessage && (
          <p role="alert" className="text-label-md text-negative">
            {errorMessage}
          </p>
        )}

        <div className="flex items-center justify-between px-1 pt-1">
          <button
            type="button"
            onClick={onToggleLock}
            disabled={pending}
            aria-pressed={isLocked}
            className={cn(
              "text-label-lg transition-colors disabled:opacity-60",
              isLocked ? "text-mint-dark" : "text-muted-foreground hover:text-ink",
            )}
          >
            {isLocked ? "학생 화면 잠금 해제" : "학생 화면 잠금"}
          </button>
          {/* 마지막 문항이면 위 주 버튼이 이미 "세션 종료"라 같은 조작을 두 번 두지 않는다 */}
          {!isLastQuestion && (
            <button
              type="button"
              onClick={onEndSession}
              disabled={pending}
              className="text-label-lg text-negative transition-colors hover:opacity-80 disabled:opacity-60"
            >
              세션 종료
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

/** 초 → "00 : 23" (웹 타이머와 같은 표기) */
function formatClock(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")} : ${String(safe % 60).padStart(2, "0")}`;
}
