import { cn } from "@/lib/utils";

/** 세로 막대의 최소 높이(미진행 문항) */
const BASE_HEIGHT = 4;
/** 가로 막대(접힘 레일)의 100% 길이 — 시안이 정답률 × 0.4px로 그린다 */
const ROW_MAX_WIDTH = 40;

/**
 * 정답률 구간별 색. 경계 60/80은 W-12 레일의 막대 8개(50·55·58·67·67·74·81·90%) 색과
 * 모두 맞아떨어진다 — 시안에서 역산한 값이라 확정은 아니다.
 */
function toBarClass(value: number | null): string {
  if (value === null) return "bg-line-soft";
  if (value < 60) return "bg-negative-soft";
  if (value < 80) return "bg-mint-tint";
  return "bg-mint";
}

/** 소프트레드 막대만 라벨도 같은 계열로 어둡게 쓴다(시안 W-12 기준) */
function toLabelClass(value: number | null): string {
  return value !== null && value < 60 ? "text-negative-soft-foreground" : "text-ink-disabled";
}

type Props = {
  /** 문항별 정답률(%). 아직 풀지 않은 문항은 null — 시안은 4px 회색 막대로 남긴다 */
  values: (number | null)[];
  /** 100%일 때의 막대 높이. 시안은 W-06 레일 62px, W-12 레일 68px */
  maxHeight?: number;
};

/** 레일 하단의 문항별 정답률 세로 막대 (W-06 랭킹 레일 · W-12 세션 요약 레일) */
export function AccuracyMiniChart({ values, maxHeight = 62 }: Props) {
  return (
    <ol className="flex items-end gap-3" aria-label="문항별 정답률">
      {values.map((value, i) => (
        <li key={i} className="flex flex-col items-center gap-1.5">
          <span
            aria-label={value === null ? `${i + 1}번 미진행` : `${i + 1}번 ${value}%`}
            className={cn("w-5 rounded-sm", toBarClass(value))}
            style={{
              height:
                value === null
                  ? BASE_HEIGHT
                  : BASE_HEIGHT + (value / 100) * (maxHeight - BASE_HEIGHT),
            }}
          />
          <span className={cn("text-label-md", toLabelClass(value))}>{i + 1}</span>
        </li>
      ))}
    </ol>
  );
}

/** 접힘 레일(72px)용 가로 막대 — 문항 번호를 오른쪽에 붙인다 */
export function AccuracyMiniRows({ values }: { values: (number | null)[] }) {
  return (
    <ol className="flex flex-col gap-6" aria-label="문항별 정답률">
      {values.map((value, i) => (
        <li key={i} className="flex items-center gap-2.5">
          <span
            aria-label={value === null ? `${i + 1}번 미진행` : `${i + 1}번 ${value}%`}
            className={cn("h-3.5 rounded-full", toBarClass(value))}
            style={{ width: value === null ? 4 : (value / 100) * ROW_MAX_WIDTH }}
          />
          <span className="text-label-md text-ink-disabled">{i + 1}</span>
        </li>
      ))}
    </ol>
  );
}
