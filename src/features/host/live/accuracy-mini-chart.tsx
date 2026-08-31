import { cn } from "@/lib/utils";

/** 막대 최소 높이(미진행 문항)와 100%일 때 더해지는 높이 — 시안 4px ~ 62px */
const BASE_HEIGHT = 4;
const RANGE = 58;

/**
 * 정답률 구간별 색. 시안이 값을 두 개(53%대 소프트레드 · 67%대 민트틴트)만 보여 줘서
 * 경계는 60/80으로 잡았다 — 디자이너 확인 대상.
 */
function toBarClass(value: number | null): string {
  if (value === null) return "bg-line-soft";
  if (value < 60) return "bg-negative-soft";
  if (value < 80) return "bg-mint-tint";
  return "bg-mint";
}

type Props = {
  /** 문항별 정답률(%). 아직 풀지 않은 문항은 null — 시안은 4px 회색 막대로 남긴다 */
  values: (number | null)[];
};

/** 레일 하단의 문항별 정답률 미니 막대 (W-06 랭킹 레일 · W-12 세션 요약 레일 공통) */
export function AccuracyMiniChart({ values }: Props) {
  return (
    <ol className="flex items-end gap-3" aria-label="문항별 정답률">
      {values.map((value, i) => (
        <li key={i} className="flex flex-col items-center gap-1.5">
          <span
            aria-label={value === null ? `${i + 1}번 미진행` : `${i + 1}번 ${value}%`}
            className={cn("w-5 rounded-sm", toBarClass(value))}
            style={{ height: value === null ? BASE_HEIGHT : BASE_HEIGHT + (value / 100) * RANGE }}
          />
          <span className="text-label-md text-ink-disabled">{i + 1}</span>
        </li>
      ))}
    </ol>
  );
}
