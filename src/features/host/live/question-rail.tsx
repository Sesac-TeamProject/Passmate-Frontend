import { cn } from "@/lib/utils";

type Props = {
  /** 1-based 현재 문항 번호. `completed`면 무시된다 */
  current: number;
  total: number;
  /** 세션이 끝나 모든 문항이 완료 상태일 때 (W-12) — 현재 강조 대신 전부 밑줄만 깐다 */
  completed?: boolean;
};

/**
 * 프로젝터 헤더의 문항 레일 (W-05·W-06·W-12 공통).
 * 시안 규칙: 지난 문항 회색 · 현재만 크게 민트 · 남은 문항 흐리게.
 */
export function QuestionRail({ current, total, completed = false }: Props) {
  return (
    <ol
      className="flex items-center gap-3.5"
      aria-label={completed ? `전체 ${total}문항` : `${total}문항 중 ${current}번째`}
    >
      {Array.from({ length: total }, (_, i) => {
        const no = i + 1;
        const label = String(no).padStart(2, "0");

        if (completed) {
          return (
            <li key={no} className="flex w-8 flex-col items-center gap-2">
              <span className="text-body-md font-medium text-ink-disabled">{label}</span>
              <span aria-hidden className="h-0.5 w-6 rounded-sm bg-mint-tint" />
            </li>
          );
        }

        if (no === current) {
          return (
            <li
              key={no}
              aria-current="step"
              className="flex h-[34px] w-12 items-center justify-center rounded-xl bg-mint-bg text-heading-md text-mint-dark"
            >
              {label}
            </li>
          );
        }

        return (
          <li
            key={no}
            className={cn(
              "w-8 text-center text-body-md font-medium",
              no < current ? "text-muted-foreground" : "text-ink-disabled",
            )}
          >
            {label}
          </li>
        );
      })}
    </ol>
  );
}
