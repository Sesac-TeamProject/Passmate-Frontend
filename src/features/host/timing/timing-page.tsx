import { Clock } from "lucide-react";
import { Stepper } from "@/components/common/stepper";
import { Switch } from "@/components/ui/switch";
import { PendingLabel } from "@/components/common/pending-label";
import { QuestionTypeChip } from "@/features/host/editor/question-type-chip";
import type { QuestionType } from "@/features/host/types";
import { cn } from "@/lib/utils";

/** 일괄 적용 프리셋(초) */
export const TIME_PRESETS = [20, 30, 45, 60, 90];

const MIN_SEC = 5;
const MAX_SEC = 600;
const STEP_SEC = 5;

export type TimingRow = {
  questionId: number;
  no: number;
  body: string;
  type: QuestionType;
  timeLimitSec: number;
  autoAdvance: boolean;
};

/** 초 합계 → "약 6분 20초" */
function formatEstimate(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (minutes === 0) return `약 ${seconds}초`;
  return seconds === 0 ? `약 ${minutes}분` : `약 ${minutes}분 ${seconds}초`;
}

type Props = {
  title: string;
  rows: TimingRow[];
  /** 마지막으로 일괄 적용한 프리셋. 없으면 아무것도 선택돼 있지 않다 */
  preset: number | null;
  onPreset: (sec: number) => void;
  onApplyPreset: () => void;
  onChangeTime: (questionId: number, sec: number) => void;
  onToggleAuto: (questionId: number, next: boolean) => void;
  onSave: () => void;
  saving?: boolean;
  errorMessage?: string | null;
};

/** W-02b 문항별 시간 설정 — 일괄 적용 · 문항 목록 · 예상 진행 시간 세 카드 */
export function TimingPage({
  title,
  rows,
  preset,
  onPreset,
  onApplyPreset,
  onChangeTime,
  onToggleAuto,
  onSave,
  saving = false,
  errorMessage = null,
}: Props) {
  const totalSec = rows.reduce((sum, r) => sum + r.timeLimitSec, 0);

  return (
    <main className="flex flex-col gap-4 px-9 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-heading-lg">문항별 시간 설정</h1>
        <p className="text-body-md text-muted-foreground">
          {title} · {rows.length}문항
        </p>
      </header>

      <section className="mt-2 flex items-center gap-6 rounded-[20px] border bg-card p-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-heading-sm font-bold">모든 문항 한 번에</h2>
          <p className="text-body-md text-muted-foreground">개별로 바꾼 문항은 그대로 둡니다</p>
        </div>
        <ul className="ml-auto flex items-center gap-3">
          {TIME_PRESETS.map((sec) => (
            <li key={sec}>
              <button
                type="button"
                onClick={() => onPreset(sec)}
                aria-pressed={preset === sec}
                className={cn(
                  "h-11 w-21 rounded-xl text-label-lg font-bold transition-colors",
                  preset === sec
                    ? "border-2 border-mint bg-mint-bg text-mint-dark"
                    : "border-[1.5px] hover:bg-muted",
                )}
              >
                {sec}초
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onApplyPreset}
          disabled={preset === null}
          className="h-11 w-41 rounded-xl bg-mint text-label-lg font-bold text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
        >
          일괄 적용
        </button>
      </section>

      <section className="rounded-[20px] border bg-card p-6">
        <div className="flex items-center border-b pb-3.5 text-label-md font-bold tracking-[0.08em] text-ink-disabled">
          <span className="flex-1">문항</span>
          <span className="w-24">유형</span>
          <span className="w-[190px]">제한 시간</span>
          <span className="w-24">자동 넘김</span>
        </div>

        <ul className="flex flex-col">
          {rows.map((row) => (
            <li
              key={row.questionId}
              className="flex items-center border-b border-line-soft py-4 last:border-b-0"
            >
              <span className="flex min-w-0 flex-1 items-center gap-5">
                <span className="w-6 shrink-0 text-label-lg font-bold text-ink-disabled">
                  {String(row.no).padStart(2, "0")}
                </span>
                <span className="min-w-0 truncate text-heading-sm">{row.body}</span>
              </span>
              <span className="w-24">
                <QuestionTypeChip type={row.type} />
              </span>
              <span className="w-[190px]">
                <Stepper
                  value={row.timeLimitSec}
                  onChange={(next) => onChangeTime(row.questionId, next)}
                  min={MIN_SEC}
                  max={MAX_SEC}
                  step={STEP_SEC}
                  unit="초"
                  label={`${row.no}번 문항 제한 시간`}
                />
              </span>
              <span className="w-24">
                <Switch
                  checked={row.autoAdvance}
                  onCheckedChange={(next) => onToggleAuto(row.questionId, next)}
                  aria-label={`${row.no}번 문항 자동 넘김`}
                />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex items-center gap-4 rounded-[20px] border bg-card px-6 py-4">
        <Clock aria-hidden className="size-5 shrink-0 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-body-md text-muted-foreground">예상 진행 시간</span>
          <span className="text-heading-md">
            {rows.length}문항 · {formatEstimate(totalSec)}
          </span>
        </div>
        <p className="ml-10 text-body-md text-muted-foreground">서술형은 기본 90초로 잡혀 있어요</p>
        {errorMessage && (
          <p role="alert" className="ml-auto text-body-md text-negative">
            {errorMessage}
          </p>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={cn(
            "h-11 w-41 rounded-xl bg-mint text-label-lg font-bold text-white transition-colors hover:bg-mint-dark disabled:opacity-60",
            errorMessage ? "ml-6" : "ml-auto",
          )}
        >
          {saving ? <PendingLabel>저장하는 중…</PendingLabel> : "저장"}
        </button>
      </section>
    </main>
  );
}
