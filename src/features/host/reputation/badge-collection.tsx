import Image from "next/image";
import type { BadgeType } from "@/lib/types/dto";
import { cn } from "@/lib/utils";

/** 8종 뱃지 표기 — 그림이 있는 것은 svg, 없는 것은 글자 하나로 세운다 (시안 810:8800) */
const BADGE: Record<BadgeType, { label: string; art: { src: string } | { glyph: string } }> = {
  FIRST_ROOM: { label: "첫 방 개설", art: { src: "/reputation/badge-first-room.svg" } },
  ROOMS_10: { label: "방 10회 운영", art: { glyph: "10" } },
  STUDENTS_100: { label: "학생 100명", art: { src: "/reputation/badge-students-100.svg" } },
  RATING_45: { label: "평가 4.5+", art: { src: "/reputation/badge-rating-45.svg" } },
  ACTIVE_30D: { label: "30일 연속", art: { src: "/reputation/badge-streak-30.svg" } },
  RATINGS_50: { label: "평가 50개", art: { glyph: "50" } },
  FIRST_PAID_ROOM: { label: "유료 방 첫 개설", art: { glyph: "₩" } },
  AI_SETS_50: { label: "AI 세트 50개", art: { src: "/reputation/badge-ai-sets-50.svg" } },
};

/** 시안이 세우는 순서 — 획득한 것부터 왼쪽 */
const ORDER: BadgeType[] = [
  "FIRST_ROOM",
  "ROOMS_10",
  "STUDENTS_100",
  "RATING_45",
  "ACTIVE_30D",
  "RATINGS_50",
  "FIRST_PAID_ROOM",
  "AI_SETS_50",
];

type Props = {
  /** 획득한 뱃지 종류. 나머지는 잠김으로 흐리게 그린다 */
  earned: Set<BadgeType>;
};

/** W-14 뱃지 컬렉션 — 8종 중 획득한 것만 또렷하게 (시안 810:8800) */
export function BadgeCollection({ earned }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-heading-sm text-ink">뱃지 컬렉션</h2>
        <span className="text-label-md text-ink-disabled">
          {earned.size} / {ORDER.length}
        </span>
      </div>

      {/* 시안 810:8800 — 위 23 · 아래 15, 목록과 안내문 사이 16 */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-card px-6 pt-[23px] pb-[15px]">
        <ul className="flex justify-between">
          {ORDER.map((type) => (
            <BadgeItem key={type} type={type} earned={earned.has(type)} />
          ))}
        </ul>
        <p className="text-label-md text-ink-disabled">뱃지는 프로필과 방 목록 카드에 표시돼요</p>
      </div>
    </section>
  );
}

function BadgeItem({ type, earned }: { type: BadgeType; earned: boolean }) {
  const { label, art } = BADGE[type];

  return (
    <li className="flex w-27 flex-col items-center gap-2.5">
      <span className={cn("block size-16", !earned && "opacity-28")}>
        {"src" in art ? (
          <Image src={art.src} alt="" width={64} height={64} unoptimized className="size-16" />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-2xl border-2 border-mint-line bg-mint-bg text-heading-md text-mint-dark">
            {art.glyph}
          </span>
        )}
      </span>
      <span
        className={cn(
          "text-center text-label-md",
          earned ? "text-muted-foreground" : "text-ink-disabled",
        )}
      >
        {label}
      </span>
      {!earned && <span className="text-label-md text-ink-disabled">잠김</span>}
    </li>
  );
}
