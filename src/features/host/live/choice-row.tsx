import { cn } from "@/lib/utils";

/**
 * 선택지 행의 상태.
 * - default: 테두리 원 + 회색 막대
 * - leading: 아직 정답을 공개하기 전, 지금 가장 많이 고른 보기 (W-05)
 * - correct: 정답 (W-06)
 * - commonWrong: 정답을 뺀 보기 중 최다 응답 (W-06)
 */
export type ChoiceRowState = "default" | "leading" | "correct" | "commonWrong";

const STATE = {
  default: {
    row: "",
    num: "border-[1.5px] text-muted-foreground",
    count: "text-muted-foreground",
    bar: "bg-border",
    chip: null,
  },
  leading: {
    row: "bg-mint-bg",
    num: "border-2 border-mint bg-card text-mint-dark",
    count: "text-mint-dark",
    bar: "bg-mint",
    chip: null,
  },
  correct: {
    row: "bg-mint-bg",
    num: "bg-mint text-white",
    count: "text-mint-dark",
    bar: "bg-mint",
    chip: { label: "정답", className: "bg-mint text-white" },
  },
  commonWrong: {
    row: "bg-negative-bg",
    num: "bg-negative-soft text-negative-soft-foreground",
    count: "text-negative-soft-foreground",
    bar: "bg-negative-soft",
    chip: { label: "많이 고른 오답", className: "bg-negative-soft text-negative-soft-foreground" },
  },
} as const satisfies Record<ChoiceRowState, unknown>;

/**
 * 진행 화면과 결과 화면은 같은 행을 쓰지만 밀도가 다르다.
 * - live: 원 38px + 3px 얇은 진행선 (아직 결과가 아니라 흐름만 보여 준다)
 * - result: 원 34px + 20px 막대
 */
const VARIANT = {
  live: { num: "size-[38px] text-heading-sm", bar: "h-[3px] rounded-sm", gap: "gap-3" },
  result: { num: "size-[34px] text-label-lg", bar: "h-5 rounded-[10px]", gap: "gap-2" },
} as const;

type Props = {
  /** 1-based 보기 번호 — 시안은 A~D 문자가 아니라 번호 원을 쓴다 */
  no: number;
  text: string;
  count: number;
  /** 막대 길이의 기준이 되는 최다 응답 수 */
  maxCount: number;
  state: ChoiceRowState;
  variant?: keyof typeof VARIANT;
};

/**
 * 응답 분포 한 줄 (W-05 진행 · W-06 결과 공통).
 * 배경 하이라이트는 콘텐츠보다 좌우 12px씩 넓게 나간다(시안 992 vs 980).
 */
export function ChoiceRow({ no, text, count, maxCount, state, variant = "result" }: Props) {
  const s = STATE[state];
  const v = VARIANT[variant];
  const ratio = maxCount > 0 ? count / maxCount : 0;

  return (
    <li className={cn("-mx-3 flex items-start gap-3.5 rounded-[18px] px-3 py-2.5", s.row)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-bold",
          v.num,
          s.num,
        )}
      >
        {no}
      </span>

      <div className={cn("flex min-w-0 flex-1 flex-col", v.gap)}>
        <div className="flex items-center gap-3.5">
          <span className="min-w-0 truncate text-heading-lg">{text}</span>
          {s.chip && (
            <span
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-label-md font-bold",
                s.chip.className,
              )}
            >
              {s.chip.label}
            </span>
          )}
          <span className={cn("ml-auto shrink-0 text-body-md font-bold", s.count)}>{count}명</span>
        </div>

        <div className={cn("bg-line-soft", v.bar)}>
          <div
            className={cn("h-full", v.bar, s.bar)}
            style={{ width: `${Math.round(ratio * 100)}%` }}
          />
        </div>
      </div>
    </li>
  );
}
