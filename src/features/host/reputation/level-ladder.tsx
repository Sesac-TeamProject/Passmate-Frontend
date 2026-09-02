import Image from "next/image";
import { LEVEL_TITLE } from "@/lib/host-level";
import { cn } from "@/lib/utils";

/** 레벨별 혜택 한 줄 — 시안 813:8820·8832·8843·8853·8868 */
const LEVEL_PERK: Record<number, string> = {
  1: "방 개설",
  2: "프로필 뱃지 표시",
  3: "유료 방 개설",
  4: "방 목록 상단 노출",
  5: "브랜디드 퀴즈 제안",
};
const LEVELS = [1, 2, 3, 4, 5];

type Props = {
  currentLevel: number;
  /** 다음 레벨까지 진행률(%) — 현재 칸 위 말풍선 */
  progress: number;
  /** "2026-08-10 Lv.3 달성 · 한 번 달성하면 내려가지 않아요" */
  achievedLabel: string;
};

/** W-14 레벨 사다리 — 5단계 엠블럼 + 진행선 (시안 813:8805) */
export function LevelLadder({ currentLevel, progress, achievedLabel }: Props) {
  // 채워진 길이는 현재 칸까지 + 다음 칸으로 가는 진행률만큼 (칸 사이는 균등)
  const step = 100 / (LEVELS.length - 1);
  const filled = Math.min(100, (currentLevel - 1) * step + (progress / 100) * step);

  return (
    <section className="flex flex-col gap-6 rounded-2xl border bg-card px-6 pt-16 pb-5">
      <div className="relative">
        <span className="absolute top-[26px] right-[10%] left-[10%] h-1.5 rounded-full bg-line-soft">
          <span className="block h-full rounded-full bg-mint" style={{ width: `${filled}%` }} />
        </span>
        <span
          className="absolute -top-2.5 flex h-5.5 w-[42px] -translate-x-1/2 items-center justify-center rounded-[7px] bg-mint text-label-md text-white"
          style={{ left: `${10 + (filled / 100) * 80}%` }}
        >
          {progress}%
        </span>

        <ol className="relative flex items-start justify-between">
          {LEVELS.map((level) => (
            <li key={level} className="flex w-40 flex-col items-center gap-2">
              <span
                className={cn(
                  "flex size-18 items-center justify-center rounded-full",
                  level === currentLevel && "ring-2 ring-mint",
                )}
              >
                {/* Next 이미지 최적화기는 SVG를 기본 차단한다 — 우리 자산이라 그대로 내보낸다 */}
                <Image
                  src={`/reputation/level-${level}.svg`}
                  alt=""
                  width={56}
                  height={56}
                  unoptimized
                  className={cn("size-14", level > currentLevel && "opacity-40")}
                />
              </span>
              <span
                className={cn(
                  "text-label-md",
                  level === currentLevel
                    ? "text-ink"
                    : level < currentLevel
                      ? "text-muted-foreground"
                      : "text-ink-disabled",
                )}
              >
                Lv.{level} {LEVEL_TITLE[level as 1 | 2 | 3 | 4 | 5]}
              </span>
              <span
                className={cn(
                  "text-label-md",
                  level > currentLevel ? "text-ink-disabled" : "text-mint-dark",
                )}
              >
                {LEVEL_PERK[level]}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-center text-label-md text-ink-disabled">{achievedLabel}</p>
    </section>
  );
}
