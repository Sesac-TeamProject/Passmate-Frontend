import { cn } from "@/lib/utils";

/**
 * 선택지 행의 세 가지 상태.
 * - default: 테두리 원 + 회색 막대
 * - correct: 민트 배경 + 민트 원 + "정답" 칩
 * - commonWrong: 소프트레드 배경 + 소프트레드 원 + "많이 고른 오답" 칩
 */
export type ChoiceRowState = "default" | "correct" | "commonWrong";

const STATE = {
  default: {
    row: "",
    num: "border-[1.5px] text-muted-foreground",
    count: "text-muted-foreground",
    bar: "bg-border",
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

type Props = {
  /** 1-based 보기 번호 — 시안은 A~D 문자가 아니라 번호 원을 쓴다 */
  no: number;
  text: string;
  count: number;
  /** 막대 길이의 기준이 되는 최다 응답 수 */
  maxCount: number;
  state: ChoiceRowState;
};

/**
 * 응답 분포 한 줄 (W-05 진행 · W-06 결과 공통).
 * 배경 하이라이트는 콘텐츠보다 좌우 12px씩 넓게 나간다(시안 992 vs 980).
 */
export function ChoiceRow({ no, text, count, maxCount, state }: Props) {
  const s = STATE[state];
  const ratio = maxCount > 0 ? count / maxCount : 0;

  return (
    <li className={cn("-mx-3 flex items-start gap-3.5 rounded-[18px] px-3 py-2.5", s.row)}>
      <span
        className={cn(
          "flex size-[34px] shrink-0 items-center justify-center rounded-full text-label-lg font-bold",
          s.num,
        )}
      >
        {no}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
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

        <div className="h-5 rounded-[10px] bg-line-soft">
          <div
            className={cn("h-full rounded-[10px]", s.bar)}
            style={{ width: `${Math.round(ratio * 100)}%` }}
          />
        </div>
      </div>
    </li>
  );
}
